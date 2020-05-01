# SETUP: Go to Session > Set Working Directory > To Source File Location

library("RJSONIO")
library("jsonlite")
library("tidyverse")

# Extract all file names in the MTurk sandbox-results directory
folder_path = "../mturk/sandbox-results/"
files <- dir(folder_path)

# Extract trials_data from each of the MTurk files
catch_df <- data.frame()
combined_df <- data.frame()
for(file_name in files) {
  full_file_name <- paste(path, file_name, sep="/")
  test_file <- fromJSON(full_file_name)
  
  # For catch_trials
  file_catch_data <- test_file$answers$catch_trials
  catch_df <- rbind(catch_df, file_catch_data)
  
  # For trials_data
  file_trials_data <- test_file$answers$trials_data
  combined_df <- rbind(combined_df, file_trials_data)
}

# Exclude the intro "trial"
combined_df = combined_df %>% filter(trial_num != 0)
combined_df = subset(combined_df, select = -c(intro_time_in_seconds))

# Write data to CSV file, for use in data_analysis.Rmd
write.csv(combined_df, "combined_trials_data.csv")