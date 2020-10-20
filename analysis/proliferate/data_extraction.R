# SETUP: Go to Session > Set Working Directory > To Source File Location

library(dplyr)

# Extract all file names in the MTurk production-results directory
folder_path <- "../../prolific/2020-fall/"

system_data <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-system.csv", sep=""))
subject_information <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-subject_information.csv", sep=""))

catch_data <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-catch_trials.csv", sep=""))
catch_data <- rename(catch_data, response = responses)
followup_data <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-followup_response_data.csv", sep=""))

trials_response_data <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-trials_response_data.csv", sep=""))
trials_response_data <- subset(trials_response_data, select=-c(trial_num))
trials_stimuli_streamlined <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-trials_stimuli_streamlined.csv", sep=""))
trials_data <- merge(trials_stimuli_streamlined, trials_response_data, by=c("workerid", "proliferate.condition"))

# Account n_examples for accidental-2 condition
trials_data <- trials_data[!(trials_data$proliferate.condition == "accidental-2" & trials_data$trial_num == 1),]
trials_data[trials_data$proliferate.condition == "accidental-2" & trials_data$trial_type == "trial", "n_examples"] <- 2

# Identify and remove participants with nonzero failures in attention checks
failed_catch_ids <- unique( catch_data[ which( catch_data$num_fails > 0), ]$workerid )
failed_followup_ids <- unique( followup_data[ which( followup_data$is_correct == "False"), ]$workerid )
failed_ids <- unique( c(failed_catch_ids, failed_followup_ids) )
trials_data <- trials_data[ -c(failed_ids) ]

# Write files, excluding test trial (workerid = 14)
write.csv(system_data[system_data$workerid != 14, ], "system_data.csv")
write.csv(catch_data[catch_data$workerid != 14, ], "catch_data.csv")
write.csv(followup_data[followup_data$workerid != 14, ], "followup_data.csv")
write.csv(subject_information[subject_information$workerid != 14, ], "subject_information.csv")
write.csv(trials_data[!(trials_data$workerid == 14 | trials_data$trial_type == "introduction"), ], "trials_data.csv")