let appState = {
    currentCourseId: 'test-course',
    currentHole: 1,
    map: null
};

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    if (!CONFIG.mapbox.accessToken || CONFIG.mapbox.accessToken === 'YOUR_MAPBOX_TOKEN') {
        alert('Mapbox token not configured!');
        return;
    }
    mapboxgl.accessToken = CONFIG.mapbox.accessToken;
    initMap();
    loadHole(1);
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
    });
}

function loadHole(holeNumber) {
    const course = getCourse(appState.currentCourseId);
    const hole = getHole(appState.currentCourseId, holeNumber);
    if (!hole) return;

    appState.currentHole = holeNumber;

    document.querySelector('.hole-number').textContent = 'HOLE ' + hole.holeNumber;
    document.querySelector('.hole-meta').textContent = 'PAR ' + hole.par + ' • ' + hole.yardage + ' YDS';

    if (appState.map && appState.map.isStyleLoaded()) {
        const features = [
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.tee }, properties: { type: 'tee' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.greenFront }, properties: { type: 'front' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.greenCenter }, properties: { type: 'center' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.greenBack }, properties: { type: 'back' } }
        ];
        appState.map.getSource('hole-data').setData({ type: 'FeatureCollection', features });

        const coords = [hole.tee, hole.greenFront, hole.greenCenter, hole.greenBack];
        const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));

        // Calculate bearing from tee to green center so hole points up the screen
        const bearing = calculateBearing(hole.tee, hole.greenCenter);

        appState.map.fitBounds(bounds, {
            padding: { top: 120, bottom: 220, left: 60, right: 60 },
            maxZoom: 19,
            duration: 300,
            bearing: bearing
        });
    }

    updateNavButtons(course.holes.length);
}

function calculateBearing(start, end) {
    // start and end are [lng, lat]
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

document.getElementById('prev-hole').addEventListener('click', () => {
    if (appState.currentHole > 1) loadHole(appState.currentHole - 1);
});

document.getElementById('next-hole').addEventListener('click', () => {
    const course = getCourse(appState.currentCourseId);
    if (appState.currentHole < course.holes.length) loadHole(appState.currentHole + 1);
});
