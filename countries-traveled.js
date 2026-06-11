// countries-traveled.js — My Travels tracker

var traveledCountries = {};
try { traveledCountries = JSON.parse(localStorage.getItem('wm_traveled') || '{}'); } catch(e) {}

var totalCountries = 0;

var projT = d3.geoNaturalEarth1().scale(148).translate([480, 270]);
var pathT = d3.geoPath().projection(projT);

var tooltipT = document.getElementById('tooltip');

function updateTrackerStats() {
  var v = Object.keys(traveledCountries).length;
  var pct = totalCountries ? Math.round(v / totalCountries * 100) : 0;
  document.getElementById('countries-traveled').textContent = v;
  document.getElementById('stat-pct').textContent = pct + '%';
  document.getElementById('countries-missing').textContent = Math.max(0, totalCountries - v);
}

function showTrackerTooltip(event, name) {
  document.getElementById('tt-name').textContent = name;
  document.getElementById('tt-body').innerHTML =
    '<div class="tt-section"><p class="' + (traveledCountries[name] ? 'tt-visited' : 'tt-nodata') + '">' +
    (traveledCountries[name] ? '&#10003; Visited' : 'Click to mark as visited') + '</p></div>';
  var w = 280, h = tooltipT.offsetHeight || 80;
  var vw = window.innerWidth, vh = window.innerHeight;
  var x = event.clientX + 16, y = event.clientY - 10;
  if (x + w > vw - 8) x = event.clientX - w - 16;
  if (y + h > vh - 8) y = vh - h - 8;
  if (y < 8) y = 8;
  tooltipT.style.left = x + 'px';
  tooltipT.style.top  = y + 'px';
  tooltipT.classList.remove('hidden');
}

d3.json('world.geojson').then(function(geoData) {
  totalCountries = geoData.features.length;

  var svg = d3.select('#map-tracker')
    .append('svg')
    .attr('viewBox', '0 0 960 500');

  svg.selectAll('path')
    .data(geoData.features)
    .enter().append('path')
    .attr('class', 'country')
    .attr('d', pathT)
    .attr('fill', function(d) {
      var name = d.properties.name || '';
      return traveledCountries[name] ? '#f0a500' : '#161a28';
    })
    .on('mouseover', function(event, d) {
      showTrackerTooltip(event, d.properties.name || '');
    })
    .on('mousemove', function(event) {
      var w = 280, h = tooltipT.offsetHeight || 80;
      var vw = window.innerWidth, vh = window.innerHeight;
      var x = event.clientX + 16, y = event.clientY - 10;
      if (x + w > vw - 8) x = event.clientX - w - 16;
      if (y + h > vh - 8) y = vh - h - 8;
      tooltipT.style.left = x + 'px';
      tooltipT.style.top  = y + 'px';
    })
    .on('mouseout', function() { tooltipT.classList.add('hidden'); })
    .on('click', function(event, d) {
      var name = d.properties.name || '';
      if (traveledCountries[name]) {
        delete traveledCountries[name];
        d3.select(this).attr('fill', '#161a28');
      } else {
        traveledCountries[name] = true;
        d3.select(this).attr('fill', '#f0a500');
      }
      try { localStorage.setItem('wm_traveled', JSON.stringify(traveledCountries)); } catch(e) {}
      updateTrackerStats();
      showTrackerTooltip(event, name);
    });

  updateTrackerStats();

}).catch(function(err) {
  console.error('Error loading world.geojson for tracker:', err);
});

document.getElementById('reset-btn').addEventListener('click', function() {
  if (!confirm('Reset all visited countries?')) return;
  traveledCountries = {};
  try { localStorage.removeItem('wm_traveled'); } catch(e) {}
  d3.select('#map-tracker svg').selectAll('path.country').attr('fill', '#161a28');
  updateTrackerStats();
});
