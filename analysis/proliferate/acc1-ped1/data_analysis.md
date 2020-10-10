Genex Analysis: Fall 2020 pilot 1
================
Teresa Gao
9 October 2020

# About

This R Notebook reports data from pilot experiments run during Fall 2020
on Proliferate; pilot data was collected for a previous version of this
study during Spring 2020 on MTurk. The findings of the latter are
occasionally referenced here.

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

    ## -- Attaching packages --------------------------------------- tidyverse 1.3.0 --

    ## v ggplot2 3.3.2     v purrr   0.3.4
    ## v tibble  3.0.3     v stringr 1.4.0
    ## v tidyr   1.1.2     v forcats 0.5.0
    ## v readr   1.3.1

    ## -- Conflicts ------------------------------------------ tidyverse_conflicts() --
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
```

If running/editing in RStudio, go to **Session \> Set Working Directory
\> To Source File Location**. This ensures that we can find and access
the files we need\!

The code below imports the experimental data, as extracted by
data\_extraction.R

``` r
system_dava <- read.csv("system_data.csv")
followup_response_data <- read.csv("followup_response_data.csv")
subject_information <- read.csv("subject_information.csv")
trials_data <- read.csv("trials_data.csv") %>% filter(trial_type == "trial")
```

# Calculations and Relabeling

Compute bootstrapped means and confidence intervals of user slider
response

``` r
CIs <- trials_data %>%
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

# Visualization

Box plot of slider response vs. number of examples

``` r
ggplot(
  trials_data,
  mapping = aes(
    x = response,
    y = n_examples,
    group = n_examples,
    fill = as.factor(n_examples)
  )
) +
geom_boxplot() +
labs(
  title = "Slider response vs. number of examples",
  x = "Slider response",
  y = "Number of examples"
) +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20vs.%20num.%20examples-1.png)<!-- -->

*Observations:*

  - *The plot looks relatively symmetrically distributed. This is not
    unexpected, since all pilot trials had the same number of examples
    (1) and are grouped together*
  - *As responses for all conditions (accidental and pedagogical) are
    plotted here, it looks like the responses may have balanced each
    other out*

Box plot of slider response vs. item presentation condition

``` r
ggplot(
  trials_data,
  mapping = aes(
    x = response,
    y = item_presentation_condition,
    group = item_presentation_condition,
    fill = as.factor(item_presentation_condition)
  )
) +
geom_boxplot() +
labs(
  title = "Slider response vs. item presentation condtion",
  x = "Slider response",
  y = "Item presentation condition"
) +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20vs.%20condition-1.png)<!-- -->

*Observations:*

  - *Accidental condition slider response appears to have greater
    variability; this is consistent with previous pilot trials of this
    condition*
  - *Pedagogical condition slider response median value is greater than
    Q3 for accidental (\!)*

Box plot of average slider response time for each subject, grouped by
number of examples

``` r
ggplot(
  trials_data,
  mapping = aes(
    x = response_time_in_seconds,
    y = n_examples,
    group = n_examples,
    fill = as.factor(n_examples)
  )
) +
geom_boxplot() +
labs(
  title = "Average slider response time",
  x = "Average time (sec)",
  y = "Number of examples"
) +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Avg.%20slider%20response%20time%20vs.%20num.%20examples-1.png)<!-- -->

*Observations:*

  - *For 1 example: Median response time is around 10 seconds (about
    double the median for Spring 2020 pilots on MTurk), with several
    large outliers*

Box plot of average slider response time for each subject, grouped by
item presentation condition

``` r
ggplot(
  trials_data,
  mapping = aes(
    x = response_time_in_seconds,
    y = item_presentation_condition,
    group = item_presentation_condition,
    fill = as.factor(item_presentation_condition)
  )
) +
geom_boxplot() +
labs(
  title = "Average slider response time",
  x = "Average time (sec)",
  y = "Item presentation condition") +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Avg.%20slider%20response%20time%20vs.%20condition-1.png)<!-- -->

*Observations:*

  - *Accidental condition participants had median slider response time
    greater than Q3 for pedagogical; perhaps this, along with the wider
    slider response distribution, reflect greater participant
    uncertainty?*
  - *Accidental condition also saw two high outliers*

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
  x = "Slider response", y = "Fraction of total count"
) +
facet_grid(n_examples ~ item_presentation_condition) +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20on%20num.%20examples%20vs.%20condition-1.png)<!-- -->

*Observations:*

  - *Both accidental and pedagogical distributions saw wide spread*
  - *Low accidental peak \< 0.5; high pedagogical peak at 1.0*

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

  - *Accidental condition: squeaking is grouped in mid-high range;
    purple petals are in mid-low; accidental green feathers is lowest
    overall*
  - *Pedagogical condition: purple petals grouped in middle to mid-high
    range; squeaking spread widely from \< 0.5 to 1.0*
  - *Unclear if squeaking presentation is causing strange range of
    slider responses; will revisit this trend with greater sample size*

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

  - *Some conditions (accidental/sb, pedagogical/tg) with relatively
    high spread*
  - *As with other facet grids above, later larger sample size should
    confirm or refute these observed patterns*

Line range of slider response means and confidence intervals grouped by
item presentation condition

``` r
ggplot() +
geom_linerange(
  CIs,
  mapping = aes(
    x = item_presentation_condition,
    ymin = ci_lower,
    ymax = ci_upper,
    color = as.factor(item_presentation_condition)),
  size = 1
) +
geom_point(
  CIs,
  mapping = aes(
    x = item_presentation_condition,
    y = mean),
  alpha = 0.5,
  size = 2
) +
scale_color_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
labs(
  y = "Slider response",
  x = "Item presentation condition"
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20means%20and%20CIs%20vs.%20condition-1.png)<!-- -->

*Observations:*

  - *Both pedagogical and accidental appear to have similar confidence
    intervals; this was also true for Spring 2020 pilot data*
  - *Mean pedagogical slider response is about 0.15 higher than mean
    accidental slider response, which is close to the 0.10 from the
    spring*

Gradient density ridges graph of slider response vs. item presentation
condition

``` r
ggplot(
  trials_data,
  mapping = aes(
    x = response,
    y = item_presentation_condition, fill = ..x..
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
    CIs,
    inherit.aes = F,
    mapping = aes(
      xmin = ci_lower, xmax = ci_upper,
      y = as.numeric(item_presentation_condition) + 0.8
    ),
    size = 1.25, color = "black"
  ) + geom_point(
    CIs,
    inherit.aes = F,
    mapping = aes(
      x = mean,
      y = as.numeric(item_presentation_condition) + 0.8
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
    name = "Implied Prevalence", option = "D",
    breaks = c(0, 1)
  ) +
  guides(fill = F) +
  theme(
    axis.title.y = element_blank(),
    axis.title.x = element_text(hjust = 0.5, vjust = 0)
  ) +
  labs(x = "Probability of Future Instance having Property")
```

    ## Warning in FUN(X[[i]], ...): NAs introduced by coercion
    
    ## Warning in FUN(X[[i]], ...): NAs introduced by coercion

    ## Warning: Removed 2 rows containing missing values (geom_linerangeh).

    ## Warning: Removed 2 rows containing missing values (geom_point).

![](data_analysis_files/figure-gfm/Gradient%20plot%20of%20slider%20response%20vs.%20condition-1.png)<!-- -->
