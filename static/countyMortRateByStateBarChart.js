// County Data By State Bar Chart -DS

class CountyMortRateByStateBarChart {
    constructor(w, h, xScale, yScale, colorScale, svg, county_data_of_state) {
        this.w = w;
        this.h = h;
        this.xScale = xScale;
        this.yScale = yScale;
        this.colorScale = colorScale;
        this.svg = svg;
        this.county_data_of_state = county_data_of_state;
        // should be sorted alphabetcally by default
        this.sortOrder = false;
    }

    update_bars(county_data_of_state) {
        this.county_data_of_state = county_data_of_state
        this.sortOrder = false;
        let xScale = this.xScale;
        let yScale = this.yScale;
        let colorScale = this.colorScale;
        let svg = this.svg;
        // update scales
        xScale.domain(d3.range(county_data_of_state.length));
        yScale.domain([0, d3.max(county_data_of_state, function (d) {
            return d.mort_rate;
        })]);
        colorScale.domain([0, d3.max(county_data_of_state, function (d) {
            return d.mort_rate;
        })]);
        //Update all rects
        let bars = svg.selectAll("rect").data(county_data_of_state);
        bars.enter().append("rect")
            .merge(bars)
            .attr("x", function (d, i) {
                return xScale(i);
            })
            .attr("y", function (d) {
                return h - yScale(d.mort_rate) + 5;
            })
            .attr("width", xScale.bandwidth())
            .attr("height", function (d) {
                return yScale(d.mort_rate);
            })
            .attr("fill", function (d) {
                if (d.type === "State") {
                    return "green";
                }
                return "rgb(0, 0, " + Math.round(colorScale(d.mort_rate)) + ")";
            })
            .on("mouseover", function (d) {
                //Get this bar's x/y values, then augment for the tooltip
                var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
                //Update the tooltip position and value
                d3.select("#tooltip")
                    .style("left", (w + 10) + "px")
                    //.style("top", yPosition + "px")
                    .select("#value")
                    .text(d.mort_rate + "/100K");
                d3.select("#tooltip").select("#tooltipLabel").text(d.county);
                //Show the tooltip
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function () {
                //Hide the tooltip
                d3.select("#tooltip").classed("hidden", true);
            });
        // remove old bars
        bars.exit().remove();
    }

    // switch between sorting alphabetically and by mort rate
    sort_bars() {
        let sortOrder = !this.sortOrder;
        let svg = this.svg;
        let xScale = this.xScale;
        this.sortOrder = sortOrder;
        svg.selectAll("rect")
            .sort(function(a, b) {
                if (sortOrder) {
                    return d3.descending(a.mort_rate, b.mort_rate);
                } else {
                    return d3.ascending(a.county, b.county);
                }
            })
            .transition("sort_bars")
            .delay(300)
            .duration(1500)
            .attr("x", function(d, i) {
                return xScale(i);
        });
    }
}

window.onload = function(e){
    
    let div = d3.select("#bottomofpage");

    let tooltip = div.append("div")
        .attr("id", "tooltip")
        .classed("hidden", true);
    tooltip.append("p")
        .append("strong")
        .append("span")
        .attr("id", "tooltipLabel")
        .text("Label Heading")
    tooltip.append("p")
        .append("span")
        .attr("id", "value")
        .text("100");

    let buttons = div.append("div")
        .attr("id", "graphButtons");
    let refreshGraph = buttons.append("button")
        .attr("type", "button")
        .attr("id", "refreshGraph")
        .text("Refresh Graph");
    let sortGraph = buttons.append("button")
        .attr("type", "button")
        .attr("id", "sortGraph")
        .text("Sort Graph");

    let barChart = div.append("div");

    let w = Math.round(document.body.clientWidth * 0.7);
    let h = Math.round(document.body.clientHeight * 0.3);
    let county_data_of_state = get_county_data_of_state("MA", gender, race);
    let xScale = d3.scaleBand()
        .domain(d3.range(county_data_of_state.length))
        .rangeRound([0, w])
        .paddingInner(0.05);
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(county_data_of_state, function(d) {
            return d.mort_rate;
        })])
        .range([15, h]);
    let colorScale = d3.scaleLinear()
        .domain([0, d3.max(county_data_of_state, function(d) {
            return d.mort_rate;
        })])
        .range([0, 255]);
    let svg = barChart.append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g");

    countyMortRateByStateBarChart = new CountyMortRateByStateBarChart(w, h, xScale, yScale, colorScale, svg, county_data_of_state);

    refreshGraph.on("click", function() {
        if (selection_list.length > 0) {
            //New values for dataset
            let state_abbreviation = get_state_abbreviation(selection_list[selection_list.length - 1]);
            county_data_of_state = get_county_data_of_state(state_abbreviation, gender, race);
            countyMortRateByStateBarChart.update_bars(county_data_of_state);
        }
    });

    sortGraph.on("click", function() {
        countyMortRateByStateBarChart.sort_bars();
    });
    
    countyMortRateByStateBarChart.update_bars(county_data_of_state);
}

function get_state_abbreviation(state_name) {
    for (let i = 0; i < json_data.length; i++) {
        if (json_data[i][10] === state_name && json_data[i][11] == "State") {
            return json_data[i][9];
        }
    }
    let str = "could not find state with name " + state_name;
    console.log(str);
    return str;
}

// a list that contains the name, state vs county type and mortality rate
function get_county_data_of_state(state_abbreviation, gender, race) {
    var data = [];
    for (let i = 0; i < json_data.length; i++) {
        if (json_data[i][9] === state_abbreviation && json_data[i][21] === gender && json_data[i][23] === race) {
            data.push({
                county: json_data[i][10],
                type: json_data[i][11],
                mort_rate: json_data[i][15]
            });
        }
    }
    if (data.length === 0) {
        console.log('did not find any state/counties with matching state abbreviation ' + state_abbreviation);
    }
    return data;
}