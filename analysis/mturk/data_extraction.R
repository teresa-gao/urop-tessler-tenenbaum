# SETUP: Go to Session > Set Working Directory > To Source File Location

library("RJSONIO")
library("jsonlite")
library("tidyverse")
library("plyr")

# Extract all file names in the MTurk production-results directory
folder_path = "../../mturk/2020-spring/production-results/"
files <- dir(folder_path)

# Extract trials_data from each of the MTurk files
catch_df <- data.frame()
combined_df <- data.frame()
subject_df <- data.frame()
for(file_name in files) {
  full_file_name <- paste(folder_path, file_name, sep="/")
  test_file <- fromJSON(full_file_name)
  
  # WorkerID (pre-hashed by nosub)
  worker_id <- test_file$WorkerId
  
  # For catch_trials
  file_catch_data <- test_file$answers$catch_trials
  file_catch_data$responses <- vapply(file_catch_data$responses, paste, collapse=", ", character(1L)) # flatten subject data
  catch_df <- rbind(catch_df, file_catch_data %>% mutate(worker_id = worker_id))
  
  # For trials_data
  file_trials_data <- test_file$answers$trials_stimuli_streamlined
  combined_df <- rbind(combined_df, file_trials_data %>% mutate(worker_id = worker_id))
  
  # For subject information
  file_subject_data <- test_file$answers$subject_information
  subject_df <- rbind.fill(subject_df, as.data.frame(file_subject_data) %>% mutate(worker_id = worker_id))
}

# Exclude the intro "trial"
combined_df = combined_df %>% filter(trial_num != 0)

# Write data to CSV file, for use in data_analysis.Rmd
write.csv(catch_df, "catch_trials_data.csv")
write.csv(combined_df, "combined_trials_data.csv")
write.csv(subject_df, "subject_info_data.csv")