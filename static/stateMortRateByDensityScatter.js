//Mortality Rate By Density

class StateMortRatebyDensity {
    constructor(w, h, container, tooltip) {
        this.container = container;
        this.tooltip = tooltip;
        this.padding = 30;
        this.svg = null;
        this.title = null;
        this.w = w;
        this.h = h;

        this.setup_tooltip(tooltip);
        this.setup_title(container);
        this.setup_svg(container);
        this.update_scatter();

    }

    setup_title(container) {
        let w = this.w;
        this.title = container.append("span")
        .attr("id", "graph_title")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        //.style("font-weight", "bold")
        .style("text-align", "center")
        .style("display", "inline-block")
        .style("width", w + "px")
        .text("Overall State mortality rate across all genders and races versus Density");
    }

    setup_svg(container) {
        this.svg = container.append("svg")
            .attr("width", this.w)
            .attr("height", this.h);

        this.svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x",0 - (h / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Mortaility Rate");

        this.svg.append("text")
            .attr("y", h)
            .attr("x", w/2)
            .attr("dy", "1em")
            //.attr("dx", -50)
            .style("text-anchor", "middle")
            .text("Density (people/sq mile)");

    }

    setup_tooltip(tooltip) {
        tooltip.append("p")
        .append("strong")
        .append("span")
        .attr("id", "tooltipLabel")
        .text("Label Heading")

        tooltip.append("p")
        .append("span")
        .attr("id", "density")
        .text("100");

        tooltip.append("p")
        .append("span")
        .attr("id", "mort_rate")
        .text("100");
    }

    update_scatter() {
        let data = get_state_mort_rate_by_density_data();
        let padding = this.padding;
        let tooltip = this.tooltip;
        let svg = this.svg;
        let h = svg.attr("height");
        let w = svg.attr("width");

        let xScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.density; })])
            .range([2*padding, w - padding * 2]);
        let yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.mort_rate; }) + 100])
            .range([h - padding*2, 0]);
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(5);
        let yAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);

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
                .text("Density: " + d.density + '/square mile');
                tooltip.select("#tooltipLabel").text(d.stateName);
                //Show the tooltip
                tooltip.classed("hidden", false);

                map.eachLayer(function(layer){
                    if(layer.feature){
                        if(map_type_level === "state"){
                            if(layer.feature.properties.name === d.stateName){
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
                            if(layer.feature.properties.name === d.stateName){
                                resetHighlight({target: layer});
                            }
                        }
                    }
                });
            })
        //.attr("r", function(d){return aScale(d.mort_rate);})
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (h - padding*2) + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + 2*padding + ",0)")
            .call(yAxis);

    }

    highlight_state_selection(state) {
        // define color changer based on svg's colorscale
        let color_changer = this.colorScale;
        // go through all of the values and look match up the map selection and the bars
        this.svg.selectAll("circle").each(function(d, i) {
        // the bar that is howevered over in the map will be yellow
        if (state == d.stateName) {
            d3.select(this).attr("fill", "DodgerBlue").attr("r", 8);
        } else {
            d3.select(this).attr("fill", "red").attr("r", 2.5);
        }
        });
    }
}

addLoadEvent(function(e) {
  let div = d3.select("#stateMortRateByDensity");
  let tooltip = div.append("div")
    .attr("id", "tooltip")
    .classed("hidden", true);
  let scatter = div.append("div");
  let w = Math.round(document.body.clientWidth * 1);
  let h = Math.round(document.body.clientHeight * 0.3);
  stateMortRateByDensityScatter = new StateMortRatebyDensity(w, h, scatter, tooltip);
});

function get_state_mort_rate_by_density_data() {
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
              stateName: state.name,
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
