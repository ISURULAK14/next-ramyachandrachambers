import math

coords = {
    'pin-usa': (23.5, 30.5),
    'pin-ireland': (46.8, 20.5),
    'pin-portugal': (46.8, 27.5),
    'pin-mali': (47.5, 41.5),
    'pin-uk': (48.5, 20.5),
    'pin-france': (49.8, 23.5),
    'pin-belgium': (50.6, 21.2),
    'pin-netherlands': (51.0, 19.8),
    'pin-luxembourg': (51.2, 22.2),
    'pin-switzerland': (51.8, 23.8),
    'pin-denmark': (52.2, 17.8),
    'pin-germany': (52.2, 20.8),
    'pin-norway': (52.5, 15.5),
    'pin-italy': (53.2, 26.5),
    'pin-malta': (53.5, 30.8),
    'pin-austria': (53.8, 22.8),
    'pin-sweden': (54.2, 15.0),
    'pin-slovakia': (55.0, 22.5),
    'pin-greece': (55.5, 28.5),
    'pin-latvia': (56.5, 17.5),
    'pin-romania': (56.5, 24.0),
    'pin-israel': (58.5, 32.8),
    'pin-zanzibar': (59.6, 52.5),
    'pin-uae': (60.5, 34.0),
    'pin-india': (68.5, 38.0),
    'pin-maldives': (68.8, 50.5),
    'pin-srilanka': (69.8, 46.8),
    'pin-bangladesh': (72.5, 35.5),
    'pin-malaysia': (74.8, 44.5),
    'pin-china': (75.5, 28.0),
    'pin-singapore': (75.6, 48.0),
    'pin-korea': (81.8, 26.5),
    'pin-japan': (85.2, 27.5),
    'pin-australia': (86.8, 70.5),
    'pin-nz': (94.0, 75.0)
}

# 7 Cohorts of 5 (35 total unique pins):
# Slot 1: Far West (Americas / W. Africa / SW Europe)
# Slot 2: Europe (N/C/S/E Europe)
# Slot 3: Middle East / E. Africa / Indian Ocean
# Slot 4: South Asia
# Slot 5: East Asia / SE Asia / Oceania

cohorts = [
    # Cohort 1: Americas, N. Europe, Middle East, S. Asia, E. Asia
    ['pin-usa', 'pin-norway', 'pin-uae', 'pin-india', 'pin-japan'],

    # Cohort 2: W. Africa, C. Europe, E. Africa, S. Asia, Oceania
    ['pin-mali', 'pin-germany', 'pin-zanzibar', 'pin-srilanka', 'pin-australia'],

    # Cohort 3: SW Europe, N. Europe, Middle East, S. Asia, SE Asia
    ['pin-portugal', 'pin-sweden', 'pin-israel', 'pin-bangladesh', 'pin-singapore'],

    # Cohort 4: NW Europe, E. Europe, Indian Ocean, E. Asia, Oceania
    ['pin-ireland', 'pin-romania', 'pin-maldives', 'pin-china', 'pin-nz'],

    # Cohort 5: W. Europe, S. Europe, C. Europe, SE Asia, E. Asia
    ['pin-uk', 'pin-greece', 'pin-austria', 'pin-malaysia', 'pin-korea'],

    # Cohort 6: W. Europe, Baltic, Mediterranean, Alps, etc.
    ['pin-france', 'pin-latvia', 'pin-malta', 'pin-switzerland', 'pin-belgium'],

    # Cohort 7: Low Countries / Scandinavia / C. Europe
    ['pin-netherlands', 'pin-denmark', 'pin-slovakia', 'pin-luxembourg', 'pin-italy']
]

# Wait, let's look at Cohort 6 and Cohort 7 above:
# In Europe, having 5 european countries in Cohort 6 and Cohort 7 will still crowd Europe!
# Because there are ~19 European countries, 1 Americas, 2 Africa, 2 Middle East, 4 South Asia/Indian Ocean, 5 East/SE Asia, 2 Oceania!
# Total Non-Europe: 1 + 2 + 2 + 4 + 5 + 2 = 16 non-European countries!
# Total Europe: 19 European countries!
# To prevent overlap in EVERY cohort:
# Each cohort should have AT MOST 2 or 3 European countries, AND the 2 European countries in the same cohort must be on opposite ends of Europe (e.g. West Europe + East/North Europe, or North Scandinavia + Mediterranean South)!
