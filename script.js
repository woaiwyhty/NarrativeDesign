// Define the scenes

var scenes = ["index.html", "scene2.html", "scene3.html"];
var currentScene = 0;
let width = 900;
let height = 700;
var margin = {top: 30, right: 100, bottom: 100, left: 100};
var colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
var colors1 = ["#1f77b4", "#d62728"];
var colors2 = ["#2ca02c", "#9467bd"];
var selectedRegions = {};
document.addEventListener("DOMContentLoaded", function() {
    updatePageNumbers(currentScene, 3);
    refreshPage();
});

// Handle the Previous button click
d3.select("#prev").on("click", function() {
    if (currentScene > 0) {
        currentScene--;
        updatePageNumbers(currentScene, 3);
        refreshPage();
    }
});

// Handle the Next button click
d3.select("#next").on("click", function() {
    if (currentScene < scenes.length - 1) {
        currentScene++;
        updatePageNumbers(currentScene, 3);
        refreshPage();
    }
});

function updatePageNumbers(currentPage, totalPages) {
    var pageNumbers = d3.select("#page-numbers");

    // Remove old page numbers
    pageNumbers.selectAll("span").remove();
    pageNumbers.append("span").text("Page: ")
    // Add new page numbers
    for (var i = 1; i <= totalPages; i++) {
        var span = pageNumbers.append("span").text(i.toString() + " ");

        // Highlight the current page number
        if (i === currentPage + 1) {
            span.style("font-weight", "bold");
            span.style("color", "#000")
            // span.fill("color", "#000")
        }
    }
}

let refreshPage = function () {
    d3.select("#content").html("")
    d3.csv("./sheet1.csv").then(function(data) {
        let colorArr = colors;
        if (currentScene === 0) {
            data = data.filter(function(d) {
                return d["Region1"].search("Africa") !== -1;
            });
            colorArr = colors1;
        } else if (currentScene === 1) {
            data = data.filter(function(d) {
                return d["Region1"].search("America") !== -1;
            });
            colorArr = colors2;
        }


        var regions = Array.from(new Set(data.map(function(d) { return d["Region1"]; })));
        regions = regions.filter(function (v) {
            return v.length > 0;
        })
        selectedRegions = {}
        for (let i = 0; i <regions.length; ++i) {
            selectedRegions[regions[i]] = true;
        }
        var colorScale = d3.scaleOrdinal()
            .domain(regions)
            .range(colorArr);

        var svg = d3.select("#content").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xScale = d3.scaleLinear()
            .domain([35, d3.max(data, function(d) { return +d["Average Life Expectancy (AVG)"]; })])
            .range([0, width - margin.left - margin.right]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d["Avg Income  (AVG)"]; })])
            .range([height - margin.top - margin.bottom, 0]);

        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);


        svg.append("g")
            .attr("transform", "translate(0," + (height - margin.top - margin.bottom) + ")")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
            .attr("cx", function(d) { return xScale(+d["Average Life Expectancy (AVG)"]); })
            .attr("cy", function(d) { return yScale(+d["Avg Income  (AVG)"]); })
            .filter(function(d) {
                return d["Region1"] in selectedRegions && selectedRegions[d["Region1"]]; }
            )
            .attr("class", function(d)
            {
                return d["Region1"];
            }
            )
            .attr("r", 5).attr("fill", function(d) { return colorScale(d.Region1); }).append("title")
            .text(function(d) { return d["Country Name"]; });

        svg.selectAll("mydots")
            .data(regions)
            .enter()
            .append("circle")
            .attr("cx", 100)
            .attr("cy", function(d,i){ return i*25})
            .attr("r", 7)
            .style("fill", function(d){ return colorScale(d)})

        // Add one dot in the legend for each name.
        svg.selectAll("mylabels")
            .data(regions)
            .enter()
            .append("text")
            .attr("x", 120)
            .attr("y", function(d,i){ return i*25})
            .style("fill", function(d){ return colorScale(d)})
            .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

        if (currentScene === 2) {
            svg.selectAll("mylabels")
                .data(regions)
                .enter()
                .append("foreignObject")
                .attr("x", 70)
                .attr("y", function(d,i){ return i*25 - 10})
                .attr("width", 20)
                .attr("height", 20)
                .append("xhtml:body")
                .html("<form><input type='checkbox' checked='true'></form>")
                .on("click", function(d, i) {
                    var isChecked = d3.select(this).select("input").property("checked");
                    selectedRegions[d] = isChecked;
                    svg.selectAll("circle").remove()
                    svg.selectAll("circle")
                        .data(data)
                        .enter().append("circle")
                        .attr("cx", function(d) { return xScale(+d["Average Life Expectancy (AVG)"]); })
                        .attr("cy", function(d) { return yScale(+d["Avg Income  (AVG)"]); })
                        .filter(function(d) {
                            return d["Region1"] in selectedRegions && selectedRegions[d["Region1"]]; }
                        )
                        .attr("class", function(d)
                            {
                                return d["Region1"];
                            }
                        )
                        .attr("r", 5).attr("fill", function(d) { return colorScale(d.Region1); }).append("title")
                        .text(function(d) { return d["Country Name"]; });
                });

        }

        svg.append("text")
            .attr("transform", "translate(" + (width / 2 - 45) + " ," + (height - margin.bottom + 5)  + ")")
            .style("text-anchor", "middle")
            .text("Average Life Expectancy");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 30)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Avg Income");

        if (currentScene === 0) {
            var annotations = [{
                note: {
                    label: "Many Sub-Saharan Africa countries have low average income and average life expectancy",
                },
                x: width / 3 - 20,  // x-coordinate
                y: height - 150,  // y-coordinate
                dx: -100,  // x-offset
                dy: -100,  // y-offset
                type: d3.annotationCalloutCircle,
                subject: {
                    radius: 100,   // circle radius
                    radiusPadding: 10   // white space around circle
                }
            }]


            var makeAnnotations = d3.annotation()
                .annotations(annotations);
            svg.append("g").call(makeAnnotations)
        } else if (currentScene === 1) {
            var annotations = [{
                note: {
                    label: "Some countries have low income but have high life expectancies",
                },
                x: width / 2 + 90,  // x-coordinate
                y: height - 130,  // y-coordinate
                dx: -100,  // x-offset
                dy: -100,  // y-offset
                type: d3.annotationCalloutCircle,
                subject: {
                    radius: 50,   // circle radius
                    radiusPadding: 10   // white space around circle
                }
            }]


            var makeAnnotations = d3.annotation()
                .annotations(annotations);
            svg.append("g").call(makeAnnotations)
        }
    });

}
