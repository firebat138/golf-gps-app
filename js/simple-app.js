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
        appState.map.fitBounds(bounds, { padding: 150, maxZoom: 19, duration: 300 });
    }

    updateNavButtons(course.holes.length);
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
