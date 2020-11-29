import csv

pilot_2_ids = []
pilot_3_ids = []
pilot_4_ids = []

with open("../pilot-2/pilot-1-acc1-ped1-workerids.csv") as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=",")
    line_count = 0
    for row in csv_reader:
        if line_count != 0:
            pilot_2_ids.append(row[1])
        line_count += 1

with open("../pilot-3/genex-pilot-3-workerids.csv") as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=",")
    line_count = 0
    for row in csv_reader:
        if line_count != 0:
            pilot_3_ids.append(row[1])
        line_count += 1

with open("genex-pilot-4-workerids.csv") as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=",")
    line_count = 0
    for row in csv_reader:
        if line_count != 0:
            pilot_4_ids.append(row[1])
        line_count += 1

# print("\npilot_2", pilot_2_ids)

# print("\npilot_3", pilot_3_ids)

# print("\npilot_4", pilot_4_ids)

duplicate_ids = [ (workerid, "pilot-2") for workerid in pilot_4_ids if workerid in pilot_2_ids ]
duplicate_ids += [ (workerid, "pilot-3") for workerid in pilot_4_ids if workerid in pilot_3_ids]
print(duplicate_ids)