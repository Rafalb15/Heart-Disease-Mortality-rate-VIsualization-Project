// County Data By State Bar Chart -DS

class CountyMortRateByStateBarChart {
  constructor(w, h, xScale, yScale, colorScale, svg, county_data_of_state) {
    this.w = w;
    this.h = h;
    this.xScale = xScale;
    this.yScale = yScale;
    this.colorScale = colorScale;
    this.svg = svg;
    this.padding = 30;
    this.county_data_of_state = county_data_of_state;
    // should be sorted alphabetcally by default
    this.sortOrder = false;
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

  highlight_county_selection(selection, state) {
    // define color changer based on svg's colorscale
    let color_changer = this.colorScale;
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

  update_bars(county_data_of_state, state, gender, race) {
    this.county_data_of_state = county_data_of_state
    this.sortOrder = false;
    let xScale = this.xScale;
    let yScale = this.yScale;
    let colorScale = this.colorScale;
    let svg = this.svg;
    // update scales
    xScale.domain(d3.range(county_data_of_state.length));
    yScale.domain([0, d3.max(county_data_of_state, function(d) {
      return d.mort_rate;
    })]);
    colorScale.domain([0, d3.max(county_data_of_state, function(d) {
      return d.mort_rate;
    })]);

    let xAxis = d3.axisBottom()
      .scale(xScale)
      .tickFormat("");
    //.ticks(50);
    let yAxis = d3.axisLeft()
      .scale(yScale)

    // Uopdate the graph's title accordingly with the selections
    svg.select("#graph_title").text("Mortality rate across counties in " + state + " for Gender: " + gender + " and Race: " + race);
    svg.select("#x_axis").call(xAxis);
    svg.select("#y_axis").call(yAxis);
    //Update all rects
    let bars = svg.selectAll("rect").data(county_data_of_state);
    bars.enter().append("rect")
      .merge(bars)
      .attr("x", function(d, i) {
        return xScale(i);
      })
      .attr("y", function(d) {
        return yScale(d.mort_rate);
      })
      .attr("width", xScale.bandwidth())
      .attr("height", function(d) {
        return (h - 20) - yScale(d.mort_rate);
      })
      .attr("fill", function(d) {
        if (d.type === "State") {
          return "green";
        }
        return countyMortRateByStateBarChart.graph_bar_color(d.mort_rate);
      })
      .attr("opacity", 0.7)
      .on("mouseover", function(d) {
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
      .on("mouseout", function() {
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
      .delay(200)
      .duration(1500)
      .attr("x", function(d, i) {
        return xScale(i);
      });
  }
}

addLoadEvent(function() {

  let div = d3.select("#countyMortRateByState");

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
  // let refreshGraph = buttons.append("button")
  //   .attr("type", "button")
  //   .attr("id", "refreshGraph")
  //   .text("Refresh Graph");
  let sortGraph = buttons.append("button")
    .attr("type", "button")
    .attr("id", "sortGraph")
    .text("Sort Graph");

  let barChart = div.append("div");

  let w = Math.round(document.body.clientWidth * 0.9);
  let h = Math.round(document.body.clientHeight * 0.3);
  let county_data_of_state = get_county_data_of_state("MA", gender, race);
  let xScale = d3.scaleBand()
    .domain(d3.range(county_data_of_state.length))
    .rangeRound([50, w - 50])
    .paddingInner(0.15)
    .align(0.1);
  let yScale = d3.scaleLinear()
    .domain([0, d3.max(county_data_of_state, function(d) {
      return d.mort_rate;
    })])
    .range([h - 20, 20]);

  let xAxis = d3.axisBottom()
    .scale(xScale)
    .tickFormat("");
  //.ticks(50);
  let yAxis = d3.axisLeft()
    .scale(yScale)
  //.ticks(50);

  let colorScale = d3.scaleLinear()
    .domain([0, d3.max(county_data_of_state, function(d) {
      return d.mort_rate;
    })])
    .range([0, 255]);
  let svg = barChart.append("svg")
    .attr("width", w)
    .attr("height", h)
    .append("g");

  svg.append("g")
    .attr("id", "x_axis")
    .attr("transform", "translate(0, " + (w - 20) + ")")
    .call(xAxis);
  svg.append("g")
    .attr("id", "y_axis")
    .attr("transform", "translate(" + 50 + ",0)")
    .call(yAxis);
  svg.append("text")
    .attr("x", (w / 2))
    .attr("y", 40)
    .attr("id", "graph_title")
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    //.style("text-decoration", "bold")
    .text("Race(overall) Gender(overall) for MA");

  countyMortRateByStateBarChart = new CountyMortRateByStateBarChart(w, h, xScale, yScale, colorScale, svg, county_data_of_state, xAxis, yAxis);

  // refreshGraph.on("click", function() {
  //   if (selection_list.length > 0) {
  //     //New values for dataset
  //     let state_abbreviation = get_state_abbreviation(selection_list[selection_list.length - 1]);
  //     county_data_of_state = get_county_data_of_state(state_abbreviation, gender, race);
  //     countyMortRateByStateBarChart.update_bars(county_data_of_state, state_abbreviation, gender, race);
  //   }
  // });

  sortGraph.on("click", function() {
    countyMortRateByStateBarChart.sort_bars();
  });

  countyMortRateByStateBarChart.update_bars(county_data_of_state, "MA", "overall", "overall");
});

// a list that contains the name, state vs county type and mortality rate
function get_county_data_of_state(state_abbreviation, gender, race) {
  let data = [];
  for (let i = 0; i < json_data.length; i++) {
    if (json_data[i][9] === state_abbreviation && json_data[i][21] === gender && json_data[i][23] === race) {
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
