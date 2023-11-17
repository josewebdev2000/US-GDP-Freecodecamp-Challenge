function main()
{
    // Data URL
    const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";

    // Grab the vis container
    const visContainer = document.querySelector("#vis-container");

    // Control chart dimensions
    const chartDimensions = {
        width: visContainer.clientWidth,
        height: visContainer.clientHeight
    };

    // Control x-axis displacement
    const xAxisDisplacement = {
        x: 50,
        y: 561
    };

    // Control y-axis displacement
    const yAxisDisplacement = {
        x: 50,
        y: -25
    };

    // Control bar rects displacement
    const barRectsDisplacement = {
        x: 50,
        y: -25
    };

    // Use D3 to create the SVG element
    const chartSvg = d3
                        .select("#vis-container")
                        .append("svg")
                        .attr("width", chartDimensions.width)
                        .attr("height", chartDimensions.height);
    
    // Add div elements for tooltip and overlay
    const tooltip = d3.select("#vis-container")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);
    
    const overlay = d3.select("#vis-container")
        .append("svg")
        .attr("width", chartDimensions.width + 100)
        .attr("height", chartDimensions.height + 60);
    
    // Request the data using D3
    d3.json(dataURL)
        .then(chartData => {
            
            // Grab the years
            const years = chartData.data.map(item => {
                const temp = item[0].substring(5, 7);
                const quarter = getYearQuarterByTemp(temp);
                return `${item[0].substring(0, 4)} ${quarter}`;
            });

            // Grab the years Date
            const yearsDate = chartData.data.map(item => {
                return new Date(item[0]);
            });

            // Make the range for the x-axis
            // Grab the maximum value of the years first
            const xMax = new Date(d3.max(yearsDate));

            // Add 3 months to not make the graph look short
            xMax.setMonth(xMax.getMonth() + 3);

            // Make the scale for the x-axis
            const xScale = d3.scaleTime()
                            .domain([d3.min(yearsDate), xMax])
                            .range([0, chartDimensions.width]);
            
            // Make the x-axis
            const xAxis = d3.axisBottom().scale(xScale);

            // Add the xAxis to the SVG graph
            chartSvg.append("g")
                .call(xAxis)
                .attr("id", "x-axis")
                .attr("transform", `translate(${xAxisDisplacement.x}, ${xAxisDisplacement.y})`);
            
            // Grab the GPDs
            const GDP = chartData.data.map(item => {
                return item[1];
            });

            // Make the scale for the y-axis
            const gdpMax = d3.max(GDP);
            const linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, chartDimensions.height]);
            const scaledGDP = GDP.map(item => {
                return linearScale(item);
            });
            const yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([chartDimensions.height, 0]);

            // Make the y-axis
            const yAxis = d3.axisLeft(yAxisScale);

            chartSvg.append("g")
                .call(yAxis)
                .attr("id", "y-axis")
                .attr("transform", `translate(${yAxisDisplacement.x}, ${yAxisDisplacement.y})`);
            
            // Get width of each rect
            const barWidth = Math.ceil(chartDimensions.width / scaledGDP.length);
            
            // Add the rects for the bar chart
            // Add a mouseover event as well
            d3.select("svg")
                .selectAll("rect")
                .data(scaledGDP)
                .enter()
                .append("rect")
                .attr("data-date", (_, i) => chartData.data[i][0])
                .attr("data-gdp", (_, i) => chartData.data[i][1])
                .attr("class", "bar")
                .attr("x", (_, i) => xScale(yearsDate[i]))
                .attr("y", d => chartDimensions.height - d )
                .attr("width", barWidth)
                .attr("height", d => d)
                .attr("index", (_, i) => i)
                .style("fill", "#457B9D")
                .attr("transform", `translate(${barRectsDisplacement.x}, ${barRectsDisplacement.y})`)
                .on("mouseover", function (event, d) {
                    const i = this.getAttribute("index");

                    // Style the opacity
                    overlay.transition()
                        .duration(0)
                        .style("height", `${d}px`)
                        .style("width", `${barWidth}px`)
                        .style("opacity", 0.9)
                        .style("left", `${i * barWidth + 0}px`)
                        .style("top", `${chartDimensions.height - d}px`)
                        .style("transform", "translateX(60px)");
                    
                    // Go for the tooltip
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    
                    tooltip.html(
                        `${years[i]}<br>$${GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')} Billion`
                        )
                        .attr("data-date", chartData.data[i][0])
                        .style("left", `${i * barWidth + 30}px`)
                        .style("top", `${chartDimensions.height - 100}px`)
                        .style("transform", "translateX(60px)");
                })
                .on("mouseout", () => {
                    tooltip.transition().duration(200).style("opacity", 0);
                    overlay.transition().duration(200).style("opacity", 0);
                });
        })
        .catch(e => console.log(e));
}

function getYearQuarterByTemp(temp)
{
    let quarter = "";

    switch (temp)
    {
        case "01":
            quarter = "Q1";
            break;
        
        case "04":
            quarter = "Q2";
            break;
        
        case "07":
            quarter = "Q3";
            break;
        
        case "10":
            quarter = "Q4";
            break;
        
        default:
            quarter = "Invalid";
        
    }

    return quarter;
}

document.addEventListener("DOMContentLoaded", main);