Genex Analysis: Fall 2020 Prolific pilots
================
Teresa Gao
17 November 2020

# About

This R Notebook reports data from a second (“third”) round of pilot
experiments run during Fall 2020 on Prolific (via proliferate).

# Setup

Load required libraries

``` r
library("dplyr")
```

    ## 
    ## Attaching package: 'dplyr'

    ## The following objects are masked from 'package:stats':
    ## 
    ##     filter, lag

    ## The following objects are masked from 'package:base':
    ## 
    ##     intersect, setdiff, setequal, union

``` r
library("tidyverse")
```

    ## -- Attaching packages ------------------------------------------------------------------------------------------------------------- tidyverse 1.3.0 --

    ## v ggplot2 3.3.2     v purrr   0.3.4
    ## v tibble  3.0.3     v stringr 1.4.0
    ## v tidyr   1.1.2     v forcats 0.5.0
    ## v readr   1.3.1

    ## -- Conflicts ---------------------------------------------------------------------------------------------------------------- tidyverse_conflicts() --
    ## x dplyr::filter() masks stats::filter()
    ## x dplyr::lag()    masks stats::lag()

``` r
library("ggplot2")
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
library("stringr")
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

``` r
streamlined_data <- read_csv("streamlined_data.csv")
```

    ## Warning: Missing column names filled in: 'X1' [1]

    ## Parsed with column specification:
    ## cols(
    ##   .default = col_double(),
    ##   proliferate.condition = col_character(),
    ##   agent = col_character(),
    ##   freeform_followup = col_character(),
    ##   generic_endorsement = col_character(),
    ##   item_name = col_character(),
    ##   item_presentation_condition = col_character(),
    ##   object = col_character(),
    ##   perceived_character_knowledge = col_character(),
    ##   speaker = col_character(),
    ##   error = col_logical()
    ## )

    ## See spec(...) for full column specifications.

``` r
participant_demographics <- read_csv("participant_demographics.csv")
```

    ## Warning: Missing column names filled in: 'X1' [1]

    ## Parsed with column specification:
    ## cols(
    ##   X1 = col_double(),
    ##   workerid = col_double(),
    ##   proliferate.condition = col_character(),
    ##   age = col_double(),
    ##   assess = col_character(),
    ##   comments = col_character(),
    ##   education = col_double(),
    ##   fairprice = col_character(),
    ##   gender = col_character(),
    ##   language = col_character(),
    ##   problems = col_character(),
    ##   error = col_logical()
    ## )

``` r
n_total_participants <- nrow(streamlined_data)

# append some streamlined data to demographic info
participant_demographics <- merge(participant_demographics, subset(streamlined_data, select=c(workerid, catch_trial_fails, followup_fails)), by="workerid")

# remove participants who failed attention and/or followup
streamlined_data <- streamlined_data %>%
  # filter(catch_trial_fails == 0) %>%
  filter(followup_fails == 0)

View(streamlined_data) # opens output in another window; line may be omitted
View(participant_demographics) # opens output in another window; line may be omitted
```

Due to failure of attention checks and/or non-comprehension followup
questions, participants were excluded from analysis.

# Calculations and Relabeling

Compute bootstrapped means and confidence intervals of user slider
response

``` r
predicted_probability_CIs <- streamlined_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  tidyboot_mean(column = predicted_probability) %>%
  mutate(exp_cond = factor(paste(item_presentation_condition, n_examples, sep = "_")))
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

    ## # A tibble: 4 x 8
    ## # Groups:   item_presentation_condition [2]
    ##   item_presentati~ n_examples     n empirical_stat ci_lower  mean ci_upper
    ##   <chr>                 <dbl> <int>          <dbl>    <dbl> <dbl>    <dbl>
    ## 1 accidental                1    21          0.721    0.649 0.724    0.797
    ## 2 accidental                2    18          0.769    0.715 0.769    0.814
    ## 3 pedagogical               1    19          0.719    0.646 0.719    0.791
    ## 4 pedagogical               2    18          0.859    0.777 0.857    0.928
    ## # ... with 1 more variable: exp_cond <fct>

``` r
predicted_probability_duration_CIs <- streamlined_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  tidyboot_mean(column = predicted_probability_duration) %>%
  mutate(exp_cond = factor(paste(item_presentation_condition, n_examples, sep = "_")))
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
predicted_probability_duration_CIs # prints output; line may be omitted
```

    ## # A tibble: 4 x 8
    ## # Groups:   item_presentation_condition [2]
    ##   item_presentati~ n_examples     n empirical_stat ci_lower  mean ci_upper
    ##   <chr>                 <dbl> <int>          <dbl>    <dbl> <dbl>    <dbl>
    ## 1 accidental                1    21           10.5     8.24  10.5     13.9
    ## 2 accidental                2    18           11.7     9.43  11.7     14.2
    ## 3 pedagogical               1    19           11.3     8.81  11.3     13.8
    ## 4 pedagogical               2    18           10.5     8.12  10.5     13.3
    ## # ... with 1 more variable: exp_cond <fct>

``` r
generic_endorsement_CIs <- streamlined_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  mutate(generic_endorsement = ifelse(generic_endorsement == "yes",1,0)) %>%
  tidyboot_mean(column = generic_endorsement) %>%
  mutate(exp_cond = factor(paste(item_presentation_condition, n_examples, sep = "_")))
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
generic_endorsement_CIs # prints output; line may be omitted
```

    ## # A tibble: 4 x 8
    ## # Groups:   item_presentation_condition [2]
    ##   item_presentati~ n_examples     n empirical_stat ci_lower  mean ci_upper
    ##   <chr>                 <dbl> <int>          <dbl>    <dbl> <dbl>    <dbl>
    ## 1 accidental                1    21          0.905    0.762 0.905        1
    ## 2 accidental                2    18          0.944    0.812 0.944        1
    ## 3 pedagogical               1    19          0.947    0.818 0.946        1
    ## 4 pedagogical               2    18          0.944    0.824 0.943        1
    ## # ... with 1 more variable: exp_cond <fct>

``` r
perceived_character_knowledge_CIs <- streamlined_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  mutate(perceived_character_knowledge = ifelse(perceived_character_knowledge == "yes",1,0)) %>%
  tidyboot_mean(column = perceived_character_knowledge) %>%
  mutate(exp_cond = factor(paste(item_presentation_condition, n_examples, sep = "_")))
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

``` r
perceived_character_knowledge_CIs # prints output; line may be omitted
```

    ## # A tibble: 4 x 8
    ## # Groups:   item_presentation_condition [2]
    ##   item_presentati~ n_examples     n empirical_stat ci_lower   mean ci_upper
    ##   <chr>                 <dbl> <int>          <dbl>    <dbl>  <dbl>    <dbl>
    ## 1 accidental                1    21         0.0952    0     0.0953    0.238
    ## 2 accidental                2    18         0         0     0         0    
    ## 3 pedagogical               1    19         0.895     0.737 0.897     1    
    ## 4 pedagogical               2    18         0.889     0.727 0.892     1    
    ## # ... with 1 more variable: exp_cond <fct>

# Visualization

## Predicted probability

Gradient density ridges graph of predicted probability of next
encountered object having same property vs. item presentation condition
and number of examples

``` r
ggplot(
  streamlined_data %>%
      mutate(exp_cond = paste(item_presentation_condition, n_examples, sep = "_")),
  mapping = aes(
    x = predicted_probability,
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
    limits = c(0, 1.02),
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
  labs(x = "Predicted Probability of Future Instance having Property")
```

![](data_analysis_files/figure-gfm/gradient%20density%20-%20predicted%20probability%20vs.%20condition-1.png)<!-- -->

Gradient density ridges graph of *time taken to respond* to predicted
probability of next encountered object having same property vs. item
presentation condition and number of examples

``` r
ggplot(
  streamlined_data %>%
      mutate(exp_cond = paste(item_presentation_condition, n_examples, sep = "_")),
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

![](data_analysis_files/figure-gfm/gradient%20density%20-%20predicted%20probability%20time%20vs.%20condition-1.png)<!-- -->

Facet grid of predicted probability plotted on number of examples
vs. item presentation condition

``` r
ggplot(
  streamlined_data,
  mapping = aes(
    x = predicted_probability,
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
facet_grid(n_examples ~ item_presentation_condition) +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/facet%20grid%20-%20predicted%20probability%20on%20num.%20examples%20vs.%20condition-1.png)<!-- -->

Facet grid of predicted probability plotted on item presentation
condition vs. speaker

``` r
ggplot(
  streamlined_data,
  mapping = aes(
    x = predicted_probability,
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

![](data_analysis_files/figure-gfm/facet%20grid%20-%20predicted%20probabiliy%20on%20condition%20vs.%20speaker-1.png)<!-- -->

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
)
```

![](data_analysis_files/figure-gfm/scatterplot%20with%20error%20bars%20-%20predicted%20probability%20vs.%20generic%20endorsement%20per%20condition-1.png)<!-- -->

## Demographic information

Participants’ feedback

``` r
View(participant_demographics %>% select(comments) %>% na.omit())
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

native_languages
```

    ##             . Freq
    ## 1     chinese    1
    ## 2    einglish    1
    ## 3     english   68
    ## 4     englsih    1
    ## 5    gujarati    1
    ## 6      korean    1
    ## 7   malayalam    1
    ## 8    mandarin    1
    ## 9     spanish    4
    ## 10 vietnamese    1

``` r
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
  )
```

![](data_analysis_files/figure-gfm/bar%20chart%20-%20native%20languages%20frequency-1.png)<!-- -->
