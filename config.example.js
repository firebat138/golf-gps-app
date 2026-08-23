/**
 * CONFIGURATION
 * 
 * This file is a TEMPLATE. To get started:
 * 
 * 1. Create a file named "config.js" in this same directory (js/)
 * 2. Copy the contents of this file into config.js
 * 3. Replace YOUR_MAPBOX_TOKEN with your actual Mapbox public access token
 * 4. Add config.js to .gitignore (do NOT commit tokens to GitHub)
 * 
 * For production deployment (Netlify):
 * - Set MAPBOX_TOKEN as an environment variable in your Netlify dashboard
 * - The config.js file can be generated at build time or stored securely
 */

const CONFIG = {
    // Mapbox public access token
    // Get this from: https://account.mapbox.com/auth/signin/
    mapbox: {
        accessToken: 'YOUR_MAPBOX_TOKEN'
    },

    // Default map center (will be overridden by course data)
    map: {
        initialZoom: 15,
        initialCenter: [-87.6298, 41.8819] // Chicago, IL
    }
};

// Validate config
if (CONFIG.mapbox.accessToken === 'YOUR_MAPBOX_TOKEN') {
    console.error('ERROR: Mapbox token not configured. See js/config.example.js for instructions.');
}
