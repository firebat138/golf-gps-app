/**
 * GOLF GPS APP - MAIN APPLICATION
 * 
 * Player setup, scoring, and course play
 */

// ===== STATE =====
let appState = {
    currentCourseId: 'test-course',
    currentHole: 1,
    map: null,
    geoSource: null,
    gameStarted: false,
    players: ['', '', '', ''],
    scores: [[], [], [], []],
    activePlayerIndex: 0
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    console.log('Initializing Golf GPS App...');

    // Validate config
    if (!CONFIG.mapbox.accessToken || CONFIG.mapbox.accessToken === 'YOUR_MAPBOX_TOKEN') {
        showFatalError('Mapbox token not configured. See README for setup instructions.');
        return;
    }

    // Set Mapbox token
    mapboxgl.accessToken = CONFIG.mapbox.accessToken;

    // Load saved state
    loadGameState();

    // Setup screens
    if (appState.gameStarted) {
        showGameScreen();
        initMap();
        loadHole(appState.currentHole);
    } else {
        showSetupScreen();
    }

    setupEventListeners();

    console.log('✓ Golf GPS App initialized');
}

// ===== SETUP SCREEN =====
function showSetupScreen() {
    document.getElementById('setup-screen').style.display = 'flex';
    document.getElementById('game-screen').style.display = 'none';
}

function showGameScreen() {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
}

function startGame() {    console.log('START GAME clicked!');
    const p1 = document.getElementById('player-1-name').value.trim();
    const p2 = document.getElementById('player-2-name').value.trim();
    const p3 = document.getElementById('player-3-name').value.trim();
    const p4 = document.getElementById('player-4-name').value.trim();
                          console.log('Players:', p1, p2, p3, p4);

    if (!p1) {
        alert('Player 1 name required');
        return;
    }

    appState.players = [p1, p2, p3, p4];
    appState.gameStarted = true;
    appState.currentHole = 1;
    appState.scores = [[], [], [], []];

    // Initialize scores to par for all holes
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
}

// ===== MAP INITIALIZATION =====
function initMap() {
    if (appState.map) return; // Already initialized
    
    const course = getCourse(appState.currentCourseId);
    const initialHole = course.holes[0];

    appState.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/satellite-v9',
        center: initialHole.tee,
        zoom: CONFIG.map.initialZoom,
        pitch: 0,
        bearing: 0,
        antialias: true
    });

    // Add source for hole markers
    appState.map.on('load', () => {
        // Add GeoJSON source for markers
        appState.map.addSource('hole-data', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: []
            }
        });

        // Add layer for tee marker
        appState.map.addLayer({
            id: 'tee-marker',
            type: 'circle',
            source: 'hole-data',
            filter: ['==', ['get', 'type'], 'tee'],
            paint: {
                'circle-radius': 6,
                'circle-color': '#ff6b3d',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff',
                'circle-opacity': 0.9
            }
        });

        // Add layer for green markers
        appState.map.addLayer({
            id: 'green-markers',
            type: 'circle',
            source: 'hole-data',
            filter: ['in', ['get', 'type'], ['literal', ['front', 'center', 'back']]],
            paint: {
                'circle-radius': [
                    'case',
                    ['==', ['get', 'type'], 'center'],
                    8,
                    6
                ],
                'circle-color': [
                    'case',
                    ['==', ['get', 'type'], 'center'],
                    '#00d97e',
                    '#00a85c'
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff',
                'circle-opacity': 0.85
            }
        });

        // Add labels
        appState.map.addLayer({
            id: 'green-labels',
            type: 'symbol',
            source: 'hole-data',
            filter: ['in', ['get', 'type'], ['literal', ['front', 'center', 'back']]],
            layout: {
                'text-field': ['get', 'label'],
                'text-size': 11,
                'text-offset': [0, 1.5],
                'text-anchor': 'top',
                'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold']
            },
            paint: {
                'text-color': '#fff',
                'text-halo-color': '#000',
                'text-halo-width': 1
            }
        });

        console.log('✓ Mapbox layers added');
    });

    // Handle map load errors
    appState.map.on('error', (e) => {
        console.error('Map error:', e);
    });
}

// ===== LOAD HOLE =====
function loadHole(holeNumber) {
    const course = getCourse(appState.currentCourseId);
    const hole = getHole(appState.currentCourseId, holeNumber);

    if (!hole) {
        console.error(`Hole ${holeNumber} not found`);
        return;
    }

    appState.currentHole = holeNumber;
    saveGameState();

    // Update header
    updateHeader(hole);

    // Update map with hole data
    if (appState.map && appState.map.isStyleLoaded()) {
        updateMapWithHole(hole);
    }

    // Update player cards
    if (appState.gameStarted) {
        renderPlayerCards();
    }

    // Update navigation buttons
    updateNavigationButtons(course.holes.length);

    console.log(`✓ Loaded hole ${holeNumber}`);
}

// ===== UPDATE HEADER =====
function updateHeader(hole) {
    const headerNumber = document.querySelector('.hole-number');
    const headerMeta = document.querySelector('.hole-meta');

    headerNumber.textContent = `HOLE ${hole.holeNumber}`;
    headerMeta.textContent = `PAR ${hole.par} • ${hole.yardage} YDS`;
}

// ===== UPDATE MAP WITH HOLE DATA =====
function updateMapWithHole(hole) {
    // Create GeoJSON features for this hole
    const features = [
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: hole.tee
            },
            properties: {
                type: 'tee',
                label: 'TEE'
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: hole.greenFront
            },
            properties: {
                type: 'front',
                label: 'FRONT'
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: hole.greenCenter
            },
            properties: {
                type: 'center',
                label: 'CENTER'
            }
        },
        {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: hole.greenBack
            },
            properties: {
                type: 'back',
                label: 'BACK'
            }
        }
    ];

    // Update GeoJSON source
    appState.map.getSource('hole-data').setData({
        type: 'FeatureCollection',
        features: features
    });

    // Fit map to hole bounds
    fitMapToHole(hole);
}

// ===== FIT MAP TO HOLE =====
function fitMapToHole(hole) {
    // Calculate bounds that include all hole markers
    const coordinates = [
        hole.tee,
        hole.greenFront,
        hole.greenCenter,
        hole.greenBack
    ];

    const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    // Fit with padding for mobile
    appState.map.fitBounds(bounds, {
        padding: { top: 100, bottom: 200, left: 20, right: 20 },
        maxZoom: 18,
        duration: 300
    });
}

// ===== UPDATE NAVIGATION BUTTONS =====
function updateNavigationButtons(totalHoles) {
    const prevBtn = document.getElementById('prev-hole');
    const nextBtn = document.getElementById('next-hole');

    prevBtn.disabled = appState.currentHole === 1;
    nextBtn.disabled = appState.currentHole === totalHoles;

    // Update button text to show current/next/prev
    prevBtn.textContent = `← HOLE ${appState.currentHole - 1}`;
    nextBtn.textContent = `HOLE ${appState.currentHole + 1} →`;
}

// ===== PLAYER CARDS =====
function renderPlayerCards() {
    const container = document.getElementById('players-container');
    container.innerHTML = '';

    const course = getCourse(appState.currentCourseId);
    const currentHole = course.holes[appState.currentHole - 1];

    for (let i = 0; i < 4; i++) {
        if (!appState.players[i]) continue;

        const card = document.createElement('div');
        card.className = `player-card player-${i + 1}`;
        
        const score = appState.scores[i][appState.currentHole - 1] || currentHole.par;
        const parDiff = score - currentHole.par;
        let scoreDisplay = score.toString();
        
        if (parDiff > 0) {
            scoreDisplay += ` (+${parDiff})`;
        } else if (parDiff < 0) {
            scoreDisplay += ` (${parDiff})`;
        }

        card.innerHTML = `
            <div class="player-name">${appState.players[i]}</div>
            <div class="player-score">${score}</div>
            <div class="player-score-buttons">
                <button class="score-btn minus" data-player="${i}">−</button>
                <button class="score-btn plus" data-player="${i}">+</button>
            </div>
            <div class="player-meta">vs Par ${currentHole.par}</div>
        `;

        container.appendChild(card);
    }

    // Attach click handlers
    document.querySelectorAll('.score-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const playerIdx = parseInt(e.target.dataset.player);
            const direction = e.target.classList.contains('plus') ? 1 : -1;
            updateScore(playerIdx, direction);
        });
    });
}

function updateScore(playerIdx, direction) {
    const holeIdx = appState.currentHole - 1;
    appState.scores[playerIdx][holeIdx] = (appState.scores[playerIdx][holeIdx] || 0) + direction;
    saveGameState();
    renderPlayerCards();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Setup screen
    document.getElementById('start-game-btn').addEventListener('click', startGame);

    // Game controls
    document.getElementById('prev-hole').addEventListener('click', () => {
        if (appState.currentHole > 1) {
            loadHole(appState.currentHole - 1);
        }
    });

    document.getElementById('next-hole').addEventListener('click', () => {
        const course = getCourse(appState.currentCourseId);
        if (appState.currentHole < course.holes.length) {
            loadHole(appState.currentHole + 1);
        }
    });

    document.getElementById('menu-btn').addEventListener('click', () => {
        if (confirm('End this round?')) {
            appState.gameStarted = false;
            saveGameState();
            location.reload();
        }
    });
}

// ===== GAME STATE PERSISTENCE =====
const STORAGE_KEY = 'golf_gps_game_state';

function saveGameState() {
    try {
        const state = {
            gameStarted: appState.gameStarted,
            currentCourseId: appState.currentCourseId,
            currentHole: appState.currentHole,
            players: appState.players,
            scores: appState.scores
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Error saving game state:', e);
    }
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
    } catch (e) {
        console.error('Error loading game state:', e);
    }
}

// ===== ERROR HANDLING =====
function showFatalError(message) {
    console.error('FATAL ERROR:', message);
    const container = document.getElementById('game-screen') || document.body;
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        padding: 20px;
        text-align: center;
        background-color: var(--color-bg);
        color: var(--color-text-primary);
    `;
    errorDiv.innerHTML = `
        <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">⚠ Configuration Error</div>
        <div style="font-size: 14px; color: var(--color-text-secondary); line-height: 1.6;">
            ${message}
        </div>
        <a href="README.md" style="
            margin-top: 20px;
            padding: 10px 20px;
            background-color: var(--color-accent);
            color: var(--color-bg);
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
        ">View Setup Instructions</a>
    `;
    container.innerHTML = '';
    container.appendChild(errorDiv);
}
