//Mortality Rate By Density

class StateMortRatebyDensity {
    constructor(w, h, container, tooltip){
        this.container = container;
        this.tooltip = tooltip;
        this.padding = 30;
        this.svg = container.append("svg")
            .attr("width", w)
            .attr("height", h);
        this.setup_tooltip(tooltip);
        this.update_scatter();
    }

    setup_tooltip(tooltip){
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

    update_scatter(){
        let data = get_state_mort_rate_by_density_data();
        let padding = this.padding;
        let tooltip = this.tooltip;
        let svg = this.svg;
        let h = svg.attr("height");
        let w = svg.attr("width");
        let xScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d){return d.density;})])
            .range([padding, w-padding*2]);
        let yScale = d3.scaleLinear()
            .domain([d3.min(data, function(d){return d.mort_rate;}), d3.max(data, function(d){return d.mort_rate;})])
            .range([h-padding, padding]);
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
            .attr("cx", function(d){return xScale(d.density);})
            .attr("cy", function(d){return yScale(d.mort_rate);})
            .attr("r", 5)
            .attr("fill-opacity", 0.5)
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("fill", "red")
            .on("mouseover", function (d) {
                //Update the tooltip position and value
                let circle = d3.select(this);
                let rect = this.getBoundingClientRect();
                tooltip.style("left", (Math.round(circle.attr("cx")) + 10) + "px")
                    .style("top", (this.getBoundingClientRect().top + window.pageYOffset + 20) + "px")
                    .select("#mort_rate")
                    .text("mortality rate: " +d.mort_rate + "/100K");
                tooltip.select("#density")
                    .text("density: " + d.density + " / square mile")
                tooltip.select("#tooltipLabel").text(d.stateName);
                //Show the tooltip
                tooltip.classed("hidden", false);
            })
            .on("mouseout", function () {
                //Hide the tooltip
                tooltip.classed("hidden", true);
            })
            //.attr("r", function(d){return aScale(d.mort_rate);})
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (h-padding) + ")")
            .call(xAxis);
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + padding + ",0)")
            .call(yAxis); 
    }
}

addLoadEvent(function(e){
    let div = d3.select("#stateMortRateByDensity");
    let tooltip = div.append("div")
        .attr("id", "tooltip")
        .classed("hidden", true);            
    let scatter = div.append("div");
    let w = Math.round(document.body.clientWidth * 0.7);
    let h = Math.round(document.body.clientHeight * 0.3);
    stateMortRateByDensityScatter = new StateMortRatebyDensity(w, h, scatter, tooltip);
});

function get_state_mort_rate_by_density_data(){
    let data = [];
    for(let i = 0; i < json_data.length; i++){
        if(json_data[i][11] === "State" && json_data[i][21] === "Overall" && json_data[i][23] === "Overall"){
            let state_abbreviation = json_data[i][9];
            // Washington DC is lying too far out
            if(state_abbreviation !== "DC"){
                for(let j=0; j<statesData.features.length; j++){
                    let state = statesData.features[j].properties
                    if(state.abbreviation === state_abbreviation){
                        data.push({
                            stateName: state.name,
                            mort_rate: json_data[i][15],
                            density: state.density
                        });
                    }
                }
            }
        }
    }
    return data;
}