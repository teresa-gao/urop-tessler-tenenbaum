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

    ## -- Attaching packages -------------------------------------------------------------------------- tidyverse 1.3.0 --

    ## v ggplot2 3.3.2     v purrr   0.3.4
    ## v tibble  3.0.3     v stringr 1.4.0
    ## v tidyr   1.1.2     v forcats 0.5.0
    ## v readr   1.3.1

    ## -- Conflicts ----------------------------------------------------------------------------- tidyverse_conflicts() --
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
data <- read_csv("../../../prolific/2020-fall/pilot-3/genex-pilot-3-streamlined_data.csv")
```

    ## Parsed with column specification:
    ## cols(
    ##   workerid = col_double(),
    ##   proliferate.condition = col_character(),
    ##   agent = col_character(),
    ##   catch_trial_fails = col_double(),
    ##   followup_fails = col_double(),
    ##   freeform_followup = col_character(),
    ##   freeform_followup_duration = col_double(),
    ##   generic_endorsement = col_character(),
    ##   generic_endorsement_duration = col_double(),
    ##   item_name = col_character(),
    ##   item_presentation_condition = col_character(),
    ##   n_examples = col_double(),
    ##   object = col_character(),
    ##   perceived_character_knowledge = col_character(),
    ##   perceived_character_knowledge_duration = col_double(),
    ##   predicted_probability = col_double(),
    ##   predicted_probability_duration = col_double(),
    ##   speaker = col_character(),
    ##   error = col_logical()
    ## )

``` r
n_total_participants <- nrow(data)

data <- data %>%
  filter(catch_trial_fails == 0) %>%
  filter(followup_fails == 0)
```

9 participants were excluded due to failure of attention checks and/or
non-comprehension followup questions.

# Calculations and Relabeling

Compute bootstrapped means and confidence intervals of user slider
response

``` r
# TODO: update

# predicted_probability_CIs <- trials_data %>%
#   group_by(item_presentation_condition, n_examples) %>%
#   tidyboot_mean(column = response)
# 
# slider_response_time_CIs <- trials_data %>%
#   group_by(item_presentation_condition, n_examples) %>%
#   tidyboot_mean(column = response_time_in_seconds)
# 
# generic_endorsement_CIs <- followup_data %>%
#   filter(response_type == "slider") %>%
#   group_by(proliferate.condition) %>%
#   type.convert() %>% # `chr` to `dbl`
#   tidyboot_mean(column = response, na.rm=TRUE)
# 
# generic_endorsement_CIs
# 
# trials_data %>%
#   group_by(item_presentation_condition, n_examples)
# 
# freeform_followup_wordcount_CIs <- freeform_followup %>%
#   group_by(proliferate.condition) %>%
#   tidyboot_mean(column = n_words, na.rm=TRUE)
```

# Visualization

## Trials data

<!-- TODO: update all!! -->
