// countries-traveled.js — My Travels tracker with Supabase + magic link auth

var SUPABASE_URL = 'https://mptrltmkybwlvginlcvh.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wdHJsdG1reWJ3bHZnaW5sY3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExODk1MTAsImV4cCI6MjA5Njc2NTUxMH0.1lrCMHOSNzY1RoRkhT7609CLM-5WpldqySh_D22xDyw';

var currentUser = null;
var traveledCountries = {};
var totalCountries = 0;
var trackerGeoData = null;

var projT = d3.geoNaturalEarth1().scale(148).translate([480, 270]);
var pathT = d3.geoPath().projection(projT);
var tooltipT = document.getElementById('tooltip');

// ── Auth UI ───────────────────────────────────────────────────────────

function renderAuthUI() {
  var panel = document.getElementById('tab-tracker');

  // Remove old auth banner if exists
  var old = document.getElementById('auth-banner');
  if (old) old.remove();

  var banner = document.createElement('div');
  banner.id = 'auth-banner';

  if (currentUser) {
    banner.innerHTML =
      '<div class="auth-bar">' +
        '<span class="auth-email">&#128100; ' + currentUser.email + '</span>' +
        '<button class="auth-btn secondary" id="signout-btn">Sign out</button>' +
      '</div>';
    panel.insertBefore(banner, panel.firstChild);
    document.getElementById('signout-btn').addEventListener('click', signOut);
  } else {
    banner.innerHTML =
      '<div class="auth-bar">' +
        '<p class="auth-hint">Sign in to save your travels across all devices.</p>' +
        '<div class="auth-form">' +
          '<input type="email" id="auth-email" placeholder="your@email.com" class="auth-input">' +
          '<button class="auth-btn" id="magic-btn">Send magic link</button>' +
        '</div>' +
        '<p class="auth-msg" id="auth-msg"></p>' +
      '</div>';
    panel.insertBefore(banner, panel.firstChild);
    document.getElementById('magic-btn').addEventListener('click', sendMagicLink);
    document.getElementById('auth-email').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') sendMagicLink();
    });
  }
}

function sendMagicLink() {
  var email = document.getElementById('auth-email').value.trim();
  var msg = document.getElementById('auth-msg');
  if (!email) { msg.textContent = 'Please enter your email.'; return; }
  msg.textContent = 'Sending...';
  fetch(SUPABASE_URL + '/auth/v1/otp', {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, create_user: true })
  })
  .then(function(r) {
    if (r.ok) {
      msg.style.color = '#3bc9a0';
      msg.textContent = '✓ Magic link sent! Check your email.';
    } else {
      msg.style.color = '#e06060';
      msg.textContent = 'Error sending link. Try again.';
    }
  })
  .catch(function() {
    msg.style.color = '#e06060';
    msg.textContent = 'Network error. Try again.';
  });
}

function signOut() {
  fetch(SUPABASE_URL + '/auth/v1/logout', {
    method: 'POST',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + getAccessToken() }
  }).finally(function() {
    localStorage.removeItem('sb_session');
    currentUser = null;
    traveledCountries = {};
    renderAuthUI();
    refreshTrackerMap();
    updateTrackerStats();
  });
}

// ── Session management ────────────────────────────────────────────────

function getAccessToken() {
  var s = getSession();
  return s ? s.access_token : null;
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('sb_session')); } catch(e) { return null; }
}

function saveSession(session) {
  localStorage.setItem('sb_session', JSON.stringify(session));
}

function handleTokenFromUrl() {
  // Supabase magic link puts token in URL hash
  var hash = window.location.hash;
  if (!hash) return false;
  var params = new URLSearchParams(hash.replace('#', '?'));
  var accessToken = params.get('access_token');
  var refreshToken = params.get('refresh_token');
  if (!accessToken) return false;

  // Fetch user with this token
  fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + accessToken }
  })
  .then(function(r) { return r.json(); })
  .then(function(user) {
    currentUser = user;
    saveSession({ access_token: accessToken, refresh_token: refreshToken });
    // Clean URL
    history.replaceState(null, '', window.location.pathname);
    renderAuthUI();
    loadFromSupabase(function() {
      if (trackerGeoData) refreshTrackerMap();
    });
  })
  .catch(function(err) { console.error('Token error:', err); });

  return true;
}

function initSession() {
  var session = getSession();
  if (!session) return;
  fetch(SUPABASE_URL + '/auth/v1/user', {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + session.access_token }
  })
  .then(function(r) {
    if (r.status === 401) { localStorage.removeItem('sb_session'); return null; }
    return r.json();
  })
  .then(function(user) {
    if (!user) return;
    currentUser = user;
    renderAuthUI();
    loadFromSupabase(function() {
      if (trackerGeoData) refreshTrackerMap();
    });
  })
  .catch(function(err) { console.error('Session init error:', err); });
}

// ── Supabase data helpers ─────────────────────────────────────────────

function sbHeaders() {
  var token = getAccessToken();
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + (token || SUPABASE_KEY),
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };
}

function getUserId() {
  return currentUser ? currentUser.id : null;
}

function loadFromSupabase(callback) {
  if (!getUserId()) { traveledCountries = {}; callback(); return; }
  fetch(SUPABASE_URL + '/rest/v1/visited_countries?select=country&user_id=eq.' + getUserId(), {
    headers: sbHeaders()
  })
  .then(function(r) { return r.json(); })
  .then(function(rows) {
    traveledCountries = {};
    if (Array.isArray(rows)) rows.forEach(function(row) { traveledCountries[row.country] = true; });
    callback();
  })
  .catch(function(err) { console.error('Load error:', err); callback(); });
}

function saveCountry(country) {
  if (!getUserId()) return;
  fetch(SUPABASE_URL + '/rest/v1/visited_countries', {
    method: 'POST',
    headers: sbHeaders(),
    body: JSON.stringify({ user_id: getUserId(), country: country })
  }).catch(function(err) { console.error('Save error:', err); });
}

function deleteCountry(country) {
  if (!getUserId()) return;
  fetch(SUPABASE_URL + '/rest/v1/visited_countries?user_id=eq.' + getUserId() + '&country=eq.' + encodeURIComponent(country), {
    method: 'DELETE',
    headers: sbHeaders()
  }).catch(function(err) { console.error('Delete error:', err); });
}

function deleteAll() {
  if (!getUserId()) return;
  fetch(SUPABASE_URL + '/rest/v1/visited_countries?user_id=eq.' + getUserId(), {
    method: 'DELETE',
    headers: sbHeaders()
  }).catch(function(err) { console.error('Delete all error:', err); });
}

// ── Stats ─────────────────────────────────────────────────────────────

function updateTrackerStats() {
  var v = Object.keys(traveledCountries).length;
  var pct = totalCountries ? Math.round(v / totalCountries * 100) : 0;
  document.getElementById('countries-traveled').textContent = v;
  document.getElementById('stat-pct').textContent = pct + '%';
  document.getElementById('countries-missing').textContent = Math.max(0, totalCountries - v);
}

// ── Tooltip ───────────────────────────────────────────────────────────

function showTrackerTooltip(event, name) {
  document.getElementById('tt-name').textContent = name;
  var loggedIn = !!currentUser;
  var visited = traveledCountries[name];
  var msg = !loggedIn ? 'Sign in to track visits'
          : visited    ? '&#10003; Visited'
          :              'Click to mark as visited';
  var cls = visited ? 'tt-visited' : 'tt-nodata';
  document.getElementById('tt-body').innerHTML =
    '<div class="tt-section"><p class="' + cls + '">' + msg + '</p></div>';
  positionTrackerTooltip(event);
  tooltipT.classList.remove('hidden');
}

function positionTrackerTooltip(event) {
  var w = 280, h = tooltipT.offsetHeight || 80;
  var vw = window.innerWidth, vh = window.innerHeight;
  var x = event.clientX + 16, y = event.clientY - 10;
  if (x + w > vw - 8) x = event.clientX - w - 16;
  if (y + h > vh - 8) y = vh - h - 8;
  if (y < 8) y = 8;
  tooltipT.style.left = x + 'px';
  tooltipT.style.top  = y + 'px';
}

// ── Map ───────────────────────────────────────────────────────────────

function refreshTrackerMap() {
  d3.select('#map-tracker svg').selectAll('path.country')
    .attr('fill', function(d) {
      return traveledCountries[d.properties.name || ''] ? '#f0a500' : '#2a3352';
    });
}

function drawTrackerMap(geoData) {
  trackerGeoData = geoData;
  totalCountries = geoData.features.length;

  var svg = d3.select('#map-tracker').append('svg').attr('viewBox', '0 0 960 500');

  svg.selectAll('path')
    .data(geoData.features)
    .enter().append('path')
    .attr('class', 'country')
    .attr('d', pathT)
    .attr('fill', function(d) {
      return traveledCountries[d.properties.name || ''] ? '#f0a500' : '#2a3352';
    })
    .on('mouseover', function(event, d) { showTrackerTooltip(event, d.properties.name || ''); })
    .on('mousemove', function(event) { positionTrackerTooltip(event); })
    .on('mouseout', function() { tooltipT.classList.add('hidden'); })
    .on('click', function(event, d) {
      if (!currentUser) return; // must be logged in
      var name = d.properties.name || '';
      if (traveledCountries[name]) {
        delete traveledCountries[name];
        d3.select(this).attr('fill', '#2a3352');
        deleteCountry(name);
      } else {
        traveledCountries[name] = true;
        d3.select(this).attr('fill', '#f0a500');
        saveCountry(name);
      }
      updateTrackerStats();
      showTrackerTooltip(event, name);
    });

  updateTrackerStats();
}

// ── Init ──────────────────────────────────────────────────────────────

// Also run the SQL update if needed - update table to use user_id
d3.json('world.geojson').then(function(geoData) {
  renderAuthUI();
  if (!handleTokenFromUrl()) {
    initSession();
  }
  drawTrackerMap(geoData);
}).catch(function(err) {
  console.error('Error loading world.geojson:', err);
});

document.getElementById('reset-btn').addEventListener('click', function() {
  if (!currentUser) return;
  if (!confirm('Reset all visited countries?')) return;
  traveledCountries = {};
  deleteAll();
  d3.select('#map-tracker svg').selectAll('path.country').attr('fill', '#2a3352');
  updateTrackerStats();
});
