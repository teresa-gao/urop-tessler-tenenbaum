# SETUP: Go to Session > Set Working Directory > To Source File Location

# Extract all file names in the MTurk production-results directory
folder_path <- "../../../prolific/2020-fall/"

system_data <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-system.csv", sep=""))
followup_response_data <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-followup_response_data.csv", sep=""))
subject_information <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-subject_information.csv", sep=""))

trials_response_data <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-trials_response_data.csv", sep=""))
trials_stimuli_streamlined <- read.csv(paste(folder_path, "pilot-1-acc1-ped1-trials_stimuli_streamlined.csv", sep=""))
trials_data <- merge(trials_stimuli_streamlined, trials_response_data, by="workerid")

# Write files, excluding test trial (workerid = 14)
write.csv(system_data[system_data$workerid != 14, ], "system_data.csv")
write.csv(followup_response_data[followup_response_data$workerid != 14, ], "followup_response_data.csv")
write.csv(subject_information[subject_information$workerid != 14, ], "subject_information.csv")
write.csv(trials_data[trials_data$workerid != 14, ], "trials_data.csv")