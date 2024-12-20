Genex Analysis
================
Teresa Gao
4 May 2020

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

    ## -- Attaching packages ----------------------------------------------------------------------------------------------- tidyverse 1.3.0 --

    ## v ggplot2 3.3.0     v purrr   0.3.4
    ## v tibble  3.0.1     v stringr 1.4.0
    ## v tidyr   1.0.2     v forcats 0.5.0
    ## v readr   1.3.1

    ## -- Conflicts -------------------------------------------------------------------------------------------------- tidyverse_conflicts() --
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

Go to Session \> Set Working Directory \> To Source File Location. This
ensures that we can find and access the files we need\!

The code below imports the experimental data, as extracted by
data\_extraction.R

``` r
catch_trials_data <- read.csv("catch_trials_data.csv")
combined_trials_data <- read.csv("combined_trials_data.csv")
subject_info_data <- read.csv("subject_info_data.csv")
```

# Calculations and Relabeling

Compute bootstrapped means and confidence intervals of user slider
response

``` r
CIs <- combined_trials_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  tidyboot_mean(column = slider_response)
```

    ## Warning: `data_frame()` is deprecated as of tibble 1.1.0.
    ## Please use `tibble()` instead.
    ## This warning is displayed once every 8 hours.
    ## Call `lifecycle::last_warnings()` to see where this warning was generated.

    ## Warning: `as_data_frame()` is deprecated as of tibble 2.0.0.
    ## Please use `as_tibble()` instead.
    ## The signature and semantics have changed, see `?as_tibble`.
    ## This warning is displayed once every 8 hours.
    ## Call `lifecycle::last_warnings()` to see where this warning was generated.

    ## Warning: `cols` is now required.
    ## Please use `cols = c(strap)`

Filter data to compute average slider response time for each user
(grouped by hashed WorkerID)

``` r
subject_average_time <- combined_trials_data %>%
  group_by(worker_id, n_examples, item_presentation_condition) %>%
  summarize(ave_time_slider_response = mean(slider_time_in_seconds))
```

Filter data for relabeling purposes (esp. facet grid graphs)

``` r
# Filter/relabel combined_trials_data labels
combined_trials_data <- combined_trials_data %>%
  mutate(
    item_presentation_condition =
      factor(item_presentation_condition,
        levels = c("pedagogical", "accidental"),
        labels = c("Pedagogical", "Accidental")
      ),
    trial_num =
      factor(trial_num,
        levels = c(1, 2, 3),
        labels = c("Trial 1", "Trial 2", "Trial 3")
      ),
    n_examples =
      factor(n_examples,
        levels = c(1, 2, 3, 4),
        labels = c("1 example", "2 examples", "3 examples", "4 examples")
      ),
    speaker =
      factor(speaker,
        levels = c("mh", "tg", "sb"),
        labels = c("Speaker: mh", "Speaker: tg", "Speaker: sb")
      )
  )

# Filter/relabel CIs data
CIs <- CIs %>%
  ungroup(var) %>% mutate(
    item_presentation_condition =
      factor(item_presentation_condition,
        levels = c("pedagogical", "accidental"),
        labels = c("Pedagogical", "Accidental")
      )
  )
```

# Visualization

Box plot of slider response vs. number of examples

``` r
ggplot(
  combined_trials_data,
  mapping = aes(
    x = slider_response,
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

  - *For 1 example: The plot is significantly left-skewed (more than 75%
    of responses greater than 0.50 slider response), with several low
    outliers under 0.25*

Box plot of slider response vs. item presentation condition

``` r
ggplot(
  combined_trials_data,
  mapping = aes(
    x = slider_response,
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
    variability*
  - *Pedagogical condition slider response is for the most part higher
    than accidental, though there are two low outliers below 0.25*

Box plot of average slider response time for each subject, grouped by
number of examples

``` r
ggplot(
  subject_average_time,
  mapping = aes(
    x = ave_time_slider_response,
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

  - *For 1 example: Average response time is around 5 seconds, with
    several large outliers*

Box plot of average slider response time for each subject, grouped by
item presentation condition

``` r
ggplot(
  subject_average_time,
  mapping = aes(
    x = ave_time_slider_response,
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

  - *Pedagogical average slider response time is mostly under 5 seconds
    and has relatively small range*
  - *Accidental average slider response time is very right-skewed, with
    two large outliers greater than 10 seconds and a median greater than
    5 seconds*

Box plot of total trial time per participant vs. number of examples
displayed

``` r
ggplot(
  combined_trials_data,
  mapping = aes(
    x = trial_time_in_seconds,
    y = n_examples,
    group = n_examples,
    fill = as.factor(n_examples)
  )
) +
geom_boxplot() +
labs(
  title = "Total trial time vs. number of examples",
  x = "Total trial time (sec)",
  y = "Number of examples") +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Total%20trial%20time%20vs.%20num.%20examples-1.png)<!-- -->

*Observations:*

  - *For 1 example: Total trial time is fairly low, though with many
    high outliers*

Facet grid of slider response plotted on number of examples vs. item
presentation condition

``` r
ggplot(
  combined_trials_data,
  mapping = aes(
    x = slider_response,
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

  - *Accidental weaker than pedagogical*
  - *Accidental has many responses \< 0.5*

Facet grid of slider response plotted on trial number vs. item
presentation condition

``` r
ggplot(
  combined_trials_data,
  mapping = aes(
    x = slider_response,
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
facet_grid(trial_num ~ item_presentation_condition) +
scale_fill_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20on%20trial%20number%20vs.%20condition-1.png)<!-- -->

*Observations:*

  - *In pedagogical: perhaps there are weaker inferences on trials 2 &
    3.*
  - *In accidental: looks like, trial 1 - strong, trial 2 - weak, trial
    3 - strong.*

Facet grid of slider response plotted on number of examples vs. item
presentation condition and item property

``` r
ggplot(
  combined_trials_data,
  mapping = aes(
    x = slider_response,
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

  - *In pedagogical: slider responses for green feathers \> purple
    petals \> squeaking. Other observations — both purple petals and
    squeaking have lower slider responses, and squeaking has a small
    local semi-peak around 0.75*
  - *In accidental: slider responses for squeaking \> purple petals \>
    green feathers*

Facet grid of slider response plotted on speaker vs. item presentation
condition

``` r
ggplot(
  combined_trials_data,
  mapping = aes(
    x = slider_response,
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

  - *In pedagogical: Strength of inference with sb \> mh \> tg. Other
    observations — speaker as mh and speaker as tg have low outliers
    below 0.25*
  - *In accidental: Strength of inference with tg \> mh \> sb. Other
    observations — speaker as sb seems to have count cluster around
    slider response of 0.75, and all three speakers have several low
    slider responses below 0.25*

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
    intervals*
  - *Mean pedagogical slider response is about 0.10 higher than mean
    accidental slider response*

Line range of slider response means and confidence intervals grouped by
number of examples

``` r
ggplot() +
geom_linerange(
  CIs,
  mapping = aes(
    x = n_examples,
    ymin = ci_lower,
    ymax = ci_upper,
    color = as.factor(item_presentation_condition)),
  size = 1
) +
geom_point(
  CIs,
  mapping = aes(
    x = n_examples,
    y = mean),
  alpha = 0.5,
  size = 2
) +
labs(
  y = "Slider response",
  x = "Number of examples",
  color = "Item presentation condition"
) +
scale_color_manual(
  values = c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")
) +
theme(legend.position = "bottom")
```

![](data_analysis_files/figure-gfm/Slider%20response%20means%20and%20CIs%20vs.%20num%20examples-1.png)<!-- -->

Gradient density ridges graph of slider response vs. item presentation
condition

``` r
ggplot(
  combined_trials_data,
  mapping = aes(
    x = slider_response,
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

![](data_analysis_files/figure-gfm/Gradient%20plot%20of%20slider%20response%20vs.%20condition-1.png)<!-- -->

*Observations:*

  - *Accidental has greater variability, with significant number of 0.50
    responses and a cluster below 0.25*
  - *Pedagogical has almost linear decrease in slider response
    frequency, with only a few below 0.25*
