// County Data By State Bar Chart -DS


class CountyMortRateByStateBarChart {

    constructor(w, h, container){
        this.w = w;
        this.h = h;
        this.container = container;
        this.y_pad = 40;
        this.x_pad = 50;
        this.sortOrder = false;
        this.tooltip = null;
        //this.buttons = null;
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
        //this.buttons = container.append("div")
          //      .attr("id", "graphButtons");
        container.append("button")
            .attr("type", "button")
            .attr("id", "sortGraph")
            .text("Sort Graph")
            .style("width", "100px")
            .on("click", function() { countyMortRateByStateBarChart.sort_bars(); });
    }

    setup_title(container){
        let w = this.w;
        this.title = container.append("span")
            .attr("id", "graph_title")
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            //.style("font-weight", "bold")
            .style("text-align","center")
            .style("display", "inline-block")
            .style("width", w-300 + "px");
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
            .attr("id", "ylabel")
            .attr("transform", "rotate(-90)")
            .attr("x",0 - (h / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Mortaility Rate");

        this.svg.append("text")
            .attr("id", "xlabel")
            .attr("y", h)
            .attr("x", w/2)
            .attr("dy", -25)
            .attr("dx", -50)
            .style("text-anchor", "middle")
            .text("State/County");
    }

    state_mort_rate_bars(gender, race){
        let svg = this.svg;

        let state_data = get_state_data();

    }

    update_bars(state, gender, race){
        let svg = this.svg;
        let xScale = this.xScale;
        let yScale = this.yScale;
        let h = this.h;
        let w = this.w;
        let y_pad = this.y_pad;
        let x_pad = this.x_pad;

        this.sortOrder = false;
        let county_data_of_state = get_county_data_of_state(state, gender, race);

        // Update the graph's title accordingly with the selections
        this.container.select("#graph_title").text("Mortality rate across counties in " + state + " for Gender: " + gender + " and Race: " + race + "");

        // update the xScale and yScale
        xScale.domain(d3.range(county_data_of_state.length));
        yScale.domain([0, d3.max(county_data_of_state, function(d) { return d.mort_rate; })]);

        // update the x and y axes
        let xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat("");
        let yAxis = d3.axisLeft()
            .scale(yScale);
        svg.select("#y_axis").call(yAxis);

        //Update all bars
        let bars = svg.selectAll("rect").data(county_data_of_state);

        bars.enter().append("rect")
            .merge(bars)
            .attr("x", function(d, i) {return xScale(i);})
            .attr("y", function(d) {return yScale(d.mort_rate);})
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) {return (h - y_pad) - yScale(d.mort_rate);})
            .attr("fill", function(d) {
                if (d.type === "State") { return "green"; }
                return countyMortRateByStateBarChart.graph_bar_color(d.mort_rate);
            })
            .attr("opacity", 0.7)
            .on("mouseover", function(d) {
                //Update and show the tooltip
                d3.select("#tooltip")
                    .style("left", (w -100) + "px")
                    .select("#value")
                    .text(d.mort_rate + "/100K");
                d3.select("#tooltip").select("#tooltipLabel").text(d.county);
                d3.select("#tooltip").classed("hidden", false);
            })
            .on("mouseout", function() { d3.select("#tooltip").classed("hidden", true);});
        //console.log(h);

        // remove old bars
        bars.exit().remove();
    }

    highlight_county_selection(selection, state) {
        // go through all of the values and look match up the map selection and the bars
        this.svg.selectAll("rect").each(function(d, i) {
            // the bar that is howevered over in the map will be yellow
            if (state == d.state && d.county.includes(selection)) {
                d3.select(this).attr("fill", "yellow");
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

    // switch between sorting alphabetically and by mort rate
    sort_bars() {
        let sortOrder = !this.sortOrder;
        let xScale = this.xScale;
        this.sortOrder = sortOrder;
        this.svg.selectAll("rect")
            .sort(function(a, b) {
                if (sortOrder) {
                    return d3.descending(a.mort_rate, b.mort_rate);
                } else {
                    return d3.ascending(a.county, b.county);
                }
            })
            .transition("sort_bars")
            .delay(200)
            .duration(1500)
            .attr("x", function(d, i) { return xScale(i); });
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

/*
  _____________________________________________________________________


  _____________________________________________________________________

*/

function get_state_data(gender, race){
    let data = [];
    for (let i =0; i<json_data.length; i++){
        if(json_data[i][11] === "State"){
            data.push({

            })
        }
    }
}

// a list that contains the name, state vs county type and mortality rate
function get_county_data_of_state(state_abbreviation, gender, race) {
    let data = [];
    for (let i = 0; i < json_data.length; i++) {
        if (json_data[i][9] === state_abbreviation && json_data[i][21] === gender && json_data[i][23] === race && json_data[i][15] !== null) {
            data.push({
            county: json_data[i][10],
            type: json_data[i][11],
            mort_rate: Math.round(json_data[i][15]),
            // Rafal added
            state: json_data[i][9]
            // Include the state information as well
            });
        }
    }
    if (data.length === 0) {
        console.log('did not find any state/counties with matching state abbreviation ' + state_abbreviation);
    }
    return data;
}
