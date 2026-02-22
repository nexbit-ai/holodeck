# Nexbit Chrome Extension: Architectural Overview

This document describes the roles, responsibilities, and system flows of the Nexbit Chrome Extension located in the `/extension` directory.

## Core Components

The extension is built using [Plasmo](https://www.plasmo.com/) and is divided into four main architectural layers:

### 1. Popup UI (`popup.tsx`)
**Role:** The primary user interface for controlling the extension.
- **Responsibilities:**
    - Handles user authentication display (Login/Logout).
    - Provides controls to **Start**, **Stop**, and **Cancel** recordings.
    - Displays real-time recording status (duration, click count).
    - Triggers the upload process to the backend.
    - Opens the Nexbit Editor after a successful upload.

### 2. Background Script (`background.ts`)
**Role:** The central state orchestrator and long-running process.
- **Responsibilities:**
    - Maintains the "Source of Truth" for the current recording session.
    - Persists session data (`chrome.storage.local`) across page reloads and tab changes.
    - Manages browser-level UI changes (pulsing the extension icon during recording, updating the badge count).
    - Acts as a message broker between the Popup and Content Scripts.
    - Handles authentication storage and session syncing.

### 3. Recorder Content Script (`contents/recorder.ts`)
**Role:** The engine that captures user interactions within the web page.
- **Responsibilities:**
    - Injected into every page the user visits.
    - Listens for user interactions (primarily `click` events).
    - **DOM Snapshotting:** Clones the current DOM, inlines CSS styles (to ensure visual fidelity in the editor), and captures viewport/scroll data.
    - Communicates captured snapshots to the Background Script.
    - Restores recording state if the page is refreshed during a session.

### 4. Auth Bridge Content Script (`contents/auth-bridge.ts`)
**Role:** Synchronizes authentication between the Nexbit Web App and the Extension.
- **Responsibilities:**
    - Runs only on `*.nexbit.ai` and `localhost:3000`.
    - Monitors Stytch authentication cookies and `localStorage`.
    - Automatically pushes new login sessions to the extension's background script.
    - Ensures that logging out of the web app also clears the extension's session.

---

## Technical Flows

### 1. Authentication Sync Flow
1. User logs into the **Nexbit Web App**.
2. `auth-bridge.ts` detects the `stytch_session_jwt` cookie.
3. `auth-bridge.ts` sends an `AUTH_SESSION_DETECTED` message to `background.ts`.
4. `background.ts` stores the JWT in `chrome.storage.local`.
5. The **Popup** becomes "Authenticated" and allows recording.

### 2. Recording Flow (Standard Session)
1. **Trigger:** User opens the Popup and clicks **Start Recording**.
2. **Setup:** Popup sends `START_RECORDING` to the active tab's `recorder.ts`.
3. **Countdown:** A countdown overlay is displayed (if configured).
4. **Initialization:** Upon countdown completion:
    - `recorder.ts` captures an initial "START" snapshot of the page.
    - Sends `START_RECORDING_SESSION` to `background.ts`.
    - `background.ts` starts pulsing the extension icon and sets the badge to `0`.
5. **Steady State:**
    - User clicks an element.
    - `recorder.ts` clones the element's DOM tree, inlines all computed styles, and packages it with coordinates.
    - Sends `ADD_SNAPSHOT` to `background.ts`.
    - `background.ts` updates storage and increments the badge count.
6. **Completion:** User clicks **Stop Recording** in the Popup.
    - Popup requests the full recording data from `background.ts` via `STOP_RECORDING_SESSION`.
    - `background.ts` clears it local state and stops the icon pulse.
7. **Upload:** `api.ts` (called by Popup) sends the full payload to `POST /api/v1/recordings`.
8. **Navigation:** Upon success, the Extension opens a new tab directed to the Nexbit Editor for that specific recording.

---

## How to Use the Extension (Developer Context)

### Installation
1. Ensure you are in the `/extension` directory.
2. Run `npm install`.
3. Build/Run in dev mode: `npm run dev` (This uses Plasmo to build the extension into a `build/chrome-mv3-dev` folder).
4. Load the extension in Chrome: `Settings > Extensions > Load Unpacked > Select the build folder`.

### Key API Types (`api.ts`)
- `RecordingPayload`: The structure sent to the backend, containing browser metadata and an array of `snapshots`.
- `ClickSnapshot`: Contains the HTML string of the capture, `clickX/clickY`, `scrollX/scrollY`, and `timestamp`.

### Development Tips
- **Debugging:** You can inspect the Background Script by clicking "service worker" in the Chrome Extensions manager. Inspect the Popup by right-clicking it while it's open and selecting "Inspect".
- **Styles:** The extension uses Tailwind CSS for the Popup and custom overlays.
- **Plasmo:** The project relies on Plasmo's framework for manifest generation and content script injection. Config is found in the header of content script files.
