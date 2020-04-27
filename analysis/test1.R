library("jsonlite")
library(purrr)
library(tidyverse)

path <- "c:/users/teresa/desktop/urop-tessler-tenenbaum/mturk/sandbox-results"
files <- dir(path)
jsonl <- map(files, function(f){(fromJSON(paste(path, f, sep="")))})
print("jsonl is:")
print(jsonl)
jsonc <- toJSON(jsonl)
print("jsonc is:")
print(jsonc)
write_json(toJSON(jsonl), "~/desktop/urop-tessler-tenenbaum/analysis/test.json")