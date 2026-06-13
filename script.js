// script.js

var activeMonth = 'All';
var activePassport = 'France';
var showFilter = 'all';
var mapReady = false;

var FLIGHT_HUBS = {"France":"Paris CDG","Germany":"Frankfurt FRA","United Kingdom":"London LHR","Spain":"Madrid MAD","Italy":"Rome FCO","Netherlands":"Amsterdam AMS","Portugal":"Lisbon LIS","Turkey":"Istanbul IST","Greece":"Athens ATH","Switzerland":"Zurich ZRH","Austria":"Vienna VIE","Belgium":"Brussels BRU","Sweden":"Stockholm ARN","Norway":"Oslo OSL","Denmark":"Copenhagen CPH","Finland":"Helsinki HEL","Poland":"Warsaw WAW","United Arab Emirates":"Dubai DXB","Qatar":"Doha DOH","Saudi Arabia":"Riyadh RUH","Israel":"Tel Aviv TLV","Egypt":"Cairo CAI","Morocco":"Casablanca CMN","Japan":"Tokyo NRT","China":"Beijing PEK","India":"Mumbai BOM","Singapore":"Singapore SIN","Thailand":"Bangkok BKK","Indonesia":"Bali DPS / Jakarta CGK","Malaysia":"Kuala Lumpur KUL","Vietnam":"Hanoi HAN / Ho Chi Minh SGN","Philippines":"Manila MNL","South Korea":"Seoul ICN","South Africa":"Johannesburg JNB","Kenya":"Nairobi NBO","Ethiopia":"Addis Ababa ADD","Nigeria":"Lagos LOS","United States of America":"New York JFK / LA LAX","Canada":"Toronto YYZ / Vancouver YVR","Mexico":"Mexico City MEX","Brazil":"S\u00e3o Paulo GRU","Argentina":"Buenos Aires EZE","Colombia":"Bogot\u00e1 BOG","Chile":"Santiago SCL","Peru":"Lima LIM","Australia":"Sydney SYD","New Zealand":"Auckland AKL","Cyprus":"Larnaca LCA","Georgia":"Tbilisi TBS","Russia":"Moscow SVO","Ukraine":"Kyiv KBP"};
var GEO_CLASS = {"un_member":["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barb.","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herz.","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Rep.","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba","Cyprus","Czechia","C\u00f4te d'Ivoire","Dem. Rep. Congo","Denmark","Djibouti","Dominica","Dominican Rep.","Ecuador","Egypt","El Salvador","Eq. Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Is.","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","S. Sudan","Saint Lucia","Samoa","San Marino","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Is.","Somalia","South Africa","South Korea","Spain","Sri Lanka","St. Kitts and Nevis","St. Vin. and Gren.","Sudan","Suriname","Sweden","Switzerland","Syria","S\u00e3o Tom\u00e9 and Principe","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States of America","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe","eSwatini"],"observer":["Palestine","Vatican"],"territory":["American Samoa","Anguilla","Aruba","Ashmore and Cartier Is.","Bermuda","British Virgin Is.","Cayman Is.","Cook Is.","Cura\u00e7ao","Faeroe Is.","Falkland Is.","Fr. Polynesia","Greenland","Guam","Guernsey","Hong Kong","Indian Ocean Ter.","Isle of Man","Jersey","Macao","Montserrat","N. Mariana Is.","New Caledonia","Niue","Norfolk Island","Pitcairn Is.","Puerto Rico","Saint Helena","Sint Maarten","St-Barth\u00e9lemy","St-Martin","St. Pierre and Miquelon","Turks and Caicos Is.","U.S. Virgin Is.","Wallis and Futuna Is.","\u00c5land"],"disputed":["Kosovo","N. Cyprus","Siachen Glacier","Somaliland","Taiwan","W. Sahara"]};
var NAME_MAP    = {"Bosnia and Herz.":"Bosnia and Herzegovina","Cabo Verde":"Cape Verde","Central African Rep.":"Central African Republic","Czechia":"Czech Republic","Dem. Rep. Congo":"Democratic Republic of the Congo","C\u00f4te d'Ivoire":"Ivory Coast","Solomon Is.":"Solomon Islands","S. Sudan":"South Sudan","Dominican Rep.":"Dominican Republic","Eq. Guinea":"Equatorial Guinea","Marshall Is.":"Marshall Islands","S\u00e3o Tom\u00e9 and Principe":"Sao Tome and Principe","St. Kitts and Nevis":"Saint Kitts and Nevis","St. Vin. and Gren.":"Saint Vincent and the Grenadines","Trinidad and Tobago":"Trinidad and Tobago","eSwatini":"Eswatini"};

var unMemberSet = new Set(GEO_CLASS.un_member.map(function(n){return n.toLowerCase();}));
var observerSet = new Set(GEO_CLASS.observer.map(function(n){return n.toLowerCase();}));
var territorySet = new Set(GEO_CLASS.territory.map(function(n){return n.toLowerCase();}));
var disputedSet  = new Set(GEO_CLASS.disputed.map(function(n){return n.toLowerCase();}));

var travelMap = new Map();
var W = 960, H = 500;
var projection = d3.geoNaturalEarth1().scale(148).translate([W/2, H/2+20]);
var pathGen = d3.geoPath().projection(projection);
var tooltip = document.getElementById('tooltip');

function getName(d) {
  return d.properties.name || d.properties.ADMIN || d.properties.NAME || '';
}

// Normalise geojson name to match travel_data key
function normName(name) {
  return NAME_MAP[name] || name;
}

function getClass(name) {
  var n = name.toLowerCase();
  if (unMemberSet.has(n)) return 'un_member';
  if (observerSet.has(n)) return 'observer';
  if (territorySet.has(n)) return 'territory';
  if (disputedSet.has(n)) return 'disputed';
  return 'un_member';
}

function showTooltip(event, d) {
  var geoName  = getName(d);
  var lookupName = normName(geoName);
  var entry = travelMap.get(lookupName.toLowerCase());
  var cls   = getClass(geoName);
  var badge = cls === 'observer'   ? ' <span class="tt-badge observer">Observer State</span>'
            : cls === 'territory' ? ' <span class="tt-badge territory">Territory</span>'
            : cls === 'disputed'  ? ' <span class="tt-badge disputed">Disputed</span>'
            : '';
  document.getElementById('tt-name').innerHTML = geoName + badge;

  if (!entry) {
    document.getElementById('tt-body').innerHTML =
      '<div class="tt-section"><p class="tt-nodata">No travel data</p></div>';
  } else {
    var months = entry.bestMonths || [];
    var visa = (entry.visaRequirements||{})[activePassport] || 'No info';
    var visaClass = visa.toLowerCase().indexOf('visa-free') !== -1 ? 'good' : 'warn';
    var mandVax = (entry.vaccines&&entry.vaccines.mandatory&&entry.vaccines.mandatory.length)
      ? entry.vaccines.mandatory.join(', ') : 'None';
    var recVax = (entry.vaccines&&entry.vaccines.recommended&&entry.vaccines.recommended.length)
      ? entry.vaccines.recommended.join(', ') : 'None';
    var hub = FLIGHT_HUBS[geoName];
    var monthTags = months.map(function(m){
      return '<span class="tag'+(m===activeMonth?' highlight':'')+'">'+m.slice(0,3)+'</span>';
    }).join('');
    document.getElementById('tt-body').innerHTML =
      '<div class="tt-section">'+
        '<div class="tt-label">Best months</div>'+
        '<div class="tags">'+(monthTags||'<span class="tt-nodata">No data</span>')+'</div>'+
      '</div>'+
      '<div class="tt-section">'+
        '<div class="tt-row"><span class="tt-k">Visa ('+activePassport+')</span><span class="tt-v '+visaClass+'">'+visa+'</span></div>'+
        '<div class="tt-row"><span class="tt-k">Required vaccines</span><span class="tt-v">'+mandVax+'</span></div>'+
        '<div class="tt-row"><span class="tt-k">Recommended</span><span class="tt-v dim">'+recVax+'</span></div>'+
      '</div>'+
      (hub ? '<div class="tt-section"><div class="tt-row"><span class="tt-k">Main hub</span><span class="tt-v">'+hub+'</span></div></div>' : '');
  }
  moveTooltip(event);
  tooltip.classList.remove('hidden');
}

function moveTooltip(event) {
  var w=280, h=tooltip.offsetHeight||200;
  var vw=window.innerWidth, vh=window.innerHeight;
  var x=event.clientX+16, y=event.clientY-10;
  if(x+w>vw-8) x=event.clientX-w-16;
  if(y+h>vh-8) y=vh-h-8;
  if(y<8) y=8;
  tooltip.style.left=x+'px'; tooltip.style.top=y+'px';
}
function hideTooltip(){ tooltip.classList.add('hidden'); }

function getCountryColor(d) {
  var geoName = getName(d);
  var lookupName = normName(geoName);
  var nameLower = lookupName.toLowerCase();
  var cls = getClass(geoName);
  if (showFilter !== 'all' && cls !== showFilter) return '#1c2138';
  var entry = travelMap.get(nameLower);
  if (!entry) return '#2a3352';
  var isGood = activeMonth === 'All' || (entry.bestMonths||[]).indexOf(activeMonth) !== -1;
  return isGood ? '#3bc9a0' : '#2a3352';
}

function updatePlannerColors() {
  if (!mapReady) return;
  d3.select('#map svg').selectAll('path.country')
    .transition().duration(300)
    .style('fill', function(d){ return getCountryColor(d); });
  setTimeout(function(){
    var good=0, vf=0;
    d3.select('#map svg').selectAll('path.country').each(function(d){
      var entry = travelMap.get(normName(getName(d)).toLowerCase());
      if (!entry) return;
      var isGood = activeMonth==='All' || (entry.bestMonths||[]).indexOf(activeMonth)!==-1;
      if (!isGood) return;
      good++;
      var visa=(entry.visaRequirements||{})[activePassport]||'';
      if(visa.toLowerCase().indexOf('visa-free')!==-1) vf++;
    });
    document.getElementById('stat-good').textContent = good;
    document.getElementById('stat-vf').textContent = vf;
  }, 320);
}

Promise.all([
  d3.json('world.geojson'),
  d3.json('travel_data.json')
]).then(function(results){
  var geoData=results[0], travelData=results[1];
  travelData.forEach(function(d){ travelMap.set(d.country.toLowerCase(), d); });

  var svg = d3.select('#map').append('svg').attr('viewBox','0 0 '+W+' '+H);
  svg.selectAll('path')
    .data(geoData.features).enter().append('path')
    .attr('class','country').attr('d',pathGen)
    .style('fill', function(d){ return getCountryColor(d); })
    .on('mouseover', function(event,d){ showTooltip(event,d); })
    .on('mousemove', function(event){ moveTooltip(event); })
    .on('mouseout', hideTooltip);

  mapReady = true;
  updatePlannerColors();
}).catch(function(err){ console.error('Error:',err); });

document.querySelectorAll('.pill').forEach(function(pill){
  pill.addEventListener('click', function(){
    document.querySelectorAll('.pill').forEach(function(p){p.classList.remove('active');});
    pill.classList.add('active');
    activeMonth = pill.dataset.month;
    updatePlannerColors();
  });
});

document.getElementById('passport-select').addEventListener('change', function(e){
  activePassport = e.target.value;
  updatePlannerColors();
});

document.querySelectorAll('.filter-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.filter-btn').forEach(function(b){b.classList.remove('active');});
    btn.classList.add('active');
    showFilter = btn.dataset.filter;
    updatePlannerColors();
  });
});

document.querySelectorAll('.tab-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    document.querySelectorAll('.tab-btn').forEach(function(b){b.classList.remove('active');});
    document.querySelectorAll('.tab-panel').forEach(function(p){p.classList.remove('active');});
    btn.classList.add('active');
    document.getElementById('tab-'+btn.dataset.tab).classList.add('active');
  });
});
