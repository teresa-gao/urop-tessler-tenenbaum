Genex Analysis: Fall 2020 Prolific pilots
================
Teresa Gao
10 December 2020

# About

This R Notebook reports data from a final round of pilot experiments run
during Fall 2020 on Prolific (via proliferate).

# Setup

## Imports

Load required libraries

``` r
library("tidyverse")
```

    ## -- Attaching packages --------------------------------------- tidyverse 1.3.0 --

    ## v ggplot2 3.3.2     v purrr   0.3.4
    ## v tibble  3.0.3     v dplyr   1.0.2
    ## v tidyr   1.1.2     v stringr 1.4.0
    ## v readr   1.3.1     v forcats 0.5.0

    ## -- Conflicts ------------------------------------------ tidyverse_conflicts() --
    ## x dplyr::filter() masks stats::filter()
    ## x dplyr::lag()    masks stats::lag()

``` r
library("tidyboot")
library("tidytext")
```

    ## Warning: package 'tidytext' was built under R version 4.0.3

``` r
library("brms")
```

    ## Warning: package 'brms' was built under R version 4.0.3

    ## Loading required package: Rcpp

    ## Loading 'brms' package (version 2.14.0). Useful instructions
    ## can be found by typing help('brms'). A more detailed introduction
    ## to the package is available through vignette('brms_overview').

    ## 
    ## Attaching package: 'brms'

    ## The following object is masked from 'package:stats':
    ## 
    ##     ar

If running/editing in RStudio, go to **Session \> Set Working Directory
\> To Source File Location**. This ensures that we can find and access
the files we need\!

Import data from “pilot 3” (first, smaller part of pilots with acc1,
acc2, ped1, ped2, generic, and gen+ped)

``` r
p3_streamlined_data <- read.csv("../../../prolific/2020-fall/pilot-3/genex-pilot-3-streamlined_data.csv")
p3_participant_demographics <- read.csv("../../../prolific/2020-fall/pilot-3/genex-pilot-3-subject_information.csv")
p3_response_data <- read.csv("../../../prolific/2020-fall/pilot-3/genex-pilot-3-full_response_data.csv") %>%
  filter(type != "introduction")
```

“Pilot 3” had 80 total participants.

Import data from “pilot 4” (second, larger part of pilots with acc1,
acc2, ped1, ped2, generic, and gen+ped) and “pilot 5” (ped3, ped4, gen,
and gen+ped)

``` r
p4_streamlined_data <- read.csv("../../../prolific/2020-fall/pilot-4/genex-pilot-4-streamlined_data.csv")
p4_participant_demographics <- read.csv("../../../prolific/2020-fall/pilot-4/genex-pilot-4-subject_information.csv")

p5_streamlined_data <- read.csv("../../../prolific/2020-fall/pilot-5/genex-pilot-5-streamlined_data.csv")
p5_participant_demographics <- read.csv("../../../prolific/2020-fall/pilot-5/genex-pilot-5-subject_information.csv")
```

“Pilot 4” had 170 total participants.

## Reformatting

Reformat catch trial data (botcaptcha and sound check) from “pilot 3”

``` r
# data frame for all catch trials before experiment
p3_catch_data <- p3_response_data %>%
  filter( type == "attention" ) %>%
  select( workerid,
          correct_answer,
          duration,
          responses,
          prompt,
          num_fails )

# data frame for sound check trials
p3_sound_check <- p3_catch_data %>%
  filter( prompt == "Please adjust your system volume to a comfortable level. When you are ready, click the Test button. You will hear a word like \"skyscraper\". Enter the word you hear into the box below and click Continue when you are finished." ) %>%
  rename( sound_check_correct_answer = correct_answer,
          sound_check_duration = duration,
          sound_check_response = responses ) %>%
  select(-prompt)
  # TODO: extract first response in list of sound responses

# data frame for botcaptcha trials
p3_botcaptcha <- p3_catch_data %>%
  filter( prompt != "Please adjust your system volume to a comfortable level. When you are ready, click the Test button. You will hear a word like \"skyscraper\". Enter the word you hear into the box below and click Continue when you are finished." ) %>%
  rename( botcaptcha_n_fails = num_fails,
          botcaptcha_correct_answer = correct_answer,
          botcaptcha_duration = duration,
          botcaptcha_response = responses ) %>%
  select(-prompt)
```

Reformat followup response data (predicted probability, character
arrival, freeform followup, name identification, generic endorsement)
from “pilot 3”

``` r
# data frame for all followup responses after experiment
p3_followup_data <- p3_response_data %>%
  filter( type != "attention" ) %>%
  select( workerid,
          correct_answer,
          duration,
          is_correct,
          response,
          response_type,
          prompt )

# data frame for predicted probability followup
p3_predicted_probability <- p3_followup_data %>%
  filter( response_type == "slider" ) %>%
  rename( predicted_probability_correct_answer = correct_answer,
          predicted_probability_duration = duration,
          predicted_probability_is_correct = is_correct,
          predicted_probability_response = response ) %>%
  subset(select=-c(response_type, prompt))

# data frame for character arrival followup
p3_character_arrival <- p3_followup_data %>%
    filter( prompt == "Please refer to the image below. Is this character a new researcher who just arrived here, or have they been doing research on this planet for a while?" ) %>%
  rename( character_arrival_correct_answer = correct_answer,
          character_arrival_duration = duration,
          character_arrival_is_correct = is_correct,
          character_arrival_response = response ) %>%
  subset( select=-c(response_type, prompt) )

# data frame for freeform followup
p3_freeform_followup <- p3_followup_data %>%
  filter( response_type == "freeform" ) %>%
  rename( freeform_followup_correct_answer = correct_answer,
          freeform_followup_duration = duration,
          freeform_followup_is_correct = is_correct,
          freeform_followup_response = response ) %>%
  subset( select=-c(response_type, prompt) )

# data frame for name identification followup
p3_name_identification <- p3_followup_data %>%
  filter( response_type == "grid" ) %>%
  rename( name_identification_correct_answer = correct_answer,
          name_identification_duration = duration,
          name_identification_is_correct = is_correct,
          name_identification_response = response ) %>%
  subset( select=-c(response_type, prompt) )

# data frame for generic endorsement followup
p3_generic_endorsement <- p3_followup_data %>%
  filter( prompt == "Would you say the following is true?" ) %>%
  rename( generic_endorsement_correct_answer = correct_answer,
          generic_endorsement_duration = duration,
          generic_endorsement_is_correct = is_correct,
          generic_endorsement_response = response ) %>%
  subset( select=-c(response_type, prompt) )
```

## Combining

Add above data frames to form “pilot 3” streamlined data.

``` r
p3_streamlined_data <- Reduce( function(x, y) merge(x, y, all=TRUE, by="workerid"),
                               
                               # select relevant columns from existing "pilot 3" streamlined data
                               list( p3_streamlined_data %>%
                                       select( workerid,
                                               proliferate.condition,
                                               agent,
                                               followup_fails,
                                               item_name,
                                               item_presentation_condition,
                                               n_examples,
                                               object,
                                               speaker ),
                                     
                                     # join previously created data frames from attention checks and followups by workerid
                                     p3_predicted_probability,
                                     p3_character_arrival,
                                     p3_freeform_followup,
                                     p3_name_identification,
                                     p3_generic_endorsement,
                                     p3_botcaptcha,
                                     p3_sound_check ) ) %>%
  
                        # add object property given by object
                        mutate( property = ifelse(object == "bird", "green feathers",
                                                  ifelse(object == "artifact", "squeaking",
                                                         ifelse(object == "flower", "purple petals", NA))) )
```

Join all streamlined data

``` r
streamlined_data <- plyr::rbind.fill(p3_streamlined_data, p4_streamlined_data, p5_streamlined_data) %>%
  mutate( predicted_probability_response = as.numeric(as.character(predicted_probability_response))) %>% # convert string numbers to numbers
  mutate( name_identification_is_correct = as.logical(name_identification_is_correct) ) %>% # convert "True" to TRUE and "False" to FALSE
  mutate( character_arrival_is_correct = as.logical(character_arrival_is_correct) ) %>% # convert "True" to TRUE and "False" to FALSE
  mutate( exp_cond = factor(paste(item_presentation_condition, n_examples, sep = "_") ) )

write.csv(streamlined_data, "streamlined_data.csv")

# append some streamlined data to demographic info to determine which to exclude
participant_demographics <- bind_rows(p3_participant_demographics, p4_participant_demographics, p5_participant_demographics) %>%
  merge( subset( streamlined_data, select=c( workerid,
                                             botcaptcha_n_fails,
                                             sound_check_correct_answer,
                                             sound_check_response,
                                             followup_fails ) ), by="workerid" )
```

Preprocess data by removing participants who failed botcaptcha or any
followup attention checks.

``` r
# TODO: for sound check, exclude participants who answered with "skyscraper", a distractor word on the screen

# TODO: for botcaptcha, ignore fails with extra spaces and recompute n_fails

# remove participants who failed the botcaptcha or any followup attention checks
filtered_data <- streamlined_data %>%
  filter( botcaptcha_n_fails == 0 ) %>%
  filter( followup_fails == 0 )
```

Out of 400 total participants, 25 were excluded based on their responses
to the botcaptcha and the followup attention checks. In these excluded
participants, 7 failed the botcaptcha at least once, 4 answered the name
identification followup attention check incorrectly, and 15 answered the
character arrival followup attention check incorrectly.

Writing only necessary predicted probability data to a clean CSV.

``` r
# create preprocessed data frame for Bayesian analysis
bayes_preprocessed <- filtered_data %>%
  select( workerid,
          item_presentation_condition,
          n_examples,
          object,
          item_name,
          property,
          predicted_probability_response ) %>%
  rename( kind_type = object,
          kind_label = item_name,
          feature_label = property,
          response = predicted_probability_response ) %>%
  mutate( condition = factor( paste(n_examples, item_presentation_condition, sep="") ) ) %>%
  mutate( avoided_endval = ifelse(response == 1, 0.999, ifelse(response == 0, 0.001, response)) ) %>% # avoid 1 and 0 values via reassignment
  subset( select=-c(item_presentation_condition, n_examples) ) # remove unnecessary columns

write.csv(bayes_preprocessed, "bayes_preprocessed.csv")
```

# Calculations

## Calculations and Relabeling

Compute bootstrapped means and confidence intervals of user slider
response

``` r
predicted_probability_CIs <- filtered_data %>%
  dplyr::group_by(exp_cond, item_presentation_condition, n_examples) %>%
  tidyboot_mean(column = predicted_probability_response)
```

    ## Warning: Problem with `mutate()` input `strap`.
    ## i `as_data_frame()` is deprecated as of tibble 2.0.0.
    ## Please use `as_tibble()` instead.
    ## The signature and semantics have changed, see `?as_tibble`.
    ## This warning is displayed once every 8 hours.
    ## Call `lifecycle::last_warnings()` to see where this warning was generated.
    ## i Input `strap` is `purrr::map(strap, dplyr::as_data_frame)`.

    ## Warning: `as_data_frame()` is deprecated as of tibble 2.0.0.
    ## Please use `as_tibble()` instead.
    ## The signature and semantics have changed, see `?as_tibble`.
    ## This warning is displayed once every 8 hours.
    ## Call `lifecycle::last_warnings()` to see where this warning was generated.

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
predicted_probability_CIs # prints output; line may be omitted
```

    ## # A tibble: 8 x 8
    ## # Groups:   exp_cond, item_presentation_condition [8]
    ##   exp_cond item_presentati~ n_examples     n empirical_stat ci_lower  mean
    ##   <fct>    <chr>                 <int> <int>          <dbl>    <dbl> <dbl>
    ## 1 acciden~ accidental                1    48          0.719    0.665 0.718
    ## 2 acciden~ accidental                2    43          0.776    0.739 0.776
    ## 3 gen+ped~ gen+ped                   1    47          0.849    0.801 0.850
    ## 4 generic~ generic                   1    50          0.926    0.895 0.926
    ## 5 pedagog~ pedagogical               1    47          0.758    0.710 0.758
    ## 6 pedagog~ pedagogical               2    48          0.831    0.780 0.831
    ## 7 pedagog~ pedagogical               3    47          0.867    0.812 0.868
    ## 8 pedagog~ pedagogical               4    45          0.877    0.832 0.876
    ## # ... with 1 more variable: ci_upper <dbl>

``` r
predicted_probability_CIs.preprocessed_item <- bayes_preprocessed %>%
  dplyr::group_by(condition, kind_type, feature_label) %>%
  tidyboot_mean(column = response) %>%
  mutate(kind_type = factor(kind_type, levels = c("bird", "flower", "artifact")))
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
predicted_probability_duration_CIs <- filtered_data %>%
  group_by(exp_cond, item_presentation_condition, n_examples) %>%
  tidyboot_mean(column = predicted_probability_duration)
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
predicted_probability_duration_CIs # prints output; line may be omitted
```

    ## # A tibble: 8 x 8
    ## # Groups:   exp_cond, item_presentation_condition [8]
    ##   exp_cond item_presentati~ n_examples     n empirical_stat ci_lower  mean
    ##   <fct>    <chr>                 <int> <int>          <dbl>    <dbl> <dbl>
    ## 1 acciden~ accidental                1    48          10.5      9.00 10.6 
    ## 2 acciden~ accidental                2    43          10.8      9.56 10.8 
    ## 3 gen+ped~ gen+ped                   1    47           9.79     8.29  9.78
    ## 4 generic~ generic                   1    50          12.1      7.98 12.1 
    ## 5 pedagog~ pedagogical               1    47           9.85     8.57  9.84
    ## 6 pedagog~ pedagogical               2    48          10.5      8.89 10.5 
    ## 7 pedagog~ pedagogical               3    47           8.68     7.80  8.66
    ## 8 pedagog~ pedagogical               4    45           7.88     7.08  7.88
    ## # ... with 1 more variable: ci_upper <dbl>

``` r
generic_endorsement_CIs <- filtered_data %>%
  group_by(exp_cond, item_presentation_condition, n_examples) %>%
  mutate(generic_endorsement = ifelse(generic_endorsement_response == "yes",1,0)) %>%
  tidyboot_mean(column = generic_endorsement)
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
generic_endorsement_CIs # prints output; line may be omitted
```

    ## # A tibble: 8 x 8
    ## # Groups:   exp_cond, item_presentation_condition [8]
    ##   exp_cond item_presentati~ n_examples     n empirical_stat ci_lower  mean
    ##   <fct>    <chr>                 <int> <int>          <dbl>    <dbl> <dbl>
    ## 1 acciden~ accidental                1    48          0.917    0.829 0.918
    ## 2 acciden~ accidental                2    43          0.953    0.872 0.951
    ## 3 gen+ped~ gen+ped                   1    47          1        1     1    
    ## 4 generic~ generic                   1    50          1        1     1    
    ## 5 pedagog~ pedagogical               1    47          1        1     1    
    ## 6 pedagog~ pedagogical               2    48          0.979    0.933 0.980
    ## 7 pedagog~ pedagogical               3    47          0.979    0.929 0.980
    ## 8 pedagog~ pedagogical               4    45          1        1     1    
    ## # ... with 1 more variable: ci_upper <dbl>

# Visualization

## Predicted probability

Gradient density ridges graph of predicted probability of next
encountered object having same property vs. item presentation condition
and number of examples

``` r
ggplot(
  filtered_data,
  mapping = aes(
    x = predicted_probability_response,
    y = exp_cond,
    fill = ..x..
  )
) +
  ggridges::geom_density_ridges_gradient(
    jittered_points = T, alpha = 0.8, scale = 0.95,
    position = ggridges::position_points_jitter(width = 0.01, height = 0),
    point_shape = "|", point_size = 2.5, point_alpha = 0.3,
    rel_min_height = 0.01, gradient_lwd = 1,
    stat = "binline", bins = 25, draw_baseline = F
  ) +
  ggstance::geom_linerangeh(
    predicted_probability_CIs,
    inherit.aes = F,
    mapping = aes(
      xmin = ci_lower, xmax = ci_upper,
      y = as.numeric(exp_cond) + 0.85
    ),
    size = 1.25, color = "black"
  ) + geom_point(
    predicted_probability_CIs,
    inherit.aes = F,
    mapping = aes(
      x = mean,
      y = as.numeric(exp_cond) + 0.85
    ),
    size = 3, color = "black", shape = 3
  ) +
  scale_x_continuous(
    expand = c(0.01, 0),
    limits = c(0, 1.05),
    breaks = c(0, 0.25, 0.5, 0.75, 1)
  ) +
  scale_y_discrete( expand = expand_scale( mult = c(0.01, 0),
                                           add = c(0.01, 1) )
  ) + viridis::scale_fill_viridis(
    breaks = c(0, 1)
  ) +
  guides(fill = F) +
  theme(
    axis.title.y = element_blank(),
    axis.title.x = element_text(hjust = 0.5, vjust = 0)
  ) +
  labs(
    x = "Predicted Probability of Future Instance having Property"
  )
```

    ## Warning: `expand_scale()` is deprecated; use `expansion()` instead.

![](data-analysis_files/figure-gfm/gradient%20density%20-%20predicted%20probability%20vs.%20condition-1.png)<!-- -->

Gradient density ridges graph of *time taken to respond* to predicted
probability of next encountered object having same property vs. item
presentation condition and number of examples

``` r
ggplot(
  filtered_data,
  mapping = aes(
    x = predicted_probability_duration,
    y = exp_cond,
    fill = ..x..
  )
) +
  ggridges::geom_density_ridges_gradient(
    jittered_points = T, alpha = 0.8, scale = 0.95,
    position = ggridges::position_points_jitter(width = 0.01, height = 0),
    point_shape = "|", point_size = 2.5, point_alpha = 0.3,
    rel_min_height = 0.01, gradient_lwd = 1,
    stat = "binline", bins = 25, draw_baseline = F
  ) +
  ggstance::geom_linerangeh(
    predicted_probability_duration_CIs,
    inherit.aes = F,
    mapping = aes(
      xmin = ci_lower, xmax = ci_upper,
      y = as.numeric(exp_cond) + 0.85
    ),
    size = 1.25, color = "black"
  ) + geom_point(
    predicted_probability_duration_CIs,
    inherit.aes = F,
    mapping = aes(
      x = mean,
      y = as.numeric(exp_cond) + 0.85
    ),
    size = 3, color = "black", shape = 3
  ) +
  scale_x_continuous(
    expand = c(0.01, 0),
    breaks = c(0, 0.25, 0.5, 0.75, 1)
  ) +
  scale_y_discrete(expand = c(0.01, 0)) +
  viridis::scale_fill_viridis(
    breaks = c(0, 1)
  ) +
  guides(fill = F) +
  theme(
    axis.title.y = element_blank(),
    axis.title.x = element_text(hjust = 0.5, vjust = 0)
  ) +
  labs(x = "Response time for predicted probability of future instance having property")
```

![](data-analysis_files/figure-gfm/gradient%20density%20-%20predicted%20probability%20time%20vs.%20condition-1.png)<!-- -->

Combined bar plot with error bars for all conditions and item
combinations

``` r
bar.width = 0.7
predicted_probability_CIs.preprocessed_item %>%
  ggplot(., aes(x = condition, fill = kind_type, 
                y = mean, ymin = ci_lower,
                ymax = ci_upper)) +
  geom_hline(data = predicted_probability_CIs %>% filter(item_presentation_condition == "generic"),
             linetype = 2, alpha = 0.4,
             aes(yintercept = ci_lower))+
  geom_hline(data = predicted_probability_CIs %>% filter(item_presentation_condition == "generic"),
             linetype = 2, alpha = 0.4,
             aes(yintercept = ci_upper))+
  geom_col(color = 'black', width = bar.width, position = position_dodge(bar.width),
           alpha = 0.5)+
  geom_linerange( position = position_dodge(bar.width))+
  coord_flip()+
   guides(fill = guide_legend(reverse = T))+
  labs(y = "Probability of Future Instance having Property", x = "",
       fill = "item")+
  theme(legend.position = 'bottom')
```

![](data-analysis_files/figure-gfm/bar%20plot%20-%20all%20grouped%20by%20condition%20and%20colored%20by%20object-1.png)<!-- -->

Facet grid of predicted probability plotted on number of examples
vs. item presentation condition

``` r
ggplot(
  filtered_data,
  mapping = aes(
    x = predicted_probability_response,
    y = (..count..) / tapply(..count.., ..PANEL.., sum)[..PANEL..],
    fill = as.factor(item_presentation_condition)
  )
) +
geom_histogram(
  color = "black",
  bins = 16
) +
labs(
  x = "Slider response",
  y = "Fraction of total count"
) +
facet_grid(
  n_examples ~ item_presentation_condition
) +
scale_fill_manual(
  values = c("indianred2", "lightgoldenrod1", "darkolivegreen2", "#7ad1ff")
) +
theme(legend.position = "none")
```

![](data-analysis_files/figure-gfm/facet%20grid%20-%20predicted%20probability%20on%20num.%20examples%20vs.%20condition-1.png)<!-- -->

Facet grid of predicted probability plotted on item presentation
condition vs. speaker

``` r
ggplot(
  filtered_data,
  mapping = aes(
    x = predicted_probability_response,
    y = (..count..) / tapply(..count.., ..PANEL.., sum)[..PANEL..],
    fill = as.factor(item_presentation_condition)
  )
) +
geom_histogram(
  color = "black",
  bins = 16) +
labs(
  x = "Slider response",
  y = "Fraction of total count"
) +
facet_grid(speaker ~ item_presentation_condition) +
scale_fill_manual(
  values = c("indianred2", "lightgoldenrod1", "darkolivegreen2", "#7ad1ff")
) +
theme(legend.position = "none")
```

![](data-analysis_files/figure-gfm/facet%20grid%20-%20predicted%20probabiliy%20on%20condition%20vs.%20speaker-1.png)<!-- -->

## Followup

Predicted probability of future instance having property vs. endorsement
of generic statement for each item presentation condition and number of
examples

``` r
ggplot(
  merge(
    predicted_probability_CIs %>%
      rename(
        predicted_probability_mean = mean,
        predicted_probability_ci_lower = ci_lower,
        predicted_probability_ci_upper = ci_upper
      ),
    generic_endorsement_CIs %>%
      rename(
        generic_endorsement_mean = mean,
        generic_endorsement_ci_lower = ci_lower,
        generic_endorsement_ci_upper = ci_upper
      ),
    by="exp_cond"
  ),
  mapping = aes(
    x=predicted_probability_mean,
    y=generic_endorsement_mean,
    color=exp_cond
  )
) + geom_errorbar(
  mapping=aes(
    x=predicted_probability_mean,
    ymin=generic_endorsement_ci_lower,
    ymax=generic_endorsement_ci_upper
  ),
  width=0.01, size=1
) + geom_errorbar(
  mapping=aes(
    y=generic_endorsement_mean,
    xmin=predicted_probability_ci_lower,
    xmax=predicted_probability_ci_upper
  ),
  width=0.01, size=1
) + geom_point(
  mapping=aes(
    x=predicted_probability_mean,
    y=generic_endorsement_mean
  ),
  size=3, shape=15
) + scale_colour_manual(
values = c("indianred2", "indianred3", "lightgoldenrod1", "darkolivegreen2", "#7ad1ff", "#72b0d1", "#4d84a1", "#3d6980")
)
```

![](data-analysis_files/figure-gfm/scatterplot%20with%20error%20bars%20-%20predicted%20probability%20vs.%20generic%20endorsement%20per%20condition-1.png)<!-- -->

## Demographic information

Participants’ feedback

``` r
knitr::kable(participant_demographics %>% select(comments) %>% na.omit(), caption="Participant freeform feedback")
```

|     | comments                                                                                                                                                    |
| :-- | :---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | None                                                                                                                                                        |
| 2   |                                                                                                                                                             |
| 3   | Nothing, good luck with the study\! :)                                                                                                                      |
| 4   | N/A                                                                                                                                                         |
| 5   |                                                                                                                                                             |
| 6   |                                                                                                                                                             |
| 7   | nope\!                                                                                                                                                      |
| 8   |                                                                                                                                                             |
| 9   |                                                                                                                                                             |
| 10  | No                                                                                                                                                          |
| 11  |                                                                                                                                                             |
| 12  |                                                                                                                                                             |
| 13  | No                                                                                                                                                          |
| 14  |                                                                                                                                                             |
| 15  |                                                                                                                                                             |
| 16  | no                                                                                                                                                          |
| 17  | No                                                                                                                                                          |
| 18  |                                                                                                                                                             |
| 19  | No                                                                                                                                                          |
| 20  |                                                                                                                                                             |
| 21  |                                                                                                                                                             |
| 22  |                                                                                                                                                             |
| 23  | Do Dax birds actually have green feathers? Enquiring minds want to know.                                                                                    |
| 24  | good survey                                                                                                                                                 |
| 25  |                                                                                                                                                             |
| 26  |                                                                                                                                                             |
| 27  | I believe that the study was intended to express phonetic memorization. I am not entirely sure.                                                             |
| 28  | No                                                                                                                                                          |
| 29  | no                                                                                                                                                          |
| 30  |                                                                                                                                                             |
| 31  |                                                                                                                                                             |
| 32  |                                                                                                                                                             |
| 33  |                                                                                                                                                             |
| 34  | No                                                                                                                                                          |
| 35  | N/A                                                                                                                                                         |
| 36  | no                                                                                                                                                          |
| 37  | no                                                                                                                                                          |
| 38  |                                                                                                                                                             |
| 39  |                                                                                                                                                             |
| 40  |                                                                                                                                                             |
| 41  |                                                                                                                                                             |
| 42  | No thank you                                                                                                                                                |
| 43  | N/A                                                                                                                                                         |
| 44  |                                                                                                                                                             |
| 45  |                                                                                                                                                             |
| 46  | N/a                                                                                                                                                         |
| 47  | no                                                                                                                                                          |
| 48  | no                                                                                                                                                          |
| 49  | No                                                                                                                                                          |
| 50  | Nice graphics\!                                                                                                                                             |
| 51  |                                                                                                                                                             |
| 52  |                                                                                                                                                             |
| 53  |                                                                                                                                                             |
| 54  | No, I don’t.                                                                                                                                                |
| 55  | no                                                                                                                                                          |
| 56  | N/A                                                                                                                                                         |
| 57  |                                                                                                                                                             |
| 58  | Interesting experiment. I’ve never done one like this before.                                                                                               |
| 59  | no                                                                                                                                                          |
| 60  |                                                                                                                                                             |
| 61  |                                                                                                                                                             |
| 62  |                                                                                                                                                             |
| 63  | Very interesting and thought provoking. Makes me want to learn more about this planet\! Thank you guys for the opportunity and good luck with your survey\! |
| 64  | no                                                                                                                                                          |
| 65  | interesting at least, different than most surveys here                                                                                                      |
| 66  |                                                                                                                                                             |
| 67  |                                                                                                                                                             |
| 68  |                                                                                                                                                             |
| 69  |                                                                                                                                                             |
| 70  |                                                                                                                                                             |
| 71  |                                                                                                                                                             |
| 72  | Nope.                                                                                                                                                       |
| 73  |                                                                                                                                                             |
| 74  | very nice                                                                                                                                                   |
| 75  |                                                                                                                                                             |
| 76  |                                                                                                                                                             |
| 78  |                                                                                                                                                             |
| 79  | none                                                                                                                                                        |
| 80  | I loved the other researcher. Very cute                                                                                                                     |
| 81  |                                                                                                                                                             |
| 82  | no                                                                                                                                                          |
| 83  | no                                                                                                                                                          |
| 84  |                                                                                                                                                             |
| 85  |                                                                                                                                                             |
| 86  |                                                                                                                                                             |
| 87  | I did a presentation on the Wug test in school before. Very interesting to see the word pop up here\!                                                       |
| 88  |                                                                                                                                                             |
| 89  |                                                                                                                                                             |
| 90  |                                                                                                                                                             |
| 91  |                                                                                                                                                             |
| 92  | No                                                                                                                                                          |
| 93  |                                                                                                                                                             |
| 94  |                                                                                                                                                             |
| 95  | No                                                                                                                                                          |
| 96  | no                                                                                                                                                          |
| 97  |                                                                                                                                                             |
| 98  |                                                                                                                                                             |
| 99  | This experiment was interactive and enjoyable.                                                                                                              |
| 100 | no                                                                                                                                                          |
| 101 |                                                                                                                                                             |
| 102 | no                                                                                                                                                          |
| 103 |                                                                                                                                                             |
| 104 |                                                                                                                                                             |
| 105 |                                                                                                                                                             |
| 106 | thank you                                                                                                                                                   |
| 107 | no                                                                                                                                                          |
| 108 |                                                                                                                                                             |
| 109 |                                                                                                                                                             |
| 110 | no                                                                                                                                                          |
| 111 |                                                                                                                                                             |
| 112 |                                                                                                                                                             |
| 113 |                                                                                                                                                             |
| 114 | just thank you                                                                                                                                              |
| 115 |                                                                                                                                                             |
| 116 | N/A                                                                                                                                                         |
| 117 |                                                                                                                                                             |
| 118 | N/A                                                                                                                                                         |
| 119 | no                                                                                                                                                          |
| 121 |                                                                                                                                                             |
| 122 |                                                                                                                                                             |
| 123 |                                                                                                                                                             |
| 124 |                                                                                                                                                             |
| 125 |                                                                                                                                                             |
| 126 |                                                                                                                                                             |
| 127 | Good luck with your work\!                                                                                                                                  |
| 128 | Nope\!                                                                                                                                                      |
| 129 | Na                                                                                                                                                          |
| 130 | For a moment, I was concerned that I would have to identify an animal by its color. I am red/green colorblind.                                              |
| 131 |                                                                                                                                                             |
| 132 |                                                                                                                                                             |
| 133 | None                                                                                                                                                        |
| 134 | No                                                                                                                                                          |
| 135 | No                                                                                                                                                          |
| 136 | No                                                                                                                                                          |
| 137 | No                                                                                                                                                          |
| 138 | No                                                                                                                                                          |
| 139 |                                                                                                                                                             |
| 140 | no additional comments                                                                                                                                      |
| 141 |                                                                                                                                                             |
| 142 | Nope\!                                                                                                                                                      |
| 143 |                                                                                                                                                             |
| 144 | No                                                                                                                                                          |
| 145 | No                                                                                                                                                          |
| 146 |                                                                                                                                                             |
| 147 |                                                                                                                                                             |
| 148 | No                                                                                                                                                          |
| 149 |                                                                                                                                                             |
| 150 |                                                                                                                                                             |
| 151 | No                                                                                                                                                          |
| 152 |                                                                                                                                                             |
| 153 |                                                                                                                                                             |
| 154 |                                                                                                                                                             |
| 155 |                                                                                                                                                             |
| 156 | No, I do not.                                                                                                                                               |
| 157 |                                                                                                                                                             |
| 158 |                                                                                                                                                             |
| 159 |                                                                                                                                                             |
| 160 | The sheep scientist was unexpected.                                                                                                                         |
| 161 | I am wondering if I missed part of the study. Why would you ask what is a fair price for the work I did? hmmm…                                              |
| 162 | No                                                                                                                                                          |
| 163 | no                                                                                                                                                          |
| 164 |                                                                                                                                                             |
| 165 | no                                                                                                                                                          |
| 166 | I do not have any additional comments.                                                                                                                      |
| 167 | no comments.                                                                                                                                                |
| 168 |                                                                                                                                                             |
| 169 |                                                                                                                                                             |
| 170 |                                                                                                                                                             |
| 171 |                                                                                                                                                             |
| 172 | na                                                                                                                                                          |
| 173 |                                                                                                                                                             |
| 174 | I found this experiment very interesting\!                                                                                                                  |
| 175 |                                                                                                                                                             |
| 176 |                                                                                                                                                             |
| 177 | No.                                                                                                                                                         |
| 178 |                                                                                                                                                             |
| 179 |                                                                                                                                                             |
| 180 |                                                                                                                                                             |
| 181 |                                                                                                                                                             |
| 182 | This was my first experiment/survey it was interestingly intriguing.                                                                                        |
| 183 |                                                                                                                                                             |
| 184 | N/A                                                                                                                                                         |
| 185 | Maybe don’t use monkeys as researchers.                                                                                                                     |
| 186 |                                                                                                                                                             |
| 187 | no                                                                                                                                                          |
| 188 | none                                                                                                                                                        |
| 189 | None.                                                                                                                                                       |
| 190 |                                                                                                                                                             |
| 191 | No                                                                                                                                                          |
| 192 | n/a                                                                                                                                                         |
| 193 | no                                                                                                                                                          |
| 194 |                                                                                                                                                             |
| 195 |                                                                                                                                                             |
| 196 | no                                                                                                                                                          |
| 197 |                                                                                                                                                             |
| 198 |                                                                                                                                                             |
| 199 | Interesting experiment guys. Good luck with your research. Have a good day                                                                                  |
| 200 |                                                                                                                                                             |
| 201 |                                                                                                                                                             |
| 202 |                                                                                                                                                             |
| 203 |                                                                                                                                                             |
| 204 | Nope.                                                                                                                                                       |
| 205 | No                                                                                                                                                          |
| 206 | I feel i followed all directions and deserve to be paid at least the amount advertised at the time the study was offered                                    |
| 207 |                                                                                                                                                             |
| 208 | No                                                                                                                                                          |
| 209 |                                                                                                                                                             |
| 210 |                                                                                                                                                             |
| 211 | none                                                                                                                                                        |
| 212 |                                                                                                                                                             |
| 213 |                                                                                                                                                             |
| 214 |                                                                                                                                                             |
| 215 | none                                                                                                                                                        |
| 216 | none                                                                                                                                                        |
| 217 | No                                                                                                                                                          |
| 218 |                                                                                                                                                             |
| 219 |                                                                                                                                                             |
| 220 |                                                                                                                                                             |
| 221 |                                                                                                                                                             |
| 222 | None noted and stay safe.                                                                                                                                   |
| 223 |                                                                                                                                                             |
| 224 |                                                                                                                                                             |
| 225 | N/A                                                                                                                                                         |
| 226 |                                                                                                                                                             |
| 227 | Everything ran smoothly                                                                                                                                     |
| 228 | no                                                                                                                                                          |
| 229 |                                                                                                                                                             |
| 230 | it was pretty well put together .                                                                                                                           |
| 231 |                                                                                                                                                             |
| 232 |                                                                                                                                                             |
| 233 | no                                                                                                                                                          |
| 234 | no                                                                                                                                                          |
| 235 |                                                                                                                                                             |
| 236 |                                                                                                                                                             |
| 237 | no                                                                                                                                                          |
| 238 | No                                                                                                                                                          |
| 239 |                                                                                                                                                             |
| 240 |                                                                                                                                                             |
| 241 | No                                                                                                                                                          |
| 242 | Thank you\!                                                                                                                                                 |
| 243 |                                                                                                                                                             |
| 244 |                                                                                                                                                             |
| 245 |                                                                                                                                                             |
| 246 | No                                                                                                                                                          |
| 247 | no                                                                                                                                                          |
| 248 | I enjoyed this very much, the animations made it fun.                                                                                                       |
| 249 | Nothing to add, thank you.                                                                                                                                  |
| 250 | No                                                                                                                                                          |
| 251 |                                                                                                                                                             |
| 252 | no                                                                                                                                                          |
| 253 | No                                                                                                                                                          |
| 254 |                                                                                                                                                             |
| 255 |                                                                                                                                                             |
| 256 | N/A                                                                                                                                                         |
| 257 |                                                                                                                                                             |
| 258 |                                                                                                                                                             |
| 259 |                                                                                                                                                             |
| 260 | Nothing else to contribute                                                                                                                                  |
| 261 |                                                                                                                                                             |
| 262 | No                                                                                                                                                          |
| 263 | No                                                                                                                                                          |
| 264 | NO                                                                                                                                                          |
| 265 |                                                                                                                                                             |
| 266 |                                                                                                                                                             |
| 267 |                                                                                                                                                             |
| 268 |                                                                                                                                                             |
| 269 | thanks\!                                                                                                                                                    |
| 270 |                                                                                                                                                             |
| 271 |                                                                                                                                                             |
| 272 |                                                                                                                                                             |
| 273 |                                                                                                                                                             |
| 274 |                                                                                                                                                             |
| 275 | Great                                                                                                                                                       |
| 276 | No, thanks.                                                                                                                                                 |
| 277 |                                                                                                                                                             |
| 278 |                                                                                                                                                             |
| 279 |                                                                                                                                                             |
| 280 |                                                                                                                                                             |
| 281 | Interesting                                                                                                                                                 |
| 282 | Cute test, fast and easy.                                                                                                                                   |
| 283 |                                                                                                                                                             |
| 284 |                                                                                                                                                             |
| 285 | Nope                                                                                                                                                        |
| 286 |                                                                                                                                                             |
| 287 |                                                                                                                                                             |
| 288 |                                                                                                                                                             |
| 289 |                                                                                                                                                             |
| 290 |                                                                                                                                                             |
| 291 | THe womans voice/talking style was creepy                                                                                                                   |
| 292 |                                                                                                                                                             |
| 293 | no                                                                                                                                                          |
| 294 |                                                                                                                                                             |
| 295 |                                                                                                                                                             |
| 296 | No                                                                                                                                                          |
| 297 | i wish this were a longer survey…it was enjoyable                                                                                                           |
| 298 | nope                                                                                                                                                        |
| 299 |                                                                                                                                                             |
| 300 | Think you for the opportunity, it was very interesting                                                                                                      |
| 301 | No                                                                                                                                                          |
| 302 |                                                                                                                                                             |
| 303 | Cute animation                                                                                                                                              |
| 304 |                                                                                                                                                             |
| 305 |                                                                                                                                                             |
| 306 | None aside from the fact that I enjoyed doing this.                                                                                                         |
| 307 | no                                                                                                                                                          |
| 308 |                                                                                                                                                             |
| 309 |                                                                                                                                                             |
| 310 |                                                                                                                                                             |
| 311 | i enjoyed this survey studies.                                                                                                                              |
| 312 |                                                                                                                                                             |
| 313 |                                                                                                                                                             |
| 314 | no                                                                                                                                                          |
| 315 |                                                                                                                                                             |
| 316 |                                                                                                                                                             |
| 317 |                                                                                                                                                             |
| 318 |                                                                                                                                                             |
| 319 | Thank you.                                                                                                                                                  |
| 320 | No                                                                                                                                                          |
| 321 |                                                                                                                                                             |
| 322 | no                                                                                                                                                          |
| 323 | none                                                                                                                                                        |
| 324 |                                                                                                                                                             |
| 325 | no                                                                                                                                                          |
| 326 | No, I don’t have any additional comments.                                                                                                                   |
| 327 | Should participants just assume that “wugs” are all the same and that all wugs are guaranteed to bloom with purple flowers for simplicity’s sake?           |
| 328 | n/a                                                                                                                                                         |
| 329 |                                                                                                                                                             |
| 330 |                                                                                                                                                             |
| 331 |                                                                                                                                                             |
| 332 | no                                                                                                                                                          |
| 333 |                                                                                                                                                             |
| 334 |                                                                                                                                                             |
| 335 | no                                                                                                                                                          |
| 336 | No                                                                                                                                                          |
| 337 |                                                                                                                                                             |
| 338 |                                                                                                                                                             |
| 339 |                                                                                                                                                             |
| 340 | no                                                                                                                                                          |
| 341 |                                                                                                                                                             |
| 342 |                                                                                                                                                             |
| 343 | No                                                                                                                                                          |
| 344 | None                                                                                                                                                        |
| 345 | No                                                                                                                                                          |
| 346 | I have a good experience in this study                                                                                                                      |
| 347 |                                                                                                                                                             |
| 348 |                                                                                                                                                             |
| 349 | Thank you for the opportunity to take part in this experiment\! The dog scientist was kind of creepy, just saying.                                          |
| 350 |                                                                                                                                                             |
| 351 | nice survey                                                                                                                                                 |
| 352 |                                                                                                                                                             |
| 353 |                                                                                                                                                             |
| 354 |                                                                                                                                                             |
| 355 |                                                                                                                                                             |
| 356 | no                                                                                                                                                          |
| 357 |                                                                                                                                                             |
| 358 |                                                                                                                                                             |
| 359 |                                                                                                                                                             |
| 360 | no                                                                                                                                                          |
| 361 |                                                                                                                                                             |
| 362 | Was simple, tested my memory.                                                                                                                               |
| 363 |                                                                                                                                                             |
| 364 |                                                                                                                                                             |
| 365 |                                                                                                                                                             |
| 366 |                                                                                                                                                             |
| 367 |                                                                                                                                                             |
| 368 |                                                                                                                                                             |
| 369 |                                                                                                                                                             |
| 370 |                                                                                                                                                             |
| 371 |                                                                                                                                                             |
| 372 |                                                                                                                                                             |
| 373 | Nope but thank you\!                                                                                                                                        |
| 374 | no                                                                                                                                                          |
| 375 |                                                                                                                                                             |
| 376 |                                                                                                                                                             |
| 377 | no                                                                                                                                                          |
| 378 | The tone of the voice was curious                                                                                                                           |
| 379 |                                                                                                                                                             |
| 380 |                                                                                                                                                             |
| 381 | No.                                                                                                                                                         |
| 382 |                                                                                                                                                             |
| 383 |                                                                                                                                                             |
| 384 |                                                                                                                                                             |
| 385 |                                                                                                                                                             |
| 386 |                                                                                                                                                             |
| 387 |                                                                                                                                                             |
| 388 |                                                                                                                                                             |
| 389 |                                                                                                                                                             |
| 390 | No comments                                                                                                                                                 |
| 391 |                                                                                                                                                             |
| 392 | no                                                                                                                                                          |
| 393 |                                                                                                                                                             |
| 394 |                                                                                                                                                             |
| 395 |                                                                                                                                                             |
| 396 |                                                                                                                                                             |
| 397 |                                                                                                                                                             |
| 398 |                                                                                                                                                             |
| 399 | :)                                                                                                                                                          |
| 400 |                                                                                                                                                             |
| 401 |                                                                                                                                                             |
| 402 | I don’t think it was exactly about language.                                                                                                                |

Participant freeform feedback

Bar chart of participants’ reported native language(s)

``` r
native_languages <- with(participant_demographics %>% select(language) %>% na.omit(), paste0(language))

native_languages <- native_languages %>%
  sapply(tolower) %>%
  str_replace(", ", " ") %>%
  str_replace("and ", " ") %>%
  str_squish() %>%
  strsplit("\\s+") %>% # split by spaces
  unlist() %>%
  table() %>% # frequency counts
  as.data.frame() # convert to dataframe

ggplot(
  native_languages,
  aes(., Freq)
  ) + geom_col(
    aes(., Freq)
  ) + xlab(
    "Native language"
  ) + ylab(
    "Frequency"
  ) + labs(
    title="Frequency of participants' reported native language(s)"
  ) + coord_flip()
```

![](data-analysis_files/figure-gfm/bar%20chart%20-%20native%20languages%20frequency-1.png)<!-- -->
