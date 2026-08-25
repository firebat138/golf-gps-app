let appState = {
    currentCourseId: 'test-course',
    currentHole: 1,
    map: null,
    mapReady: false,
    playerPosition: null,
    gpsWatchId: null
};

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    if (!CONFIG.mapbox.accessToken || CONFIG.mapbox.accessToken === 'YOUR_MAPBOX_TOKEN') {
        alert('Mapbox token not configured!');
        return;
    }
    mapboxgl.accessToken = CONFIG.mapbox.accessToken;
    initMap();
    startGPS();
}

function initMap() {
    const course = getCourse(appState.currentCourseId);
    const hole = course.holes[0];

    appState.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: hole.tee,
        zoom: 15,
        pitch: 0,
        bearing: 0
    });

    appState.map.on('load', () => {
        appState.map.addSource('hole-data', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
        });

        appState.map.addLayer({
            id: 'tee-marker',
            type: 'circle',
            source: 'hole-data',
            filter: ['==', ['get', 'type'], 'tee'],
            paint: {
                'circle-radius': 6,
                'circle-color': '#ff6b3d',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
            }
        });

        appState.map.addLayer({
            id: 'green-markers',
            type: 'circle',
            source: 'hole-data',
            filter: ['in', ['get', 'type'], ['literal', ['front', 'center', 'back']]],
            paint: {
                'circle-radius': ['case', ['==', ['get', 'type'], 'center'], 8, 6],
                'circle-color': ['case', ['==', ['get', 'type'], 'center'], '#00d97e', '#00a85c'],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
            }
        });

        // Player live position source + layer
        appState.map.addSource('player-position', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
        });

        appState.map.addLayer({
            id: 'player-position-halo',
            type: 'circle',
            source: 'player-position',
            paint: {
                'circle-radius': 14,
                'circle-color': '#3b82f6',
                'circle-opacity': 0.25
            }
        });

        appState.map.addLayer({
            id: 'player-position-dot',
            type: 'circle',
            source: 'player-position',
            paint: {
                'circle-radius': 7,
                'circle-color': '#3b82f6',
                'circle-stroke-width': 3,
                'circle-stroke-color': '#fff'
            }
        });

        // Map is fully ready now - safe to load hole data
        appState.mapReady = true;
        loadHole(appState.currentHole);
    });
}

function loadHole(holeNumber) {
    const course = getCourse(appState.currentCourseId);
    const hole = getHole(appState.currentCourseId, holeNumber);
    if (!hole) return;

    appState.currentHole = holeNumber;

    document.querySelector('.hole-number').textContent = 'HOLE ' + hole.holeNumber;
    document.querySelector('.hole-meta').textContent = 'PAR ' + hole.par + ' • ' + hole.yardage + ' YDS';

    if (appState.map && appState.mapReady) {
        const features = [
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.tee }, properties: { type: 'tee' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.greenFront }, properties: { type: 'front' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.greenCenter }, properties: { type: 'center' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.greenBack }, properties: { type: 'back' } }
        ];
        appState.map.getSource('hole-data').setData({ type: 'FeatureCollection', features });

        const coords = [hole.tee, hole.greenFront, hole.greenCenter, hole.greenBack];
        const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));

        // Rotate so the hole points straight up the screen (tee at bottom, green at top)
        const bearing = calculateBearing(hole.tee, hole.greenCenter);

        appState.map.fitBounds(bounds, {
            padding: { top: 100, bottom: 180, left: 50, right: 50 },
            maxZoom: 19,
            duration: 400,
            bearing: bearing
        });
    }

    updateNavButtons(course.holes.length);
    updateDistances();
}

function calculateBearing(start, end) {
    const lat1 = start[1] * Math.PI / 180;
    const lat2 = end[1] * Math.PI / 180;
    const dLng = (end[0] - start[0]) * Math.PI / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    return bearing;
}

function updateNavButtons(totalHoles) {
    document.getElementById('prev-hole').disabled = appState.currentHole === 1;
    document.getElementById('next-hole').disabled = appState.currentHole === totalHoles;
}

// ===== GPS TRACKING =====
function startGPS() {
    if (!navigator.geolocation) {
        document.getElementById('gps-status').textContent = 'GPS not available';
        return;
    }

    appState.gpsWatchId = navigator.geolocation.watchPosition(
        onGPSUpdate,
        onGPSError,
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
    );
}

function onGPSUpdate(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const accuracyMeters = position.coords.accuracy;
    const accuracyYards = Math.round(accuracyMeters * 1.09361);

    appState.playerPosition = { lat, lon, accuracyYards };

    const gpsEl = document.getElementById('gps-status');
    gpsEl.textContent = 'GPS ± ' + accuracyYards + ' yd';
    gpsEl.classList.toggle('warning', accuracyYards > 10);

    // Update player marker on map
    if (appState.map && appState.mapReady) {
        appState.map.getSource('player-position').setData({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [lon, lat] },
                properties: {}
            }]
        });
    }

    updateDistances();
}

function onGPSError(error) {
    const gpsEl = document.getElementById('gps-status');
    if (error.code === error.PERMISSION_DENIED) {
        gpsEl.textContent = 'GPS permission denied';
    } else if (error.code === error.POSITION_UNAVAILABLE) {
        gpsEl.textContent = 'GPS unavailable';
    } else if (error.code === error.TIMEOUT) {
        gpsEl.textContent = 'GPS timed out';
    } else {
        gpsEl.textContent = 'GPS error';
    }
    gpsEl.classList.add('warning');
}

// Haversine formula - returns distance in yards
function distanceInYards(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const toRad = (deg) => deg * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const meters = R * c;
    return meters * 1.09361; // meters to yards
}

function updateDistances() {
    if (!appState.playerPosition) return;

    const hole = getHole(appState.currentCourseId, appState.currentHole);
    if (!hole) return;

    const { lat, lon } = appState.playerPosition;

    const distFront = distanceInYards(lat, lon, hole.greenFront[1], hole.greenFront[0]);
    const distCenter = distanceInYards(lat, lon, hole.greenCenter[1], hole.greenCenter[0]);
    const distBack = distanceInYards(lat, lon, hole.greenBack[1], hole.greenBack[0]);

    document.getElementById('dist-front').textContent = Math.round(distFront);
    document.getElementById('dist-center').textContent = Math.round(distCenter);
    document.getElementById('dist-back').textContent = Math.round(distBack);
}

document.getElementById('prev-hole').addEventListener('click', () => {
    if (appState.currentHole > 1) loadHole(appState.currentHole - 1);
});

document.getElementById('next-hole').addEventListener('click', () => {
    const course = getCourse(appState.currentCourseId);
    if (appState.currentHole < course.holes.length) loadHole(appState.currentHole + 1);
});
