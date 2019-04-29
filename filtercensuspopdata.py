import json


county_data = []

with open('./static/censusCountyPopData.json') as json_file:
    data = json.load(json_file)
    for entry in data[1:]:
        comma_idx = entry["GEO.display-label"].rfind(",")
        over_thirty_five = str(int(entry["HC01_VC15"]) + int(entry["HC01_VC16"]) + int(entry["HC01_VC17"]) + int(entry["HC01_VC18"]) + int(entry["HC01_VC41"]))
        overall_apia = str(int(entry["HC01_VC86"])+int(entry["HC01_VC87"]))
        e = {
            "geoid": entry["GEO.id"],
            "name": entry["GEO.display-label"][:comma_idx],
            "state": entry["GEO.display-label"][comma_idx+2:],
            "overall_overall": entry["HC01_VC03"],
            "male_overall": entry["HC01_VC04"],
            "female_overall": entry["HC01_VC05"],
            "over_sixty_five": entry["HC01_VC41"],
            "over_thirty_five": over_thirty_five,
            "over_sixty_five_male": entry["HC01_VC42"],
            "over_sixty_five_female": entry["HC01_VC43"],
            "overall_white": entry["HC01_VC83"],
            "overall_black": entry["HC01_VC84"],
            "overall_aian": entry["HC01_VC85"],
            "overall_apia": overall_apia,
            "overall_hispanic": entry["HC01_VC93"]
        }
        county_data.append(e)

with open('./static/censusPopDataFiltered.json', 'w') as outfile:
    json.dump(county_data, outfile)
