// script.js — Best Time to Visit map

var activeMonth = 'All';
var activePassport = 'France';

var FLIGHT_DATA = {"France":{"hub":"Paris CDG","connections":["London","New York","Dubai","Amsterdam","Barcelona"]},"Germany":{"hub":"Frankfurt FRA","connections":["London","New York","Dubai","Paris","Amsterdam"]},"United Kingdom":{"hub":"London LHR","connections":["New York","Dubai","Hong Kong","Paris","Amsterdam"]},"Spain":{"hub":"Madrid MAD","connections":["London","Paris","New York","Buenos Aires","Miami"]},"Italy":{"hub":"Rome FCO","connections":["London","Paris","New York","Dubai","Frankfurt"]},"Netherlands":{"hub":"Amsterdam AMS","connections":["London","New York","Dubai","Singapore","Bangkok"]},"Portugal":{"hub":"Lisbon LIS","connections":["London","Paris","New York","S\u00e3o Paulo","Luanda"]},"Turkey":{"hub":"Istanbul IST","connections":["London","Dubai","Frankfurt","New York","Bangkok"]},"Greece":{"hub":"Athens ATH","connections":["London","Frankfurt","Amsterdam","Dubai","Paris"]},"Switzerland":{"hub":"Zurich ZRH","connections":["London","New York","Dubai","Singapore","Bangkok"]},"Austria":{"hub":"Vienna VIE","connections":["London","Frankfurt","Dubai","Paris","Moscow"]},"Belgium":{"hub":"Brussels BRU","connections":["London","Paris","Frankfurt","New York","Dubai"]},"Sweden":{"hub":"Stockholm ARN","connections":["London","Frankfurt","Amsterdam","Dubai","New York"]},"Norway":{"hub":"Oslo OSL","connections":["London","Frankfurt","Amsterdam","Copenhagen","New York"]},"Denmark":{"hub":"Copenhagen CPH","connections":["London","Frankfurt","Amsterdam","New York","Dubai"]},"Finland":{"hub":"Helsinki HEL","connections":["London","Frankfurt","Tokyo","New York","Bangkok"]},"Poland":{"hub":"Warsaw WAW","connections":["London","Frankfurt","Amsterdam","Dubai","Paris"]},"Czech Republic":{"hub":"Prague PRG","connections":["London","Frankfurt","Amsterdam","Dubai","Paris"]},"Hungary":{"hub":"Budapest BUD","connections":["London","Frankfurt","Amsterdam","Dubai","Paris"]},"Romania":{"hub":"Bucharest OTP","connections":["London","Frankfurt","Amsterdam","Istanbul","Paris"]},"Croatia":{"hub":"Zagreb ZAG","connections":["London","Frankfurt","Amsterdam","Dubai","Paris"]},"Russia":{"hub":"Moscow SVO","connections":["Frankfurt","Dubai","Beijing","Istanbul","London"]},"Iceland":{"hub":"Reykjavik KEF","connections":["London","New York","Copenhagen","Frankfurt","Amsterdam"]},"Ireland":{"hub":"Dublin DUB","connections":["London","New York","Amsterdam","Frankfurt","Paris"]},"United Arab Emirates":{"hub":"Dubai DXB","connections":["London","New York","Singapore","Bangkok","Mumbai"]},"Qatar":{"hub":"Doha DOH","connections":["London","New York","Singapore","Bangkok","Mumbai"]},"Saudi Arabia":{"hub":"Riyadh RUH","connections":["London","Dubai","Cairo","Frankfurt","Kuala Lumpur"]},"Israel":{"hub":"Tel Aviv TLV","connections":["London","New York","Frankfurt","Paris","Dubai"]},"Jordan":{"hub":"Amman AMM","connections":["London","Dubai","Frankfurt","Paris","Istanbul"]},"Egypt":{"hub":"Cairo CAI","connections":["London","Dubai","Frankfurt","Paris","Istanbul"]},"Morocco":{"hub":"Casablanca CMN","connections":["Paris","Madrid","London","Frankfurt","Dubai"]},"Japan":{"hub":"Tokyo NRT","connections":["Los Angeles","Seoul","Hong Kong","Singapore","London"]},"China":{"hub":"Beijing PEK","connections":["Tokyo","Seoul","Hong Kong","London","Los Angeles"]},"India":{"hub":"Mumbai BOM","connections":["Dubai","London","Singapore","Bangkok","Frankfurt"]},"Singapore":{"hub":"Singapore SIN","connections":["London","Sydney","Tokyo","Dubai","Hong Kong"]},"Thailand":{"hub":"Bangkok BKK","connections":["London","Singapore","Hong Kong","Dubai","Tokyo"]},"Indonesia":{"hub":"Bali DPS / Jakarta CGK","connections":["Singapore","Sydney","Tokyo","Kuala Lumpur","Hong Kong"]},"Malaysia":{"hub":"Kuala Lumpur KUL","connections":["London","Singapore","Dubai","Tokyo","Sydney"]},"Vietnam":{"hub":"Hanoi HAN / Ho Chi Minh SGN","connections":["Singapore","Bangkok","Hong Kong","Tokyo","Seoul"]},"Philippines":{"hub":"Manila MNL","connections":["Singapore","Hong Kong","Tokyo","Seoul","Dubai"]},"South Korea":{"hub":"Seoul ICN","connections":["Tokyo","Beijing","Hong Kong","Los Angeles","Singapore"]},"Cambodia":{"hub":"Phnom Penh PNH","connections":["Singapore","Bangkok","Ho Chi Minh","Kuala Lumpur","Hong Kong"]},"Sri Lanka":{"hub":"Colombo CMB","connections":["Dubai","Singapore","Mumbai","Bangkok","Kuala Lumpur"]},"Nepal":{"hub":"Kathmandu KTM","connections":["Delhi","Doha","Dubai","Bangkok","Kuala Lumpur"]},"Maldives":{"hub":"Mal\u00e9 MLE","connections":["Dubai","Singapore","Mumbai","Kuala Lumpur","London"]},"South Africa":{"hub":"Johannesburg JNB","connections":["London","Dubai","Amsterdam","Frankfurt","S\u00e3o Paulo"]},"Kenya":{"hub":"Nairobi NBO","connections":["London","Dubai","Amsterdam","Istanbul","Addis Ababa"]},"Ethiopia":{"hub":"Addis Ababa ADD","connections":["London","Dubai","Washington","Paris","Frankfurt"]},"Nigeria":{"hub":"Lagos LOS","connections":["London","Dubai","Amsterdam","Paris","Addis Ababa"]},"Tanzania":{"hub":"Dar es Salaam DAR","connections":["Dubai","Amsterdam","London","Nairobi","Addis Ababa"]},"Rwanda":{"hub":"Kigali KGL","connections":["London","Brussels","Dubai","Nairobi","Addis Ababa"]},"Tunisia":{"hub":"Tunis TUN","connections":["Paris","Frankfurt","London","Rome","Istanbul"]},"Mauritius":{"hub":"Port Louis MRU","connections":["Johannesburg","Dubai","London","Paris","Singapore"]},"United States":{"hub":"New York JFK / LA LAX","connections":["London","Tokyo","Dubai","Paris","Frankfurt"]},"Canada":{"hub":"Toronto YYZ / Vancouver YVR","connections":["London","New York","Tokyo","Frankfurt","Paris"]},"Mexico":{"hub":"Mexico City MEX","connections":["Los Angeles","New York","Miami","Madrid","London"]},"Brazil":{"hub":"S\u00e3o Paulo GRU","connections":["Lisbon","London","Paris","Miami","Frankfurt"]},"Argentina":{"hub":"Buenos Aires EZE","connections":["S\u00e3o Paulo","Madrid","Miami","London","Paris"]},"Colombia":{"hub":"Bogot\u00e1 BOG","connections":["Miami","New York","Madrid","S\u00e3o Paulo","Mexico City"]},"Chile":{"hub":"Santiago SCL","connections":["S\u00e3o Paulo","Buenos Aires","Miami","Madrid","Lima"]},"Peru":{"hub":"Lima LIM","connections":["Miami","Bogot\u00e1","S\u00e3o Paulo","Madrid","Mexico City"]},"Cuba":{"hub":"Havana HAV","connections":["Mexico City","Madrid","Toronto","Panama City","Canc\u00fan"]},"Costa Rica":{"hub":"San Jos\u00e9 SJO","connections":["Miami","New York","Los Angeles","Toronto","Madrid"]},"Panama":{"hub":"Panama City PTY","connections":["Miami","New York","Bogot\u00e1","Mexico City","Madrid"]},"Dominican Republic":{"hub":"Punta Cana PUJ","connections":["Miami","New York","Madrid","Toronto","London"]},"Jamaica":{"hub":"Kingston KIN","connections":["Miami","New York","London","Toronto","Nassau"]},"Australia":{"hub":"Sydney SYD","connections":["Singapore","Hong Kong","Dubai","London","Los Angeles"]},"New Zealand":{"hub":"Auckland AKL","connections":["Sydney","Singapore","Los Angeles","London","Hong Kong"]},"Fiji":{"hub":"Nadi NAN","connections":["Sydney","Auckland","Los Angeles","Singapore","Hong Kong"]},"Georgia":{"hub":"Tbilisi TBS","connections":["Istanbul","Moscow","Dubai","Frankfurt","Tel Aviv"]},"Armenia":{"hub":"Yerevan EVN","connections":["Moscow","Istanbul","Dubai","Frankfurt","Paris"]},"Azerbaijan":{"hub":"Baku GYD","connections":["Istanbul","Moscow","Dubai","Frankfurt","Kiev"]},"Kazakhstan":{"hub":"Almaty ALA","connections":["Moscow","Dubai","Frankfurt","Beijing","Istanbul"]},"Cyprus":{"hub":"Larnaca LCA","connections":["London","Athens","Tel Aviv","Dubai","Frankfurt"]},"Lebanon":{"hub":"Beirut BEY","connections":["Dubai","Paris","London","Frankfurt","Cairo"]},"Iran":{"hub":"Tehran IKA","connections":["Dubai","Istanbul","Frankfurt","Moscow","Beijing"]},"Pakistan":{"hub":"Karachi KHI","connections":["Dubai","London","Kuala Lumpur","Bangkok","Frankfurt"]},"Bangladesh":{"hub":"Dhaka DAC","connections":["Dubai","Singapore","Kuala Lumpur","Bangkok","London"]},"Myanmar":{"hub":"Yangon RGN","connections":["Bangkok","Singapore","Kuala Lumpur","Hong Kong","Beijing"]},"Ghana":{"hub":"Accra ACC","connections":["London","Dubai","Amsterdam","Paris","Washington"]},"Senegal":{"hub":"Dakar DSS","connections":["Paris","Casablanca","New York","Dubai","London"]},"Belize":{"hub":"Belize City BZE","connections":["Miami","Houston","Dallas","Atlanta","Canc\u00fan"]},"Ecuador":{"hub":"Quito UIO","connections":["Miami","Bogot\u00e1","Lima","New York","Madrid"]},"Bolivia":{"hub":"La Paz LPB","connections":["Lima","S\u00e3o Paulo","Buenos Aires","Bogot\u00e1","Miami"]},"Uruguay":{"hub":"Montevideo MVD","connections":["Buenos Aires","S\u00e3o Paulo","Madrid","Miami","Lima"]},"Guatemala":{"hub":"Guatemala City GUA","connections":["Miami","Houston","Los Angeles","Mexico City","San Salvador"]}};

var travelMap = new Map();

var W = 960, H = 500;
var projection = d3.geoNaturalEarth1().scale(148).translate([W/2, H/2 + 20]);
var pathGen = d3.geoPath().projection(projection);

var tooltip = document.getElementById('tooltip');

function getName(d) {
  return d.properties.name || d.properties.ADMIN || d.properties.NAME || '';
}

function showTooltip(event, d) {
  var name = getName(d);
  var entry = travelMap.get(name.toLowerCase());
  document.getElementById('tt-name').textContent = name;

  if (!entry) {
    document.getElementById('tt-body').innerHTML =
      '<div class="tt-section"><p class="tt-nodata">No travel data available</p></div>';
  } else {
    var months = entry.bestMonths || [];
    var visa = (entry.visaRequirements || {})[activePassport] || 'No info';
    var visaClass = visa.toLowerCase().indexOf('visa-free') !== -1 ? 'good' : 'warn';
    var mandVax = (entry.vaccines && entry.vaccines.mandatory && entry.vaccines.mandatory.length)
      ? entry.vaccines.mandatory.join(', ') : 'None';
    var recVax = (entry.vaccines && entry.vaccines.recommended && entry.vaccines.recommended.length)
      ? entry.vaccines.recommended.join(', ') : 'None';
    var flights = FLIGHT_DATA[name];

    var monthTags = months.map(function(m) {
      var cls = m === activeMonth ? 'tag highlight' : 'tag';
      return '<span class="' + cls + '">' + m.slice(0,3) + '</span>';
    }).join('');

    var flightHtml = '';
    if (flights) {
      var conns = flights.connections.slice(0,5).join(' · ');
      flightHtml =
        '<div class="tt-section">' +
          '<div class="tt-label">Flights</div>' +
          '<div class="tt-row"><span class="tt-k">Main hub</span><span class="tt-v">' + flights.hub + '</span></div>' +
          '<div class="tt-row"><span class="tt-k">Top routes</span><span class="tt-v dim">' + conns + '</span></div>' +
        '</div>';
    }

    document.getElementById('tt-body').innerHTML =
      '<div class="tt-section">' +
        '<div class="tt-label">Best months</div>' +
        '<div class="tags">' + (monthTags || '<span class="tt-nodata">No data</span>') + '</div>' +
      '</div>' +
      '<div class="tt-section">' +
        '<div class="tt-row"><span class="tt-k">Visa (' + activePassport + ')</span><span class="tt-v ' + visaClass + '">' + visa + '</span></div>' +
        '<div class="tt-row"><span class="tt-k">Required vaccines</span><span class="tt-v">' + mandVax + '</span></div>' +
        '<div class="tt-row"><span class="tt-k">Recommended</span><span class="tt-v dim">' + recVax + '</span></div>' +
      '</div>' +
      flightHtml;
  }
  moveTooltip(event);
  tooltip.classList.remove('hidden');
}

function moveTooltip(event) {
  var w = 280, h = tooltip.offsetHeight || 200;
  var vw = window.innerWidth, vh = window.innerHeight;
  var x = event.clientX + 16, y = event.clientY - 10;
  if (x + w > vw - 8) x = event.clientX - w - 16;
  if (y + h > vh - 8) y = vh - h - 8;
  if (y < 8) y = 8;
  tooltip.style.left = x + 'px';
  tooltip.style.top  = y + 'px';
}

function hideTooltip() { tooltip.classList.add('hidden'); }

function updatePlannerColors() {
  d3.select('#map svg').selectAll('path.country')
    .transition().duration(350)
    .attr('fill', function(d) {
      var name = getName(d).toLowerCase();
      var entry = travelMap.get(name);
      if (!entry) return '#161a28';
      var isGood = activeMonth === 'All' || (entry.bestMonths || []).indexOf(activeMonth) !== -1;
      return isGood ? '#3bc9a0' : '#1e2640';
    });

  setTimeout(function() {
    var good = 0, vf = 0;
    d3.select('#map svg').selectAll('path.country').each(function(d) {
      var name = getName(d).toLowerCase();
      var entry = travelMap.get(name);
      if (!entry) return;
      var isGood = activeMonth === 'All' || (entry.bestMonths || []).indexOf(activeMonth) !== -1;
      if (isGood) {
        good++;
        var visa = (entry.visaRequirements || {})[activePassport] || '';
        if (visa.toLowerCase().indexOf('visa-free') !== -1) vf++;
      }
    });
    document.getElementById('stat-good').textContent = good;
    document.getElementById('stat-vf').textContent = vf;
  }, 360);
}

Promise.all([
  d3.json('world.geojson'),
  d3.json('travel_data.json')
]).then(function(results) {
  var geoData = results[0];
  var travelData = results[1];

  travelData.forEach(function(d) {
    travelMap.set(d.country.toLowerCase(), d);
  });

  // Draw planner map
  var svg = d3.select('#map')
    .append('svg')
    .attr('viewBox', '0 0 ' + W + ' ' + H);

  svg.selectAll('path')
    .data(geoData.features)
    .enter().append('path')
    .attr('class', 'country')
    .attr('d', pathGen)
    .on('mouseover', function(event, d) { showTooltip(event, d); })
    .on('mousemove', function(event) { moveTooltip(event); })
    .on('mouseout', hideTooltip);

  updatePlannerColors();

}).catch(function(err) {
  console.error('Error loading data:', err);
});

// Month pills
document.querySelectorAll('.pill').forEach(function(pill) {
  pill.addEventListener('click', function() {
    document.querySelectorAll('.pill').forEach(function(p) { p.classList.remove('active'); });
    pill.classList.add('active');
    activeMonth = pill.dataset.month;
    updatePlannerColors();
  });
});

// Passport
document.getElementById('passport-select').addEventListener('change', function(e) {
  activePassport = e.target.value;
  updatePlannerColors();
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});
