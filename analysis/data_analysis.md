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

# Calculations

``` r
CIs <- combined_trials_data %>%
  group_by(item_presentation_condition, n_examples) %>%
  tidyboot_mean(column=slider_response)
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

# Visualization

``` r
# This is used on facet_grid plots

n_examples_labels <- c("n_examples: 1", "n_examples: 2", "n_examples:3")
names(n_examples_labels) <- c("1", "2", "3")

trial_num_labels <- c("trial_num: 1", "trial_num: 2", "trial_num: 3")
names(trial_num_labels) <- c("1", "2", "3")
```

Box plot of slider response vs. number of examples

``` r
ggplot(data=combined_trials_data, aes(x=slider_response, y=n_examples, group=n_examples, fill=as.factor(n_examples))) + geom_boxplot() + labs(title="Slider response vs. number of examples", x="Slider response", y="Number of examples") + scale_fill_manual(values=c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")) + theme(legend.position="none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20vs.%20num.%20examples-1.png)<!-- -->

Histogram and box plot of average time per slider response for each
subject

``` r
# Initialize empty data frame for subject average time per trial
subject_average_time <- data.frame()

# Combine every three rows of trials_data, as there are three trials per participant
for(i in 1:nrow(combined_trials_data)) {
  three_row_sum <- 0
  
  # Add next term to sum of three rows
  three_row_sum <- three_row_sum + combined_trials_data[i, "slider_time_in_seconds"]
  three_row_average <- three_row_sum / 3
  
  # If this is the last of the grouping of three rows, add to subject_average_time data frame
  if((i %% 3) == 0) {
    subject_average_time <- rbind(subject_average_time, data.frame(three_row_average, combined_trials_data[i, "n_examples"]))
    three_row_sum <- 0
  }
}

# Rename columns (to make a human-readable histogram)
names(subject_average_time)[1] <- "time_in_seconds"
names(subject_average_time)[2] <- "n_examples"

# Create histogram
histogram <- ggplot(subject_average_time, aes(x=time_in_seconds)) + geom_histogram(fill="cornflowerblue", color="black", bins=24) + labs(title="Average time per slider response", x="Average time (sec)", y="Count")

box_plot <- ggplot(data=subject_average_time, aes(x=time_in_seconds, group=n_examples, fill=as.factor(n_examples))) + geom_boxplot() + labs(title="Average time per slider response", x="Average time (sec)", y="Number of examples") + scale_fill_manual(values=c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")) + theme(legend.position="none")

grid.arrange(histogram, box_plot, ncol=2)
```

![](data_analysis_files/figure-gfm/Average%20time%20per%20slider%20response-1.png)<!-- -->

Box plot of total trial time per participant vs. number of examples
displayed

``` r
ggplot(data=combined_trials_data, aes(x=trial_time_in_seconds, y=n_examples, group=n_examples, fill=as.factor(n_examples))) + geom_boxplot() + labs(title="Total trial time vs. number of examples", x="Total trial time (sec)", y="Number of examples") + scale_fill_manual(values=c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")) + theme(legend.position="none")
```

![](data_analysis_files/figure-gfm/Total%20trial%20time%20vs.%20num.%20examples-1.png)<!-- -->

Facet grid of slider response plotted on number of examples vs. item
presentation condition

``` r
ggplot(combined_trials_data, aes(x=slider_response, y=(..count..)/tapply(..count..,..PANEL..,sum)[..PANEL..], fill=as.factor(item_presentation_condition))) + geom_histogram(color="black", bins=16) + labs(x="Slider response", y="Fraction of total count") + facet_grid(n_examples ~ item_presentation_condition, labeller=label_both) + scale_fill_manual(values=c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")) + theme(legend.position="none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20on%20num.%20examples%20vs.%20condition-1.png)<!-- -->

Facet grid of slider response plotted on trial number vs. item
presentation condition

``` r
ggplot(combined_trials_data, aes(x=slider_response, y=(..count..)/tapply(..count..,..PANEL..,sum)[..PANEL..], fill=as.factor(item_presentation_condition))) + geom_histogram(color="black", bins=16) + labs(x="Slider response", y="Fraction of total count") + facet_grid(trial_num ~ item_presentation_condition, labeller=label_both) + scale_fill_manual(values=c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")) + theme(legend.position="none")
```

![](data_analysis_files/figure-gfm/slider%20response%20on%20trial%20number%20vs.%20condition-1.png)<!-- -->

Facet grid of slider response plotted on number of examples vs. item
presentation condition and item property

``` r
ggplot(combined_trials_data, aes(x=slider_response, y=(..count..)/tapply(..count..,..PANEL..,sum)[..PANEL..], fill=as.factor(item_presentation_condition))) + geom_histogram(color="black", bins=6) + labs(x="Slider response", y="Fraction of total count") + facet_grid(n_examples ~ item_presentation_condition+property, labeller=labeller(n_examples=n_examples_labels)) + scale_fill_manual(values=c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")) + theme(legend.position="none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20on%20num%20examples%20vs.%20condition%20and%20property-1.png)<!-- -->

Facet grid of slider resopnse plotted on speaker vs. item presentation
condition

``` r
ggplot(combined_trials_data, aes(x=slider_response, y=(..count..)/tapply(..count..,..PANEL..,sum)[..PANEL..], fill=as.factor(item_presentation_condition))) + geom_histogram(color="black", bins=16) + labs(x="Slider response", y="Fraction of total count") + facet_grid(speaker ~ item_presentation_condition, labeller=label_both) + scale_fill_manual(values=c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")) + theme(legend.position="none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20on%20speaker%20vs.%20condition-1.png)<!-- -->

Line range of slider response means and confidence intervals grouped by
item presentation condition

``` r
ggplot() + geom_linerange(data=CIs, mapping=aes(x=item_presentation_condition, ymin=ci_lower, ymax=ci_upper, color=as.factor(item_presentation_condition)), size=1) + geom_point(data=CIs, mapping=aes(x=item_presentation_condition, y=mean), alpha=0.5, size=2) + scale_color_manual(values=c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")) + labs(y="Slider response", x="Item presentation condition") + theme(legend.position="none")
```

![](data_analysis_files/figure-gfm/Slider%20response%20means%20and%20CIs%20vs.%20condition-1.png)<!-- -->

Line range of slider response means and confidence intervals grouped by
number of examples

``` r
ggplot() + geom_linerange(data=CIs, mapping=aes(x=n_examples, ymin=ci_lower, ymax=ci_upper, color=as.factor(item_presentation_condition)), size=1) + geom_point(data=CIs, mapping=aes(x=n_examples, y=mean), alpha=0.5, size=2) + labs(y="Slider response", x="Number of examples", color="Item presentation condition") + scale_color_manual(values=c("indianred1", "lightgoldenrod1", "darkolivegreen2", "cornflowerblue")) + theme(legend.position="bottom")
```

![](data_analysis_files/figure-gfm/Slider%20response%20means%20and%20CIs%20vs.%20num%20examples-1.png)<!-- -->
