library("jsonlite")
library("tidyverse")

path <- "~/desktop/urop-tessler-tenenbaum/mturk/sandbox-results/3BC9H1KCYU0NRFPQOVC3U0WRA5SYW1-3WQQ9FUS6BIJBQYQ62NEXSQKA1FB8H.json"
test_file <- fromJSON(paste(path))
tibble::glimpse(test_file)

# test_flat <- flatten(test_file)
# str(test_flat)

test_tibble <- enframe(unlist(test_file))

rgx_split <- "\\."
n_cols_max <-
  test_tibble %>%
  pull(name) %>%
  str_split(rgx_split) %>%
  map_dbl(~length(.)) %>%
  max()
n_cols_max

names_sep <- paste0("name", 1:n_cols_max)
test_sep <-
  test_tibble %>%
  separate(name, into = names_sep, sep = rgx_split, fill = "right")

test_sep

test_filter <-
  test_sep %>%
  filter(
    name4 == "user_response"
  )

test_filter