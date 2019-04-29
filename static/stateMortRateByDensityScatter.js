//Mortality Rate By Density

class StateMortRatebyDensity {
    constructor(w, h, container) {
        this.w = w;
        this.h = h;
        this.container = container;
        this.padding = 30;
        this.graph_mode = "State";
        this.cur_state = null;
        this.tooltip = null;
        this.svg = null;
        this.title = null;
        this.xScale = null;
        this.yScale = null;

        this.setup_tooltip(container);
        //this.setup_buttons(container);
        this.setup_title(container);
        this.setup_svg(container);
        this.update_scatter();

    }

    setup_tooltip(container) {
        this.tooltip = container.append("div")
            .attr("id", "tooltip")
            //.style("background-color", "rgb(117, 190, 218)")
            .classed("hidden", true);

        this.tooltip.append("p")
        .append("strong")
        .append("span")
        .attr("id", "tooltipLabel")
        .text("Label Heading")

        this.tooltip.append("p")
        .append("span")
        .attr("id", "density")
        .text("100");

        this.tooltip.append("p")
        .append("span")
        .attr("id", "mort_rate")
        .text("100");
    }

    /*setup_buttons(container){
        container.append("button")
        .attr("type", "button")
        .attr("id", "change_graph")
        .text("Switch to county mode")
        .style("width", "200 px")
        .on("click", function(){
            if (stateMortRateByDensityScatter.graph_mode === "State"){
                stateMortRateByDensityScatter.graph_mode = "County";
                container.select("#change_graph").text("Switch to state mode");
            }else if (stateMortRateByDensityScatter.graph_mode === "County"){
                stateMortRateByDensityScatter.graph_mode = "State";
                container.select("#change_graph").text("Switch to county mode");
            }
            stateMortRateByDensityScatter.update_scatter(stateMortRateByDensityScatter.cur_state);
        });
    }*/

    setup_title(container) {
        let w = this.w;
        this.title = container.append("span")
        .attr("id", "graph_title")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("text-align", "center")
        .style("display", "inline-block")
        .style("width", w-300 + "px")
        .text("Overall State mortality rate across all genders and races versus Density");
    }

    setup_svg(container) {
        let padding = this.padding;
        let w = this.w;
        let h = this.h;
        this.svg = container.append("svg")
            .attr("width", w)
            .attr("height", h);

        this.svg.append("text")
            .attr("id", "y_label")
            .attr("transform", "rotate(-90)")
            .attr("x",0 - (h / 2) + padding/2)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Mortaility Rate");

        this.svg.append("text")
            .attr("id", "x_label")
            .attr("y", h)
            .attr("x", w/2)
            .attr("dy", "-1em")
            .style("text-anchor", "middle")
            .text("Density (people/sq mi)");

        this.svg.append("g")
            .attr("id", "y_axis")
            .attr("transform", "translate(" + 2*padding + ",0)");

        this.svg.append("g")
            .attr("id", "x_axis")
            .attr("transform", "translate(0, " + (h - padding*2) + ")");

        this.xScale = d3.scaleLinear().range([2*padding, w - padding * 2]);
        this.yScale = d3.scaleLinear().range([h - padding*2, padding/2]);

    }

    update_scatter(state){
        if(state){
            this.cur_state = state;
        }
        if (this.graph_mode === "State"){
            this.state_scatter();
        }else if (this.graph_mode === "County"){
            this.county_scatter(this.cur_state);
        }
    }

    state_scatter() {
        let data = this.get_states_data();
        let padding = this.padding;
        let tooltip = this.tooltip;
        let svg = this.svg;
        let h = svg.attr("height");
        let w = svg.attr("width");

        // update graph title
        this.container.select("#graph_title").text("Mortality rate in each state for Gender: (" + gender + ") and Race: (" + race + ") vs overall density");

        let xScale = this.xScale.domain([0, d3.max(data, function(d) { return d.density; })])
        let yScale = this.yScale.domain([0, d3.max(data, function(d) { return d.mort_rate; }) + 100])
        let xAxis = d3.axisBottom().scale(xScale).ticks(5);
        let yAxis = d3.axisLeft().scale(yScale).ticks(5);
        svg.select("#y_axis").call(yAxis);
        svg.select("#x_axis").call(xAxis);

        // make some circles
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                return xScale(d.density);
            })
            .attr("cy", function(d) {
                return yScale(d.mort_rate);
            })
            .attr("r", 2.5)
            .attr("fill-opacity", 0.7)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "red")
            .on("mouseover", function(d) {
                //Update the tooltip position and value
                let circle = d3.select(this);
                let rect = this.getBoundingClientRect();
                tooltip.style("left", (Math.round(circle.attr("cx")) + 10) + "px")
                .style("top", (this.getBoundingClientRect().top + window.pageYOffset + 20) + "px")
                .select("#mort_rate")
                .text("Mortality rate: " + d.mort_rate + "/100K");
                tooltip.select("#density")
                .text("Density: " + d.density + '/sq mi');
                tooltip.select("#tooltipLabel").text(d.name);
                //Show the tooltip
                tooltip.classed("hidden", false);

                map.eachLayer(function(layer){
                    if(layer.feature){
                        if(map_type_level === "state"){
                            if(layer.feature.properties.name === d.name){
                                highlightFeature({target: layer});
                            }
                        }
                    }
                });

            })
            .on("mouseout", function(d) {
                //Hide the tooltip
                tooltip.classed("hidden", true);
                map.eachLayer(function(layer){
                    if(layer.feature){
                        if(map_type_level === "state"){
                            if(layer.feature.properties.name === d.name){
                                resetHighlight({target: layer});
                            }
                        }
                    }
                });
            });      
    }

    county_scatter(state){
        let data = this.get_county_data_of_state(state);
        let padding = this.padding;
        let tooltip = this.tooltip;
        let svg = this.svg;
        let h = svg.attr("height");
        let w = svg.attr("width");

        let circles = svg.selectAll("rect").data(data);
    }

    highlight_state_selection(state) {
        // define color changer based on svg's colorscale
        let color_changer = this.colorScale;
        // go through all of the values and look match up the map selection and the bars
        this.svg.selectAll("circle").each(function(d, i) {
        // the bar that is howevered over in the map will be yellow
        if (state == d.name) {
            d3.select(this).attr("fill", "DodgerBlue").attr("r", 8);
        } else {
            d3.select(this).attr("fill", "red").attr("r", 2.5);
        }
        });
    }

    get_states_data() {
        let data = [];
        for (let i = 0; i < json_data.length; i++) {
          if (json_data[i][11] === "State" && json_data[i][21] === "Overall" && json_data[i][23] === "Overall") {
            let state_abbreviation = json_data[i][9];
            // Washington DC is lying too far out
            if (state_abbreviation !== "DC") {
              for (let j = 0; j < statesData.features.length; j++) {
                let state = statesData.features[j].properties
                if (state.abbreviation === state_abbreviation) {
                  data.push({
                    name: state.name,
                    mort_rate: Math.round(json_data[i][15]),
                    density: Math.round(state.density)
                  });
                }
              }
            }
          }
        }
        return data;
    }

    get_county_data_of_state(state){
        let state_abbreviation = get_state_abbreviation(state);
        let data = [];
        // find all counties that belong to the state and have data for the selected gender/race groups
        for (let i = 0; i < json_data.length; i++){
            if(json_data[i][9] === state_abbreviation && json_data[i][21] === gender && json_data[i][23] === race && json_data[i][15] !== null){
                // find the population for the county and calculate the density
                for (let j = 0; j< censusPopData.length; j++){
                }
            }
        }
    }
}

addLoadEvent(function(e) {
  let div = d3.select("#stateMortRateByDensity");
  //let scatter = div.append("div");
  let w = Math.round(document.body.clientWidth * 1);
  let h = Math.round(document.body.clientHeight * 0.3);
  stateMortRateByDensityScatter = new StateMortRatebyDensity(w, h, div);
});
