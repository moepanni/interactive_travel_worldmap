// Log to confirm the script is loaded
console.log('script.js is loaded');

// Set dimensions for the map
const width = 960;
const height = 600;

// Create SVG element
const svg = d3
  .select('#map')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Define a map projection
const projection = d3
  .geoMercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);

// Define a path generator using the projection
const path = d3.geoPath().projection(projection);

// Load data files
Promise.all([
  d3.json('world.geojson'),
  d3.json('travel_data.json')
])
  .then(([geoData, travelData]) => {
    drawMap(geoData, travelData);
  })
  .catch((error) => {
    console.error('Error loading data:', error);
  });

function drawMap(geoData, travelData) {
  // Create a map of country names to travel data
  const travelDataMap = new Map();
  travelData.forEach((d) => {
    travelDataMap.set(d.country.toLowerCase(), d);
  });

  // Populate the month selection dropdown
  const months = [
    'All',
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const monthSelect = d3.select('#month-select');
  monthSelect
    .selectAll('option')
    .data(months)
    .enter()
    .append('option')
    .text((d) => d)
    .attr('value', (d) => d);

  // Draw countries
  svg
    .selectAll('path')
    .data(geoData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', '#ccc')
    .attr('stroke', '#333')
    .attr('stroke-width', 0.5)
    .on('mouseover', (event, d) =>
      handleMouseOver(event, d, travelDataMap)
    )
    .on('mousemove', handleMouseMove)
    .on('mouseout', handleMouseOut);

  // Update the map when a month is selected
  monthSelect.on('change', () => {
    updateMap(travelDataMap);
  });

  // Initial map update
  updateMap(travelDataMap);
}

function updateMap(travelDataMap) {
  const selectedMonth = d3.select('#month-select').property('value');

  svg
    .selectAll('path')
    .transition()
    .duration(500)
    .attr('fill', (d) => {
      const countryName = d.properties.name.toLowerCase();
      const countryData = travelDataMap.get(countryName);

      if (!countryData) {
        console.log(`No data available for country: ${d.properties.name}`);
      }

      if (countryData) {
        if (
          selectedMonth === 'All' ||
          countryData.bestMonths.includes(selectedMonth)
        ) {
          return '#66c2a5'; // Highlight color
        } else {
          return '#ccc'; // Default color for countries with data but not in the selected month
        }
      } else {
        return '#eee'; // No data available for this country
      }
    });
}

// Tooltip setup
const tooltip = d3.select('#tooltip');

function handleMouseOver(event, d, travelDataMap) {
  const countryName = d.properties.name.toLowerCase();
  const countryData = travelDataMap.get(countryName);

  if (countryData) {
    // Visa requirements for France, Portugal, and Germany
    const visaInfoFrance = countryData.visaRequirements['France'] || 'No information';
    const visaInfoPortugal = countryData.visaRequirements['Portugal'] || 'No information';
    const visaInfoGermany = countryData.visaRequirements['Germany'] || 'No information';

    tooltip
      .select('#tooltip-country')
      .text(d.properties.name);
    tooltip
      .select('#tooltip-content')
      .html(`
        <strong>Best Months:</strong> ${countryData.bestMonths.join(', ')}<br>
        <strong>VISA (France):</strong> ${visaInfoFrance}<br>
        <strong>VISA (Portugal):</strong> ${visaInfoPortugal}<br>
        <strong>VISA (Germany):</strong> ${visaInfoGermany}<br>
        <strong>Mandatory Vaccines:</strong> ${countryData.vaccines.mandatory.join(', ') || 'None'}
      `);

    tooltip
      .style('left', event.pageX + 15 + 'px')
      .style('top', event.pageY - 28 + 'px')
      .classed('hidden', false);
  } else {
    tooltip.classed('hidden', true);
  }
}

function handleMouseMove(event) {
  tooltip
    .style('left', event.pageX + 15 + 'px')
    .style('top', event.pageY - 28 + 'px');
}

function handleMouseOut() {
  tooltip.classed('hidden', true);
}
