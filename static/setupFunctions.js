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