Genex Analysis
================
Teresa Gao
4 May 2020

# Setup

Load required libraries

``` r
library("ggplot2")
library("gridExtra")
```

Go to Session \> Set Working Directory \> To Source File Location. This
ensures that we can find and access the files we need\!

The code below imports the experimental data, as extracted by
data\_extraction.R

``` r
catch_trials_dada <- read.csv("catch_trials_data.csv")
combined_trials_data <- read.csv("combined_trials_data.csv")
subject_info_data <- read.csv("subject_info_data.csv")
```

# Visualization

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
ggplot(combined_trials_data, aes(x=slider_response)) + geom_histogram(fill="cornflowerblue", color="black", bins=12) + labs(x="Slider Response", y="Count") + facet_grid(n_examples ~ item_presentation_condition)
```

![](data_analysis_files/figure-gfm/Slider%20response%20on%20num.%20examples%20vs.%20condition-1.png)<!-- -->

Facet grid of slider response plotted on number of examples vs. item
presentation condition and item property

``` r
ggplot(combined_trials_data, aes(x=slider_response)) + geom_histogram(fill="cornflowerblue", color="black", bins=6) + labs(x="Slider Response", y="Count") + facet_grid(n_examples ~ item_presentation_condition+property)
```

![](data_analysis_files/figure-gfm/Slider%20response%20on%20num%20examples%20vs.%20condition%20and%20property-1.png)<!-- -->

Facet grid of slider resopnse plotted on speaker vs. condition

``` r
ggplot(combined_trials_data, aes(x=slider_response)) + geom_histogram(fill="cornflowerblue", color="black", bins=12) + labs(x="Slider Response", y="Count") + facet_grid(speaker ~ item_presentation_condition)
```

![](data_analysis_files/figure-gfm/Slider%20response%20on%20speaker%20vs.%20condition-1.png)<!-- -->
