import json


filtered_data = []

labels = ["type", "name", "state"]

with open('./static/censusCountyPopData.js') as json_file:
    data = json.load(json_file)

    for entry in data:
        comma_idx = entry["GEO.display-label"].rfind(",")
        e = {
            "type": "county",
            "name": entry["GEO.display-label"][:comma_idx],
            "state": entry["GEO.display-label"][comma_idx+2:]
        }
        print(e)