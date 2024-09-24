const width = 960;
const height = 600;
let countriesMissing = 195;  // Total number of countries
let countriesTraveled = 0;   // Initially, no countries are traveled

// Load stored traveled countries from localStorage if available
let traveledCountries = JSON.parse(localStorage.getItem("traveledCountries")) || {};

// Projection for the map
const projection = d3.geoMercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);

const path = d3.geoPath().projection(projection);

// Create the SVG for the map
const svg = d3.select("#map").append("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

// Load the world.geojson file (use the correct path to the file)
d3.json("data/world.geojson").then(function(geojson) {
  svg.selectAll("path")
    .data(geojson.features)
    .enter().append("path")
    .attr("d", path)
    .attr("id", d => d.properties.name)  // Set ID for countries using their name
    .attr("class", d => traveledCountries[d.properties.name] ? "traveled" : "")  // Add class if country is already traveled
    .style("fill", d => traveledCountries[d.properties.name] ? "green" : "white")  // Set initial color based on saved state
    .on("mouseover", function(event, d) {
      tooltip.html(d.properties.name)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px")
        .classed("hidden", false);
    })
    .on("mouseout", function() {
      tooltip.classed("hidden", true);
    })
    .on("click", function(event, d) {
      const countryName = d.properties.name;
      const countryElement = d3.select(this);

      // Check if the country has already been traveled
      const isTraveled = countryElement.classed("traveled");

      if (!isTraveled) {
        // Mark as traveled
        countryElement.style("fill", "green").classed("traveled", true);
        countriesTraveled += 1;
        countriesMissing -= 1;
        traveledCountries[countryName] = true;  // Save in the traveled list
      } else {
        // Unmark as traveled
        countryElement.style("fill", "white").classed("traveled", false);
        countriesTraveled -= 1;
        countriesMissing += 1;
        delete traveledCountries[countryName];  // Remove from the traveled list
      }

      // Update counters
      d3.select("#countries-traveled").text(countriesTraveled);
      d3.select("#countries-missing").text(countriesMissing);

      // Save traveled countries to localStorage
      localStorage.setItem("traveledCountries", JSON.stringify(traveledCountries));
    });

  // Initialize the counters based on the number of traveled countries
  countriesTraveled = Object.keys(traveledCountries).length;
  countriesMissing = 195 - countriesTraveled;

  // Update counters in the DOM
  d3.select("#countries-traveled").text(countriesTraveled);
  d3.select("#countries-missing").text(countriesMissing);
}).catch(function(error) {
  console.error("Error loading the GeoJSON file:", error);
});
