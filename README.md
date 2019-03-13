# Heart-Disease-Mortality-rate-VIsualization-Project

# structure:
## code  <br />
#### static <br />
###### ----> supporting files  <br />
###### ----> data_as_json.js (omitted, you have to add yourself)<br />
###### 1. Download data as json from the site
###### 2. Place it in static folder
###### 3. Place var heart_disease_data = before the first { in top of the file
#### notes.txt <br />
#### index.html <br />
#### server.py

#### To run: python server.py port_number <br />
##### Example: python server.py 8000

# TODO:
~~fast search through json array~~<br />
~~allow two state selection~~<br />
~~application runs on a Flask server~~<br />
~~display county information once the user clicks zooms far enough~~<br />
~~----> this is implemented, will looking for optimization possibilities to make this faster~~<br />
~~----> dataset is large and there are many features because (counties > states)~~<br />
allow a comparison mode between race and genders (diverging color map) <br />
#### county data is made available by US census, data downloaded from http://eric.clst.org/tech/usgeojson/ <br />
