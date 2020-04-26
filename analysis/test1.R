library("jsonlite")
library(purrr)
library(tidyverse)

path <- "..//mturk//sandbox-results"
files <- dir(path)
jsonl <- map(files, function(f){(fromJSON(paste(path, f, sep="")))})
print(jsonl)
jsonc <- toJSON(jsonl)
print(jsonc)
write_json(toJSON(jsonl), "~/desktop/urop-tessler-tenenbaum/analysis/test.json")