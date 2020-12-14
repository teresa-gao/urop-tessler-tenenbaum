import csv

pilot_2_ids = set()
pilot_3_ids = set()
pilot_4_ids = set()
pilot_5_ids = set()
pilot_6_ids = set()

def get_ids(csv_file, ids_set):
    """ Adds all Prolific participant IDs from CSVs file to given set. """
    csv_reader = csv.reader(csv_file, delimiter=",")
    line_count = 0
    for row in csv_reader:
        if line_count != 0:
            ids_set.add(row[1])
        line_count += 1

# get Prolific participant IDs from each round of pilot trials
with open("../pilot-2/pilot-1-acc1-ped1-workerids.csv") as csv_file:
    get_ids(csv_file, pilot_2_ids)
with open("../pilot-3/genex-pilot-3-workerids.csv") as csv_file:
    get_ids(csv_file, pilot_3_ids)
with open("../pilot-4/genex-pilot-4-workerids.csv") as csv_file:
    get_ids(csv_file, pilot_4_ids)
with open("../pilot-5/genex-pilot-5-workerids.csv") as csv_file:
    get_ids(csv_file, pilot_5_ids)
with open("genex-pilot-6-workerids.csv") as csv_file:
    get_ids(csv_file, pilot_6_ids)


# print("\npilot_2", pilot_2_ids)

# print("\npilot_3", pilot_3_ids)

# print("\npilot_4", pilot_4_ids)

# print("\npilot_5", pilot_5_ids)

current_round_ids = pilot_6_ids
duplicate_ids = { (workerid, "pilot-2") for workerid in current_round_ids if workerid in pilot_2_ids } \
        .union( { (workerid, "pilot-3") for workerid in current_round_ids if workerid in pilot_3_ids } ) \
        .union( { (workerid, "pilot-4") for workerid in current_round_ids if workerid in pilot_4_ids } ) \
        .union( { (workerid, "pilot-5") for workerid in current_round_ids if workerid in pilot_5_ids } )

print(duplicate_ids)