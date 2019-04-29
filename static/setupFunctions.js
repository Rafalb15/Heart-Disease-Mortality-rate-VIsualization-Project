//function for adding to window onload event
function addLoadEvent(newEvent){
    if(typeof window.onload != 'function'){
        window.onload = newEvent;
    }else{
        let oldEvents = window.onload;
        window.onload = function(){
            if(oldEvents){
                oldEvents();
            }
            newEvent();
        }
    }
}

function get_state_abbreviation(state_name) {
    for (let i = 0; i < statesData.features.length; i++){
        if(statesData.features[i].properties.name === state_name){
            return statesData.features[i].properties.abbreviation;
        }
    }
    let str = "could not find state with name " + state_name;
    console.log(str);
    return str;
}

function get_county_pop_data_by_geoid(geoid){
    for (let i = 0; i < censusPopData.length; i++){
        if (censusPopData[i].geoid === geoid){
            return censusPopData[i];
        }
    }
    return null;
}

//converts the county name from the mortality rates data to geoid
// some bugs with puerto rico
function get_geoid_from_mort_rate_county_name(county, state_abbreviation){
    let counties = countyData.features
    let idx_mod = -7;
    if(state_abbreviation === "PR"){
        idx_mod = -10;
    }
    // try and get a match using county boundaries dataset
    for(let i = 0; i < counties.length; i++){
        if (counties[i].properties.STATE === state_abbreviation){
            if(county.substring(0, county.length+idx_mod) === counties[i].properties.NAME || county === counties[i].properties.NAME){
                return counties[i].properties.GEO_ID;
            }
        }
    }
    return null;
}