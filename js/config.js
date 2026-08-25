/**
 * CONFIGURATION - YOUR MAPBOX TOKEN GOES HERE
 * 
 * 1. Get a free Mapbox token from: https://account.mapbox.com
 * 2. Replace 'YOUR_MAPBOX_TOKEN' with your actual token
 * 3. Token should start with 'pk.'
 * 4. Keep this file secret - never commit to GitHub
 */

const CONFIG = {
    mapbox: {
        accessToken: 'pk.eyJ1IjoiZmlyZWJhdDEzOCIsImEiOiJjbXQ2NWJqM3Mwd2phMzJvbTIzazZubGlqIn0.-Aa4ln9NEIn0rxuQgFj9lQ'
    },

    map: {
        initialZoom: 15,
        initialCenter: [-87.6298, 41.8819] // Default: Chicago area
    }
};

// Validation message
if (CONFIG.mapbox.accessToken === 'YOUR_MAPBOX_TOKEN') {
    console.warn('⚠️  Mapbox token not configured yet. See README.md for setup instructions.');
}
