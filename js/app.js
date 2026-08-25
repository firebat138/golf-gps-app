/**
 * GOLF GPS APP - MAIN APPLICATION
 * Player setup, scoring, and course play
 */

// STATE
let appState = {
    currentCourseId: 'test-course',
    currentHole: 1,
    map: null,
    gameStarted: false,
    players: ['', '', '', ''],
    scores: [[], [], [], []]
};

const STORAGE_KEY = 'golf_gps_game_state';

// INIT
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    if (!CONFIG.mapbox.accessToken || CONFIG.mapbox.accessToken === 'YOUR_MAPBOX_TOKEN') {
        alert('Mapbox token not configured!');
        return;
    }
    mapboxgl.accessToken = CONFIG.mapbox.accessToken;
    loadGameState();
    if (appState.gameStarted) {
        showGameScreen();
        initMap();
        loadHole(appState.currentHole);
        renderPlayerCards();
    } else {
        showSetupScreen();
    }
}

// SCREENS
function showSetupScreen() {
    document.getElementById('setup-screen').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'none';
}

function showGameScreen() {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
}

// START GAME
function startGame() {
    const p1 = document.getElementById('player-1-name').value.trim();
    if (!p1) {
        alert('Player 1 name required');
        return;
    }
    
    appState.players = [
        p1,
        document.getElementById('player-2-name').value.trim(),
        document.getElementById('player-3-name').value.trim(),
        document.getElementById('player-4-name').value.trim()
    ];
    appState.gameStarted = true;
    appState.currentHole = 1;
    appState.scores = [[], [], [], []];

    const course = getCourse(appState.currentCourseId);
    for (let i = 0; i < course.holes.length; i++) {
        for (let j = 0; j < 4; j++) {
            if (appState.players[j]) {
                appState.scores[j].push(course.holes[i].par);
            }
        }
    }

    saveGameState();
    showGameScreen();
    initMap();
    loadHole(appState.currentHole);
    renderPlayerCards();
    
    setupNavButtons();
}

// MAP
function initMap() {
    if (appState.map) return;
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

// HOLES
function loadHole(holeNumber) {
    const course = getCourse(appState.currentCourseId);
    const hole = getHole(appState.currentCourseId, holeNumber);
    if (!hole) return;

    appState.currentHole = holeNumber;
    saveGameState();

    document.querySelector('.hole-number').textContent = 'HOLE ' + hole.holeNumber;
    document.querySelector('.hole-meta').textContent = 'PAR ' + hole.par + ' • ' + hole.yardage + ' YDS';

    if (appState.map && appState.map.isStyleLoaded()) {
        const features = [
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.tee }, properties: { type: 'tee', label: 'TEE' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.greenFront }, properties: { type: 'front', label: 'FRONT' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.greenCenter }, properties: { type: 'center', label: 'CENTER' } },
            { type: 'Feature', geometry: { type: 'Point', coordinates: hole.greenBack }, properties: { type: 'back', label: 'BACK' } }
        ];
        appState.map.getSource('hole-data').setData({ type: 'FeatureCollection', features });

        const coords = [hole.tee, hole.greenFront, hole.greenCenter, hole.greenBack];
        const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
        appState.map.fitBounds(bounds, { padding: 150, maxZoom: 19, duration: 300 });
    }

    renderPlayerCards();
    updateNavButtons(course.holes.length);
}

// PLAYERS
function renderPlayerCards() {
    const container = document.getElementById('players-container');
    container.innerHTML = '';
    
    const course = getCourse(appState.currentCourseId);
    const hole = course.holes[appState.currentHole - 1];

    for (let i = 0; i < 4; i++) {
        if (!appState.players[i]) continue;

        const card = document.createElement('div');
        card.className = 'player-card player-' + (i + 1);
        const score = appState.scores[i][appState.currentHole - 1] || hole.par;
        
        card.innerHTML = '<div class="player-name">' + appState.players[i] + '</div><div class="player-score">' + score + '</div><div class="player-score-buttons"><button class="score-btn minus" onclick="updateScore(' + i + ', -1)">−</button><button class="score-btn plus" onclick="updateScore(' + i + ', 1)">+</button></div><div class="player-meta">vs Par ' + hole.par + '</div>';
        container.appendChild(card);
    }
}

function updateScore(playerIdx, direction) {
    const holeIdx = appState.currentHole - 1;
    appState.scores[playerIdx][holeIdx] = (appState.scores[playerIdx][holeIdx] || 0) + direction;
    saveGameState();
    renderPlayerCards();
}

// NAV
function setupNavButtons() {
    const course = getCourse(appState.currentCourseId);
    
    document.getElementById('prev-hole').addEventListener('click', function() {
        if (appState.currentHole > 1) loadHole(appState.currentHole - 1);
    });

    document.getElementById('next-hole').addEventListener('click', function() {
        if (appState.currentHole < course.holes.length) loadHole(appState.currentHole + 1);
    });

    document.getElementById('menu-btn').addEventListener('click', function() {
        if (confirm('End round?')) {
            appState.gameStarted = false;
            saveGameState();
            location.reload();
        }
    });
}

function updateNavButtons(totalHoles) {
    const prevBtn = document.getElementById('prev-hole');
    const nextBtn = document.getElementById('next-hole');
    prevBtn.disabled = appState.currentHole === 1;
    nextBtn.disabled = appState.currentHole === totalHoles;
}

// STORAGE
function saveGameState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            gameStarted: appState.gameStarted,
            currentCourseId: appState.currentCourseId,
            currentHole: appState.currentHole,
            players: appState.players,
            scores: appState.scores
        }));
    } catch (e) {}
}

function loadGameState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const state = JSON.parse(saved);
            appState.gameStarted = state.gameStarted || false;
            appState.currentCourseId = state.currentCourseId || 'test-course';
            appState.currentHole = state.currentHole || 1;
            appState.players = state.players || ['', '', '', ''];
            appState.scores = state.scores || [[], [], [], []];
        }
    } catch (e) {}
}
