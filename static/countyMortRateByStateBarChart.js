// County Data By State Bar Chart -DS


class CountyMortRateByStateBarChart {

    constructor(w, h, container){
        this.w = w;
        this.h = h;
        this.container = container;
        this.y_pad = 40;
        this.x_pad = 50;
        this.graph_mode = "State";
        this.sort_mode = "mortality rate";
        this.cur_state = null;
        this.tooltip = null;
        this.title = null;
        this.svg = null;
        this.xScale = null;
        this.yScale = null;

        //the order of these is important
        this.setup_tooltip(container);
        this.setup_buttons(container);
        this.setup_title(container);
        this.setup_svg(container);
    }

    setup_tooltip(container) {
        this.tooltip = container.append("div")
            .attr("id", "tooltip")
            .style("background-color", "rgba(117, 190, 218, 0.7)")
            .classed("hidden", true);
        this.tooltip.append("p")
            .append("strong")
            .append("span")
            .attr("id", "tooltipLabel")
            .text("Label Heading")
        this.tooltip.append("p")
            .append("span")
            .attr("id", "value")
            .text("100");
    }

    setup_buttons(container) {
        container.append("button")
            .attr("type", "button")
            .attr("id", "sort_graph")
            .text("Sort Graph")
            .style("width", "100px")
            .on("click", function() {
                if (countyMortRateByStateBarChart.sort_mode === "mortality rate"){
                    countyMortRateByStateBarChart.sort_mode = "alphabetical";
                }else if(countyMortRateByStateBarChart.sort_mode === "alphabetical"){
                    countyMortRateByStateBarChart.sort_mode = "mortality rate";
                }
                countyMortRateByStateBarChart.sort_bars(200, 1500);
            });

        container.append("button")
            .attr("type", "button")
            .attr("id", "change_graph")
            .text("Switch to county mode")
            .style("width", "200 px")
            .on("click", function(){
                if (countyMortRateByStateBarChart.graph_mode === "State"){
                    countyMortRateByStateBarChart.graph_mode = "County";
                    container.select("#change_graph").text("Switch to state mode");
                }else if (countyMortRateByStateBarChart.graph_mode === "County"){
                    countyMortRateByStateBarChart.graph_mode = "State";
                    container.select("#change_graph").text("Switch to county mode");
                }
                countyMortRateByStateBarChart.update_bars(countyMortRateByStateBarChart.cur_state);
            });
    }

    setup_title(container){
        let w = this.w;
        this.title = container.append("span")
            .attr("id", "graph_title")
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("text-align","center")
            .style("display", "inline-block")
            .style("width", w-600 + "px");
    }

    setup_svg(container) {
        let y_pad = this.y_pad;
        let x_pad = this.x_pad;
        let h = this.h;
        let w = this.w;

        this.svg = container.append("div")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g");

        this.xScale = d3.scaleBand()
            .rangeRound([x_pad, w-100])
            .padding(0.15)
            .align(0.1);

        this.yScale = d3.scaleLinear()
            .range([h-y_pad , 10]);

        this.svg.append("g")
            .attr("id", "y_axis")
            .attr("transform", "translate("+x_pad+",0)");

        this.svg.append("line")
            .attr("x1", x_pad)
            .attr("y1", h-y_pad+1)
            .attr("x2", w-100)
            .attr("y2", h-y_pad+1)
            .attr("stroke-width", 1)
            .attr("stroke", "black");

        this.svg.append("text")
            .attr("id", "y_label")
            .attr("transform", "rotate(-90)")
            .attr("x",0 - (h / 2)+y_pad/2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Mortaility Rate");

        this.svg.append("text")
            .attr("id", "x_label")
            .attr("y", h)
            .attr("x", w/2)
            .attr("dy", -25)
            .attr("dx", -50)
            .style("text-anchor", "middle")
            .text("State/County");
    }

    update_bars(state){
        if(state){
            this.cur_state = state;
        }

        let data = [];
        let svg = this.svg;
        let xScale = this.xScale;
        let yScale = this.yScale;
        let fill_f = function(d) { return; };

        if (this.graph_mode === "State"){
            //this.state_mort_rate_bars();
            data = this.get_states_data();
            this.container.select("#graph_title").text("Mortality rate in each state for Gender: (" + gender + ") and Race: (" + race + ")");
            svg.select("#x_label").text("State");
            fill_f = function(d) {
                if (d.type === "Nation") {return "green"; }
                return countyMortRateByStateBarChart.graph_bar_color(d.mort_rate);
            };
        }else if (this.graph_mode === "County"){
            //this.county_mort_rate_bars(this.cur_state);
            data = this.get_county_data(state);
            this.container.select("#graph_title").text("Mortality rate across counties in " + state + " for Gender: " + gender + " and Race: " + race + "");
            svg.select("#x_label").text("County");
            fill_f = function(d){
                if (d.type === "State") { return "green"; }
                return countyMortRateByStateBarChart.graph_bar_color(d.mort_rate);
            }
        }

        //update xscale and yscale
        xScale.domain(d3.range(data.length));
        yScale.domain([0, d3.max(data, function(d) { return d.mort_rate; })]);

        //update axes
        let yAxis = d3.axisLeft().scale(yScale);
        svg.select("#y_axis").call(yAxis);
        
        //update bars
        let old = svg.selectAll("rect").data(data);
        let rects = old.enter().append("rect").merge(old);
        rects = this.setup_rectangles(rects);
        rects.attr("fill", fill_f).attr("opacity", 0.7);
        this.setup_tooltip_hover(rects);
        old.exit().remove();

        this.sort_bars(0, 0);
    }

    // set the sizes and scales of the rectangle
    setup_rectangles(rects){
        let xScale = this.xScale;
        let yScale = this.yScale;
        let h = this.h;
        let y_pad = this.y_pad
        rects.attr("x", function(d, i) {return xScale(i);})
            .attr("y", function(d) {return yScale(d.mort_rate);})
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) {return (h - y_pad) - yScale(d.mort_rate);});
        return rects
    }

    //add tooltip on hover to rectangles
    setup_tooltip_hover(rects){
        let w = this.w;
        let state = this.cur_state;
        let map_mode = this.map_mode;
        rects.on("mouseover", function(d) {
                //Update and show the tooltip
                d3.select("#tooltip")
                    .style("left", (w -100) + "px")
                    .select("#value")
                    .text(d.mort_rate + "/100K");
                d3.select("#tooltip").select("#tooltipLabel").text(d.name);
                d3.select("#tooltip").classed("hidden", false);
                // highlight the state/county on the map
                if(map_type_level === "state"){
                    map.eachLayer(function(layer){
                        if(layer.feature){
                            if(layer.feature.properties.name === d.name){
                                highlightFeature({target: layer});
                            }
                        }
                    });
                }else if (d.type === "County"){
                    let geoid = get_geoid_from_mort_rate_county_name(d.name, state);
                    map.eachLayer(function(layer){
                        if(layer.feature){
                            if(layer.feature.properties.GEO_ID === geoid){
                                highlightCountyFeature({target: layer});
                            }
                        }
                    });
                }
            })
            .on("mouseout", function(d) { 
                d3.select("#tooltip").classed("hidden", true);
                //unhighlight state/county
                if(map_type_level === "state"){
                    map.eachLayer(function(layer){
                        if(layer.feature){
                            if(layer.feature.properties.name === d.name){
                                resetHighlight({target: layer});
                            }
                        }
                    });
                }else if(d.type === "County"){
                    let geoid = get_geoid_from_mort_rate_county_name(d.name, state);
                    map.eachLayer(function(layer){
                        if(layer.feature){
                            if(layer.feature.properties.GEO_ID === geoid){
                                resetHighlightCounty({target: layer});
                            }
                        }
                    });
                }
            });
        return rects;
    }

    highlight_county_selection(selection, state) {
        // go through all of the values and look match up the map selection and the bars
        if (this.graph_mode === "County"){
            this.svg.selectAll("rect").each(function(d, i) {
                // the bar that is howevered over in the map will be yellow
                if (state == d.state && d.name.includes(selection) && d.type === "County") {
                    d3.select(this).attr("fill", "DodgerBlue");
                } else {
                    d3.select(this).attr("fill", function(d) {
                        if (d.type === "State") {
                            return "green";
                        }
                        return countyMortRateByStateBarChart.graph_bar_color(d.mort_rate);
                    })
                    d3.select(this).attr("opacity", 0.7);
                }
            });
        }
    }

    highlight_state_selection(state) {
        // go through all of the values and look match up the map selection and the bars
        if (this.graph_mode === "State"){
            this.svg.selectAll("rect").each(function(d, i) {
                // the bar that is howevered over in the map will be yellow
                if (state == d.name) {
                    d3.select(this).attr("fill", "DodgerBlue");
                } else {
                    d3.select(this).attr("fill", function(d) {
                        if (d.type === "Nation") {
                            return "green";
                        }
                        return countyMortRateByStateBarChart.graph_bar_color(d.mort_rate);
                    })
                    d3.select(this).attr("opacity", 0.7);
                }
            });
        }
    }

    // switch between sorting alphabetically and by mort rate
    sort_bars(delay, duration) {
        let xScale = this.xScale;
        let sort_function = function(a, b){ return null };
        if (this.sort_mode === "mortality rate"){
            sort_function = function(a, b) { return d3.descending(a.mort_rate, b.mort_rate); };

        }else if (this.sort_mode === "alphabetical"){
            sort_function = function(a, b) { return d3.ascending(a.name, b.name); };
        }

        this.svg.selectAll("rect")
            .sort(sort_function)
            .transition("sort_bars")
            .delay(delay)
            .duration(duration)
            .attr("x", function(d, i) { return xScale(i); });
    }

    get_states_data(){
        let data = [];
        for (let i =0; i<json_data.length; i++){
            if((json_data[i][11] === "State" || json_data[i][11] === "Nation") && json_data[i][21] === gender && json_data[i][23] === race && json_data[i][15] !== null){
                let name = json_data[i][10]
                if(name !== "Guam" && name !== "Virgin Islands of the U.S." && name !== "American Samoa" && name !== "Northern Mariana Islands"){
                    data.push({
                        name: json_data[i][10],
                        mort_rate: Math.round(json_data[i][15]),
                        type: json_data[i][11]
                    });
                }
            }
        }
        return data;
    }

    get_county_data(state_abbreviation) {
        let data = [];
        for (let i = 0; i < json_data.length; i++) {
            if (json_data[i][9] === state_abbreviation && json_data[i][21] === gender && json_data[i][23] === race && json_data[i][15] !== null) {
                data.push({
                    name: json_data[i][10],
                    type: json_data[i][11],
                    mort_rate: Math.round(json_data[i][15]),
                    // Rafal added
                    state: json_data[i][9]
                    // Include the state information as well

                });
            }
        }
        if (data.length === 0) {
            console.log('did not find any data with state abbreviation: ' + state_abbreviation
                        + 'gender: ' + gender
                        + 'race: ' + race);
        }
        return data;
    }

    graph_bar_color(d) {
        let color;
        switch (true) {
        case (d > 450):
            color = '#210009';
            break;
        case (d > 400):
            color = '#560019';
            break;
        case (d > 350):
            color = '#800026';
            break;
        case (d > 300):
            color = '#BD0026';
            break;
        case (d > 250):
            color = '#E31A1C';
            break;
        case (d > 200):
            color = '#FC4E2A';
            break;
        case (d > 150):
            color = '#FD8D3C';
            break;
        case (d > 100):
            color = '#FEB24C';
            break;
        case (d > 50):
            color = '#FED976';
            break;
        case (d == null || d == 0):
            color = '#BEBEBE';
            break;
        default:
            color = '#FFEDA0';
            break;
        };
        return color;
    }
}


/*
  _____________________________________________________________________
  Code that will run

  _____________________________________________________________________
*/
addLoadEvent(function(e) {
    let div = d3.select("#countyMortRateByState");
    let w = Math.round(document.body.clientWidth * 1);
    let h = Math.round(document.body.clientHeight * 0.3);
    countyMortRateByStateBarChart = new CountyMortRateByStateBarChart(w, h, div);
    countyMortRateByStateBarChart.update_bars("MA", "Overall", "Overall");
});
