library(geojsonR)

folder_path = "c:/users/teresa/desktop/urop-tessler-tenenbaum/mturk/sandbox-results/"
print(folder_path)

merge_files(folder_path, paste(folder_path,"combined.json"))
