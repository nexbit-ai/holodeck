# Holodeck Architecture (Frontend MVP Phase)

## 1. Goal
Build a visual prototype of the Holodeck platform to demonstrate the workflow to investors/customers. No real backend functionality is required yet; use mock data and local state.

## 2. Scope of Views
1.  **The Builder (Mock Extension):**
    - A screen simulating the Chrome Extension sidebar.
    - User clicks "Start Recording" -> Show a fake "Recording..." indicator overlay.
    - User clicks "Stop" -> Transitions to the Dashboard.
2.  **The Dashboard:**
    - A clean analytics view showing mock data (Views, Engagement, Hotspots).
    - A "Campaigns" list where they can copy the "Demo Link."
3.  **The Viewer (Public View):**
    - **Left Split:** An iframe or container simulating the recorded product (use a placeholder image or dummy HTML).
    - **Right Split:** The Chat Interface.
    - **Interaction:** Hardcode 3-4 "Happy Paths." If user clicks/asks X, the Chat answers Y and the Left Split updates to show a specific image/state.

## 3. Tech Stack
- **Framework:** Next.js 14+ (App Router).
- **Styling:** Tailwind CSS (configured with the colors in DESIGN_SYSTEM.md) + shadcn/ui.
- **Icons:** Lucide React.
- **State:** React Context or Zustand (for passing mock data between screens).
