import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

async function draw() {
  // Data
  const dataset = await d3.json(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
  );
  const xAccessor = (d) => d.Year;
  const yAccessor = (d) => {
    const [minutes, seconds] = d.Time.split(":");
    return (parseInt(minutes) * 60 + parseInt(seconds)) * 1000; // Convert to milliseconds
  };

  // Dimensions
  let dimensions = {
    width: 800,
    height: 400,
    margin: {
      top: 20,
      right: 20,
      bottom: 50,
      left: 60
    }
  };
  dimensions.containerWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.containerHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // Draw Image
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  // Create container
  const container = svg
    .append("g")
    .attr(
      "transform",
      `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
    );

  // Title
  svg
    .append("text")
    .attr("x", dimensions.width / 2)
    .attr("y", dimensions.margin.top)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .attr("id", "title")
    .text("Doping in Professional Bicycle Racing");

  // Legend
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr(
      "transform",
      `translate(${dimensions.containerWidth - 100}, ${dimensions.margin.top})`
    );

  legend
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "green")
    .attr("transform", "translate(0, 125)");

  legend
    .append("text")
    .attr("x", 30)
    .attr("y", 140)
    .text("No doping accusation");

  legend
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "red")
    .attr("transform", "translate(0, 155)");

  legend.append("text").attr("x", 30).attr("y", 170).text("Doping accusation");

  // Tooltip
  const tooltip = d3
    .select("#chart")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", "0")
    .attr("data-date", "");

  // Scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .rangeRound([0, dimensions.containerWidth])
    .clamp(true);

  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .rangeRound([dimensions.containerHeight, 0])
    .nice()
    .clamp(true);

  // Draw Circles
  container
    .selectAll("circle")
    .data(dataset)
    .join("circle")
    .attr("r", 5)
    .attr("stroke", "black")
    .attr("stroke-width", 0.4)
    .attr("fill", (d) => (d.Doping === "" ? "green" : "red"))
    .attr("class", "dot")
    .attr("data-xvalue", (d) => xAccessor(d))
    .attr("data-yvalue", (d) => new Date(yAccessor(d)))
    .attr("cx", (d) => xScale(xAccessor(d)))
    .attr("cy", (d) => yScale(yAccessor(d)))
    .attr("temp", yAccessor)
    .on("mouseover", (event, d) => {
      const tooltip = d3.select("#tooltip");
      tooltip.html(
        `
          ${d.Name}: ${d.Nationality}
          <br/>
          Year: ${d.Year}, Time:${d.Time}
          ${d.Doping === "" ? "" : `<br/><br/>${d.Doping}`}
          
        `
      );
      tooltip.attr("data-year", d.Year);

      const chartPosition = d3.select("#chart").node().getBoundingClientRect();
      const xPosition = event.pageX - chartPosition.left + 30;
      const yPosition =
        event.pageY - chartPosition.top - tooltip.node().offsetHeight + 50;

      tooltip
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .style("opacity", 1);
    })
    .on("mouseout", () => {
      d3.select("#tooltip").style("opacity", 0);
    });

  // Axes
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

  const xAxisGroup = container
    .append("g")
    .call(xAxis)
    .style("transform", `translateY(${dimensions.containerHeight}px)`)
    .classed("axis", true)
    .attr("id", "x-axis");

  xAxisGroup
    .append("text")
    .attr("x", dimensions.containerWidth / 2)
    .attr("y", dimensions.margin.bottom - 10)
    .attr("fill", "black")
    .text("Year");

  const yAxis = d3.axisLeft(yScale).tickFormat((ms) => {
    // Convert milliseconds to minutes and seconds
    const totalSeconds = Math.abs(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Format the time string as mm:ss
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  });

  // Append the y-axis to the container
  const yAxisGroup = container
    .append("g")
    .call(yAxis)
    .classed("axis", true)
    .attr("id", "y-axis");

  // Update y-axis label
  yAxisGroup
    .append("text")
    .attr("x", -dimensions.containerHeight / 2)
    .attr("y", -dimensions.margin.left + 15)
    .attr("fill", "black")
    .html("Time (Minutes)")
    .style("transform", "rotate(270deg)")
    .style("text-anchor", "middle");
}

draw();
