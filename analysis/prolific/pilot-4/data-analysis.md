Genex Analysis: Fall 2020 Prolific pilots
================
Teresa Gao
28 November 2020

# About

This R Notebook reports data from a final round of pilot experiments run
during Fall 2020 on Prolific (via proliferate).

# Setup

## Imports

Load required libraries

``` r
library("tidyverse")
```

    ## -- Attaching packages ------------------------------------------------------------------------------------------------------------- tidyverse 1.3.0 --

    ## v ggplot2 3.3.2     v purrr   0.3.4
    ## v tibble  3.0.3     v dplyr   1.0.2
    ## v tidyr   1.1.2     v stringr 1.4.0
    ## v readr   1.3.1     v forcats 0.5.0

    ## -- Conflicts ---------------------------------------------------------------------------------------------------------------- tidyverse_conflicts() --
    ## x dplyr::filter() masks stats::filter()
    ## x dplyr::lag()    masks stats::lag()

``` r
library("gridExtra")
```

    ## 
    ## Attaching package: 'gridExtra'

    ## The following object is masked from 'package:dplyr':
    ## 
    ##     combine

``` r
library("tidyboot")
library("ngram")
library("readr")
library("tidytext")
```

    ## Warning: package 'tidytext' was built under R version 4.0.3

``` r
library("readr")
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

Import data from “pilot 3” (first, smaller part of pilots with this
version of the experiment).

``` r
p3_streamlined_data <- read.csv("../../../prolific/2020-fall/pilot-3/genex-pilot-3-streamlined_data.csv")
p3_participant_demographics <- read.csv("../../../prolific/2020-fall/pilot-3/genex-pilot-3-subject_information.csv")
p3_response_data <- read.csv("../../../prolific/2020-fall/pilot-3/genex-pilot-3-full_response_data.csv") %>%
  filter(type != "introduction")
```

“Pilot 3” had 80 total participants.

Import data from “pilot 4” (second, larger part of pilots with this
version of the experiment)

``` r
p4_streamlined_data <- read.csv("../../../prolific/2020-fall/pilot-4/genex-pilot-4-streamlined_data.csv")
p4_participant_demographics <- read.csv("../../../prolific/2020-fall/pilot-4/genex-pilot-4-subject_information.csv")
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
  # TODO: extract first response; evaluate correctness based on lack of "skyscraper"

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

Join all “pilot 3” and “pilot 4” streamlined data.

``` r
streamlined_data <- plyr::rbind.fill(p3_streamlined_data, p4_streamlined_data) %>%
  mutate( predicted_probability_response = as.numeric(as.character(predicted_probability_response))) %>% # convert string numbers to numbers
  mutate( name_identification_is_correct = as.logical(name_identification_is_correct) ) %>% # convert "True" to TRUE and "False" to FALSE
  mutate( character_arrival_is_correct = as.logical(character_arrival_is_correct) ) %>% # convert "True" to TRUE and "False" to FALSE
  mutate( exp_cond = factor(paste(item_presentation_condition, n_examples, sep = "_") ) )

# append some streamlined data to demographic info to determine which to exclude
participant_demographics <- bind_rows(p3_participant_demographics, p4_participant_demographics) %>%
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

Out of 250 total participants, 16 were excluded based on their responses
to the botcaptcha and the followup attention checks. In these excluded
participants, 6 failed the botcaptcha at least once, 1 answered the name
identification followup attention check incorrectly, and 9 answered the
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
  mutate( condition = paste(n_examples, item_presentation_condition, sep="") ) %>%
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
  dplyr::group_by(item_presentation_condition, n_examples) %>%
  tidyboot_mean(column = predicted_probability_response) %>%
  mutate( exp_cond = factor( paste( item_presentation_condition, n_examples, sep="_" ) ) )
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

    ## # A tibble: 6 x 8
    ## # Groups:   item_presentation_condition [4]
    ##   item_presentati~ n_examples     n empirical_stat ci_lower  mean ci_upper
    ##   <chr>                 <int> <int>          <dbl>    <dbl> <dbl>    <dbl>
    ## 1 accidental                1    48          0.719    0.671 0.719    0.767
    ## 2 accidental                2    43          0.776    0.735 0.776    0.813
    ## 3 gen+ped                   1    23          0.857    0.792 0.856    0.914
    ## 4 generic                   1    25          0.950    0.909 0.949    0.980
    ## 5 pedagogical               1    47          0.758    0.708 0.757    0.807
    ## 6 pedagogical               2    48          0.831    0.781 0.831    0.879
    ## # ... with 1 more variable: exp_cond <fct>

``` r
predicted_probability_CIs.preprocessed_item <- bayes_preprocessed %>%
  dplyr::group_by(condition, kind_type, feature_label) %>%
  tidyboot_mean(column = response) %>%
  mutate(condition = factor(condition),
         kind_type = factor(kind_type, levels = c("bird", "flower", "artifact")))
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
predicted_probability_duration_CIs <- filtered_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  tidyboot_mean(column = predicted_probability_duration) %>%
  mutate( exp_cond = factor( paste ( item_presentation_condition, n_examples, sep="_" ) ) )
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
predicted_probability_duration_CIs # prints output; line may be omitted
```

    ## # A tibble: 6 x 8
    ## # Groups:   item_presentation_condition [4]
    ##   item_presentati~ n_examples     n empirical_stat ci_lower  mean ci_upper
    ##   <chr>                 <int> <int>          <dbl>    <dbl> <dbl>    <dbl>
    ## 1 accidental                1    48          10.5      8.93 10.5      12.3
    ## 2 accidental                2    43          10.8      9.39 10.8      12.2
    ## 3 gen+ped                   1    23          11.5      9.13 11.5      14.5
    ## 4 generic                   1    25           9.31     7.53  9.31     11.4
    ## 5 pedagogical               1    47           9.85     8.60  9.89     11.4
    ## 6 pedagogical               2    48          10.5      8.89 10.5      12.3
    ## # ... with 1 more variable: exp_cond <fct>

``` r
generic_endorsement_CIs <- filtered_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  mutate(generic_endorsement = ifelse(generic_endorsement_response == "yes",1,0)) %>%
  tidyboot_mean(column = generic_endorsement) %>%
  mutate( exp_cond = factor( paste ( item_presentation_condition, n_examples, sep="_" ) ) )
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
generic_endorsement_CIs # prints output; line may be omitted
```

    ## # A tibble: 6 x 8
    ## # Groups:   item_presentation_condition [4]
    ##   item_presentati~ n_examples     n empirical_stat ci_lower  mean ci_upper
    ##   <chr>                 <int> <int>          <dbl>    <dbl> <dbl>    <dbl>
    ## 1 accidental                1    48          0.917    0.827 0.914    0.980
    ## 2 accidental                2    43          0.953    0.886 0.955    1    
    ## 3 gen+ped                   1    23          1        1     1        1    
    ## 4 generic                   1    25          1        1     1        1    
    ## 5 pedagogical               1    47          1        1     1        1    
    ## 6 pedagogical               2    48          0.979    0.930 0.979    1    
    ## # ... with 1 more variable: exp_cond <fct>

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
                                           add = c(0.01, 1) ) ) +
  viridis::scale_fill_viridis(
    breaks = c(0, 1)
  ) +
  guides(fill = F) +
  theme(
    axis.title.y = element_blank(),
    axis.title.x = element_text(hjust = 0.5, vjust = 0)
  ) +
  labs(x = "Predicted Probability of Future Instance having Property")
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
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
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
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
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
  values = c("indianred1", "indianred3", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue", "dodgerblue3")
)
```

![](data-analysis_files/figure-gfm/scatterplot%20with%20error%20bars%20-%20predicted%20probability%20vs.%20generic%20endorsement%20per%20condition-1.png)<!-- -->

## Demographic information

Participants’ feedback

``` r
View(participant_demographics %>% select(comments) %>% na.omit()) # opens responses in a new window
```

Bar chart of participants’ reported native language(s)

``` r
native_languages <- with(participant_demographics %>% select(language) %>% na.omit(), paste0(language))

native_languages <- native_languages %>%
  sapply(tolower) %>%
  str_replace(", ", " ") %>%
  str_replace("and ", " ") %>%
  str_squish() %>%
  strsplit("\\s+") %>% # spilt by spaces
  unlist() %>%
  table() %>% # frequency counts
  as.data.frame() # conver to dataframe

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
