library("rjson")
library("RJSONIO")
library("jsonlite")
library("tidyverse")
library("geojsonR")

folder_path = "../mturk/sandbox-results/"
files <- dir(folder_path)
getwd()

json_read <- function(f){
  open_file = fromJSON(paste(folder_path, f, sep=""))
  return(open_file$answers$trials_data)
}

getwd()
json_extracted <- map(files, json_read)
write_json(toJSON(json_extracted), "json_extracted.json")