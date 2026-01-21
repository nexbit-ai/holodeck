# Nexbit Demo Builder - Chrome Extension

A Chrome extension that records DOM interactions using rrweb for playback in Nexbit.

## Development

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file in the extension directory (optional, for extension-only flow):

```bash
# API Configuration
PLASMO_PUBLIC_API_URL=https://api.nexbit.io
PLASMO_PUBLIC_APP_URL=http://localhost:3000

# Stytch Session JWT (optional - for extension-only flow)
# If not set, extension will sync auth from web app via cookies
PLASMO_PUBLIC_STYTCH_SESSION_JWT=your_stytch_session_jwt_here

# Legacy dev token (deprecated - use Stytch JWT instead)
PLASMO_PUBLIC_DEV_TOKEN=
```

**Note:** The extension primarily syncs authentication from the web app via cookies. The `PLASMO_PUBLIC_STYTCH_SESSION_JWT` environment variable is only used as a fallback for extension-only flows where the web app is not available.

### Run in development mode

```bash
npm run dev
```

This will build the extension and start watching for changes.

### Load the extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `build/chrome-mv3-dev` folder inside this directory

## Usage

1. Navigate to any website you want to record
2. Click the Nexbit Demo Builder extension icon
3. Click **Start Recording**
4. Interact with the page (click, scroll, type, etc.)
5. Click **Stop & Save**
6. A `recording.json` file will be downloaded

## Verifying Recordings

### Option 1: Online rrweb Player

1. Visit the [rrweb demo page](https://www.rrweb.io/demo)
2. This provides an interactive demo of rrweb capabilities

### Option 2: Local HTML Player

Create a local HTML file to replay your recording:

```html
<!DOCTYPE html>
<html>
<head>
  <title>rrweb Player</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css" />
  <style>
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: #f5eedc;
    }
    .rr-player {
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    }
  </style>
</head>
<body>
  <div id="player"></div>
  
  <script src="https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js"></script>
  <script>
    // Load your recording.json file
    fetch('recording.json')
      .then(res => res.json())
      .then(events => {
        new rrwebPlayer({
          target: document.getElementById('player'),
          props: {
            events,
            showController: true,
            autoPlay: false,
          },
        });
      });
  </script>
</body>
</html>
```

Save this as `player.html` in the same directory as your `recording.json`, then:

```bash
# Start a local server (from the directory with player.html and recording.json)
npx serve .
```

Open `http://localhost:3000/player.html` in your browser.

### Option 3: Node.js Script

You can also validate the JSON structure programmatically:

```javascript
const fs = require('fs');
const events = JSON.parse(fs.readFileSync('recording.json', 'utf8'));

console.log(`Total events: ${events.length}`);
console.log(`Event types:`, [...new Set(events.map(e => e.type))]);
console.log(`First event:`, events[0]);
console.log(`Last event:`, events[events.length - 1]);
```

## Production Build

```bash
npm run build
```

The production build will be in `build/chrome-mv3-prod`.

## Package for Distribution

```bash
npm run package
```

This creates a `.zip` file ready for the Chrome Web Store.
