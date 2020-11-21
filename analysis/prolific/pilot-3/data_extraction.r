# SETUP: Go to Session > Set Working Directory > To Source File Location

library(dplyr)

# extract files
streamlined_data <- read.csv("../../../prolific/2020-fall/pilot-3/genex-pilot-3-streamlined_data.csv")
participant_demographics <- read.csv("../../../prolific/2020-fall/pilot-3/genex-pilot-3-subject_information.csv")

# TODO: include information about specific catch trial and followup question fails

# save copy of files in an easier-to-access location
write.csv(streamlined_data, "streamlined_data.csv")
write.csv(participant_demographics, "participant_demographics.csv")