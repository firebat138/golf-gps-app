# Golf GPS + Scoring App

A mobile-first golf GPS and scoring application.

**Current Status:** PHASE 1 - Basic Mapbox satellite map with hole navigation

---

## Quick Start

### 1. Get a Mapbox Access Token

1. Go to https://account.mapbox.com
2. Sign up for a free account (if you don't have one)
3. Navigate to **Tokens** (https://account.mapbox.com/tokens/)
4. Click **Create a token**
5. Give it a name like "Golf GPS App"
6. Make sure these scopes are enabled:
   - `styles:read`
   - `fonts:read`
   - `datasets:read`
   - `maps:read`
7. Click **Create token**
8. Copy the token (it starts with `pk.`)

### 2. Configure Your Token

1. In the `js/` directory, create a new file called `config.js`
2. Copy the contents of `js/config.example.js` into `config.js`
3. Replace `YOUR_MAPBOX_TOKEN` with your actual token:

```javascript
const CONFIG = {
    mapbox: {
        accessToken: 'pk.YOUR_ACTUAL_TOKEN_HERE'
    },
    map: {
        initialZoom: 15,
        initialCenter: [-87.6298, 41.8819]
    }
};
```

**IMPORTANT:** 
- Never commit `js/config.js` to GitHub
- Add it to `.gitignore`:
  ```
  js/config.js
  ```

### 3. Run Locally

#### Using Python (Built-in)
```bash
# Python 3.x
python -m http.server 8000

# Python 2.x
python -m SimpleHTTPServer 8000
```

#### Using Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run from project directory
http-server
```

#### Using Live Server (VS Code)
- Install the "Live Server" extension by Ritwick Dey
- Right-click `index.html` → "Open with Live Server"

### 4. Open in Browser

Open your browser and go to:
```
http://localhost:8000
```

### 5. Verify It's Working

You should see:

1. **Mapbox satellite map** - Aerial view of the test course
2. **Hole information** - Top left shows "HOLE 1" with "PAR 4 • 386 YDS"
3. **Green markers** - Small circles on the map:
   - Red/orange circle = TEE
   - Green circles = FRONT, CENTER, BACK of green
4. **Distance display** - Shows "FRONT", "CENTER", "BACK" (values currently show "--" until GPS is added)
5. **Navigation buttons** - "← HOLE" and "HOLE →" at bottom
6. **GPS status** - Top right shows "GPS ± -- yd" (will work in STEP 2)

### 6. Test Navigation

- Click "HOLE →" to move to hole 2 (should show "HOLE 2, PAR 3, 165 YDS")
- Map and markers should update
- Click "← HOLE" to go back
- Verify the green markers move with each hole

---

## File Structure

```
golf-gps-app/
├── index.html              # Main HTML structure
├── css/
│   └── styles.css         # Mobile-first styling
├── js/
│   ├── app.js             # Main application logic
│   ├── config.js          # ← CREATE THIS (your token goes here)
│   └── config.example.js  # Template (reference only)
├── data/
│   └── courses.js         # Course and hole data
└── README.md              # This file
```

---

## Editing Course Coordinates

To change the test course coordinates:

1. Open `data/courses.js`
2. Find the hole you want to edit
3. Update the coordinates:
   ```javascript
   tee: [-87.6298, 41.8819],              // [longitude, latitude]
   greenFront: [-87.6285, 41.8825],
   greenCenter: [-87.6280, 41.8828],
   greenBack: [-87.6275, 41.8830]
   ```
4. Save the file
5. Refresh your browser - coordinates update immediately

**Format:** Coordinates are `[longitude, latitude]` (note the order!)

**Finding Coordinates:**
- Google Maps: Right-click on a location → copy coordinates
- Mapbox Studio: Hover over location in satellite view
- iPhone: Open Maps, tap location, see coordinates

---

## Mobile Testing

### Test on Your iPhone

1. Make sure your computer and iPhone are on the **same WiFi network**
2. Find your computer's local IP:
   - **Mac:** System Preferences → Network → IP address
   - **Windows:** Command Prompt → `ipconfig` → "IPv4 Address"
   - Example: `192.168.1.100`
3. On iPhone, open Safari and go to:
   ```
   http://192.168.1.100:8000
   ```
4. Add to Home Screen for full-screen app:
   - Tap Share icon
   - Scroll down → "Add to Home Screen"

### Test Portrait Mode
- Rotate iPhone to portrait
- Interface should adapt (it's designed for portrait)

### Test Zoom and Pan
- Pinch to zoom in/out
- Drag to pan around
- Tap the marker labels to test interaction

---

## Deployment to Netlify

### Setup

1. Create a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Create `.gitignore` file in project root:
   ```
   js/config.js
   node_modules/
   .DS_Store
   ```

3. Push to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/golf-gps-app.git
   git push -u origin main
   ```

### Deploy to Netlify

1. Go to https://netlify.com
2. Log in with GitHub
3. Click "New site from Git"
4. Select your repository
5. Configure build:
   - **Build command:** (leave empty)
   - **Publish directory:** `.` (current directory)
6. Set environment variables:
   - Click "Advanced" → "New variable"
   - Key: `MAPBOX_TOKEN`
   - Value: Your Mapbox token
7. Click "Deploy site"

### Update Config for Netlify

In `js/app.js`, before line `mapboxgl.accessToken = CONFIG.mapbox.accessToken;`, add:

```javascript
// For Netlify deployments, allow environment variable override
if (typeof process !== 'undefined' && process.env.MAPBOX_TOKEN) {
    CONFIG.mapbox.accessToken = process.env.MAPBOX_TOKEN;
}
```

Or better: Use a build script to generate `config.js` from the environment variable.

---

## Troubleshooting

### Map doesn't appear / shows blank

1. **Check browser console** (F12 or Cmd+Option+J)
2. Look for red error messages
3. Verify `config.js` exists and has a valid token
4. Try clearing browser cache (Cmd+Shift+R or Ctrl+Shift+R)

### Coordinates seem wrong

1. Verify you're using `[longitude, latitude]` order (not lat/lon)
2. Check numbers aren't accidentally reversed
3. Use Google Maps to verify coordinates are correct

### GPS not showing up

- GPS is implemented in STEP 2
- For now, "GPS ± -- yd" is expected

### Page loads but no map appears

1. Check network tab in Developer Tools
2. Look for failed requests to `api.mapbox.com`
3. Verify token is valid: https://account.mapbox.com/tokens/
4. Check console for error messages

---

## Architecture Notes

This project is designed to scale. Future phases will add:

- User authentication
- Multiple courses
- GPS tracking
- Shot tracking
- Scoring for up to 4 players
- Scorecard generation
- PWA/offline support
- Native mobile apps

The data model and architecture are built to accommodate these features without major refactoring.

---

## PHASE 1 Checklist

- [x] Project structure created
- [x] Mapbox satellite map working
- [x] Hole data loaded from `courses.js`
- [x] Navigation between holes
- [x] Mobile-first CSS styling
- [x] Green markers displayed
- [ ] **NEXT:** STEP 2 - Add live GPS tracking

---

## Next Steps (STEP 2)

Once STEP 1 is verified working:

1. Add `navigator.geolocation.watchPosition()`
2. Display player position on map
3. Calculate live distances to front/center/back
4. Display distances in yards with accuracy indicator
5. Add animation for smooth position updates

---

## Support & Questions

See the main prompt document for detailed requirements and architecture decisions.

For technical issues:
1. Check browser console for errors (F12)
2. Verify `.gitignore` doesn't exclude needed files
3. Make sure Mapbox token is valid and scopes are enabled

---

**Built with:**
- Vanilla JavaScript (no frameworks)
- Mapbox GL JS
- HTML5 Geolocation API
- Modern CSS (custom properties, grid, flexbox)

**Target:** Mobile-first, iPhone optimized
