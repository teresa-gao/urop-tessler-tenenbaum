Genex Analysis: Fall 2020 Prolific pilots
================
Teresa Gao
16 October 2020

# About

This R Notebook reports data from pilot experiments run during Fall 2020
on Prolific (via proliferate); pilot data was collected for a previous
version of this study during Spring 2020 on MTurk (via nosub). The
findings of the latter are occasionally referenced here.

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
```

If running/editing in RStudio, go to **Session \> Set Working Directory
\> To Source File Location**. This ensures that we can find and access
the files we need\!

The code below imports the experimental data, as extracted by
data\_extraction.R; this removes data from participants who failed
attention checks before or after main experiment.

Make sure to run data\_extraction.R before continuing\!

``` r
system_data <- read_csv("system_data.csv")
```

    ## Warning: Missing column names filled in: 'X1' [1]

    ## Parsed with column specification:
    ## cols(
    ##   X1 = col_double(),
    ##   workerid = col_double(),
    ##   proliferate.condition = col_character(),
    ##   Browser = col_character(),
    ##   OS = col_character(),
    ##   screenH = col_double(),
    ##   screenW = col_double(),
    ##   error = col_logical()
    ## )

``` r
catch_data <- read_csv("catch_data.csv")
```

    ## Warning: Missing column names filled in: 'X1' [1]

    ## Parsed with column specification:
    ## cols(
    ##   X1 = col_double(),
    ##   workerid = col_double(),
    ##   proliferate.condition = col_character(),
    ##   correct_answer = col_character(),
    ##   num_fails = col_double(),
    ##   response = col_character(),
    ##   trial_time_in_seconds = col_double(),
    ##   trial_type = col_character(),
    ##   error = col_character()
    ## )

``` r
followup_data <- read_csv("followup_data.csv")
```

    ## Warning: Missing column names filled in: 'X1' [1]

    ## Parsed with column specification:
    ## cols(
    ##   X1 = col_double(),
    ##   workerid = col_double(),
    ##   proliferate.condition = col_character(),
    ##   correct_answer = col_character(),
    ##   is_correct = col_logical(),
    ##   prompt = col_character(),
    ##   response = col_character(),
    ##   response_time_in_seconds = col_double(),
    ##   response_type = col_character(),
    ##   trial_num = col_double(),
    ##   error = col_logical()
    ## )

``` r
subject_information <- read_csv("subject_information.csv")
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
trials_data <- read_csv("trials_data.csv") %>% filter(trial_type == "trial")
```

    ## Warning: Missing column names filled in: 'X1' [1]

    ## Parsed with column specification:
    ## cols(
    ##   .default = col_character(),
    ##   X1 = col_double(),
    ##   workerid = col_double(),
    ##   background = col_double(),
    ##   n_examples = col_double(),
    ##   trial_num = col_double(),
    ##   trial_time_in_seconds.x = col_logical(),
    ##   correct_answer = col_logical(),
    ##   is_correct = col_logical(),
    ##   response = col_double(),
    ##   response_time_in_seconds = col_double(),
    ##   trial_time_in_seconds.y = col_double(),
    ##   error.y = col_logical()
    ## )

    ## See spec(...) for full column specifications.

# Calculations and Relabeling

Compute bootstrapped means and confidence intervals of user slider
response

``` r
slider_CIs <- trials_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  tidyboot_mean(column = response)
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
slider_response_time_CIs <- trials_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  tidyboot_mean(column = response_time_in_seconds)
```

    ## Warning: `cols` is now required when using unnest().
    ## Please use `cols = c(strap)`

Add word- and character-count columns as new freeform followup response
data data frame

``` r
freeform_followup <- followup_data %>% filter(response_type == "freeform")

# TODO
# MH: Look into the tidytext package for text processing...
# https://www.tidytextmining.com/tidytext.html

freeform_followup <- freeform_followup %>%
  mutate(n_words = str_count(response, pattern=boundary(type="word"))) %>%
  mutate(n_chars = str_count(response, pattern=boundary(type="character")))
```

Create data frame comparing slider responses in-trial vs. in-followup

``` r
trials_sliders <- trials_data %>%
  select(workerid, response, response_time_in_seconds, item_presentation_condition, n_examples) %>%
  rename(
    trials_response = response,
    trials_response_time_in_seconds = response_time_in_seconds
  )

followup_sliders <- followup_data %>%
  filter(response_type == "slider") %>%
  select(workerid, response, response_time_in_seconds) %>%
  rename(
    followup_response = response,
    followup_time_in_seconds = response_time_in_seconds
  )

all_sliders <- inner_join(trials_sliders, followup_sliders, by="workerid") %>%
  mutate(followup_response = as.double(followup_response)) %>%
  mutate(trials_minus_followup_sliders = trials_response - followup_response)
```

# Visualization

## Trials data

Gradient density ridges graph of slider response vs. item presentation
condition

``` r
slider_CIs <- slider_CIs %>%
    mutate(exp_cond = factor(paste(item_presentation_condition, n_examples, sep = "_")))
ggplot(
  trials_data %>%
    mutate(exp_cond = paste(item_presentation_condition, n_examples, sep = "_")),
  mapping = aes(
    x = response,
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
    slider_CIs,
    inherit.aes = F,
    mapping = aes(
      xmin = ci_lower, xmax = ci_upper,
      y = as.numeric(exp_cond) + 0.8
    ),
    size = 1.25, color = "black"
  ) + geom_point(
    slider_CIs,
    inherit.aes = F,
    mapping = aes(
      x = mean,
      y = as.numeric(exp_cond) + 0.8
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
  labs(x = "Probability of Future Instance having Property")
```

![](data_analysis_files/figure-gfm/Gradient%20plot%20of%20slider%20response%20vs.%20condition-1.png)<!-- -->

Gradient density ridges graph of slider response *time* vs. item
presentation condition

``` r
slider_response_time_CIs <- slider_response_time_CIs %>%
    mutate(exp_cond = factor(paste(item_presentation_condition, n_examples, sep = "_")))
ggplot(
  trials_data %>%
    mutate(exp_cond = paste(item_presentation_condition, n_examples, sep = "_")),
  mapping = aes(
    x = response_time_in_seconds,
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
    slider_response_time_CIs,
    inherit.aes = F,
    mapping = aes(
      xmin = ci_lower, xmax = ci_upper,
      y = as.numeric(exp_cond) + 0.8
    ),
    size = 1.25, color = "black"
  ) + geom_point(
    slider_response_time_CIs,
    inherit.aes = F,
    mapping = aes(
      x = mean,
      y = as.numeric(exp_cond) + 0.8
    ),
    size = 3, color = "black", shape = 3
  ) +
  scale_x_continuous(
    expand = c(0.01, 0),
    limits = c(0, max(trials_data$response_time_in_seconds)*1.1)
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
  labs(x = "Slider response time in seconds")
```

![](data_analysis_files/figure-gfm/Gradient%20plot%20of%20slider%20response%20time%20vs.%20condition-1.png)<!-- -->

Facet grid of slider response plotted on number of examples vs. item
presentation condition

``` r
ggplot(
  trials_data,
  mapping = aes(
    x = response,
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

![](data_analysis_files/figure-gfm/Slider%20response%20on%20num.%20examples%20vs.%20condition-1.png)<!-- -->

*Observations:*

  - *Wide spread in all conditions and example counts*
  - *Pedagogical mode at 1.0 for both 1 and 2 examples*
  - *1-example accidental mode below 0.5; 2-example accidental
    distributed mostly above 0.5*
  - *Naive similarly distributed as accidental for both 1 and 2
    examples*

Facet grid of slider response plotted on number of examples vs. item
presentation condition and item property

``` r
ggplot(
  trials_data,
  mapping = aes(
    x = response,
    y = (..count..) / tapply(..count.., ..PANEL.., sum)[..PANEL..], fill = as.factor(item_presentation_condition)
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
facet_grid(property + n_examples ~ item_presentation_condition) +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20on%20num%20examples%20vs.%20condition%20and%20property-1.png)<!-- -->

*Observations:*

  - *Accidental condition: 2-example purple petals and 2-example
    squeaking are high-clustered; 1-example green feathers is
    low-clustered*
  - *Pedagogical condition: 2-example purple petals seem to have weakest
    inference strength*

Facet grid of slider response plotted on speaker vs. item presentation
condition

``` r
ggplot(
  trials_data,
  mapping = aes(
    x = response,
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

![](data_analysis_files/figure-gfm/Slider%20response%20on%20speaker%20vs.%20condition-1.png)<!-- -->

*Observations:*

  - *High mode of 1.0 for sb/pedagogical*

## Attention check and followup response data

Scatter plot of followup slider response word count vs. character count

``` r
ggplot(
  merge(freeform_followup, trials_data[, c("workerid", "item_presentation_condition")], by="workerid"),
  mapping = aes(
    x = n_words,
    y = n_chars,
    color = item_presentation_condition
  )
) +
  labs(
    title = "Freeform followup word vs. character count",
    x = "Number of words in freeform followup",
    y = "Number of characters in freeform followup"
  ) +
  geom_point() +
  scale_color_manual(
    values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
  )
```

    ## Warning: Removed 1 rows containing missing values (geom_point).

![](data_analysis_files/figure-gfm/Freeform%20followup%20word%20vs.%20char%20count-1.png)<!-- -->

*Observations*

  - *Relationship appears linear, even with high outliers*

Wordcount of freeform followup vs. item presentation condition

``` r
ggplot(
  freeform_followup,
  mapping = aes(
    x = n_words,
    y = proliferate.condition,
    group = proliferate.condition,
    fill = as.factor(proliferate.condition)
  )
) +
geom_boxplot() +
labs(
  title = "Freeform wordcount vs. item presentation condition",
  x = "Number of words in freeform followup response",
  y = "Item presentation condition") +
scale_fill_manual(
  values = c("indianred1", "indianred1", "lightgoldenrod1", "lightgoldenrod1", "darkolivegreen2", "darkolivegreen2", "cornflowerblue", "cornflowerblue")
) +
theme(legend.position = "none")
```

    ## Warning: Removed 1 rows containing non-finite values (stat_boxplot).

![](data_analysis_files/figure-gfm/Freeform%20followup%20wordcount%20vs.%20item%20presentation%20condition-1.png)<!-- -->

*Observations*

  - *1-example naive condition has largest IQR for number of words in
    freeform followup*
  - *2-example pedagogical has smallest IQR and smallest median for
    number of words in freeform followup*

Character count of freeform followup vs. item presentation condition

``` r
ggplot(
  freeform_followup,
  mapping = aes(
    x = n_chars,
    y = proliferate.condition,
    group = proliferate.condition,
    fill = as.factor(proliferate.condition)
  )
) +
geom_boxplot() +
labs(
  title = "Freeform charcount vs. item presentation condition",
  x = "Number of chars in freeform followup response",
  y = "Item presentation condition") +
scale_fill_manual(
  values = c("indianred1", "indianred1", "lightgoldenrod1", "lightgoldenrod1", "darkolivegreen2", "darkolivegreen2", "cornflowerblue", "cornflowerblue")
) +
theme(legend.position = "none")
```

    ## Warning: Removed 1 rows containing non-finite values (stat_boxplot).

![](data_analysis_files/figure-gfm/Freeform%20followup%20character%20count%20vs.%20item%20presentation%20condition-1.png)<!-- -->

Scatter plot of trials slider response to followup slider response

``` r
ggplot(
  all_sliders,
  mapping = aes(
    x = trials_response,
    y = followup_response,
    color = item_presentation_condition
  )
) +
  labs(
    title = "Trials slider response vs. followup slider response",
    x = "Trials slider response",
    y = "Followup slider response"
  ) +
  geom_point() +
  scale_color_manual(
    values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
  )
```

![](data_analysis_files/figure-gfm/Trials%20slider%20response%20vs.%20followup%20slider%20response-1.png)<!-- -->

*Observations*

  - *Does not seem to be clear 1:1 relationship between slider responses
    nor even strong linear relationship*
  - *Suggests participants may perceive difference between inferring
    event (e.g., witnessing another example with same feature)
    vs. inferring generic (e.g., “All Xs do Y”)*

Facet grid of difference between trial and followup slider responses
plotted on number of examples vs. item presentation condition

``` r
ggplot(
  all_sliders,
  mapping = aes(
    x = trials_minus_followup_sliders,
    y = (..count..) / tapply(..count.., ..PANEL.., sum)[..PANEL..],
    fill = as.factor(item_presentation_condition)
  )
) +
geom_histogram(
  color = "black",
  bins = 16) +
labs(
  x = "Trials slider response - followup slider response",
  y = "Fraction of total count"
) +
facet_grid(n_examples ~ item_presentation_condition) +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Slider%20diff.%20on%20num.%20examples%20vs.%20item%20presentation%20condition-1.png)<!-- -->

Scatter plot of freeform followup word count vs. difference between
trial and followup slider responses

``` r
ggplot(
  merge(all_sliders, freeform_followup),
  mapping = aes(
    x = n_words,
    y = trials_minus_followup_sliders,
    color = item_presentation_condition
  )
) +
  labs(
    title = "Freeform followup word count vs. trials-followup slider response diff",
    x = "Num words in freeform followup",
    y = "Trials slider response - followup slider response"
  ) +
  geom_point() +
  scale_color_manual(
    values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
  )
```

    ## Warning: Removed 1 rows containing missing values (geom_point).

![](data_analysis_files/figure-gfm/Followup%20wordcoutn%20vs.%20slider%20diff.-1.png)<!-- -->
