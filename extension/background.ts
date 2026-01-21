// Background script for Nexbit extension

// Animation state
let pulseInterval: ReturnType<typeof setInterval> | null = null
let isPulseState = false

// Recording State Interface
interface InternalRecordingState {
    isRecording: boolean
    tabId: number | null
    startTime: number | null
    snapshots: any[]
    version: string
}

const STORAGE_KEY = "nexbit_recording_state"

// Initial state
async function getInitialState(): Promise<InternalRecordingState> {
    const data = await chrome.storage.local.get(STORAGE_KEY)
    return data[STORAGE_KEY] || {
        isRecording: false,
        tabId: null,
        startTime: null,
        snapshots: [],
        version: "2.0"
    }
}

// Save state
async function saveState(state: InternalRecordingState) {
    await chrome.storage.local.set({ [STORAGE_KEY]: state })
}

// Clear recording state
async function clearState() {
    await chrome.storage.local.remove(STORAGE_KEY)
}

// Clear all authentication data
async function clearAuthStorage() {
    console.log("[Nexbit] Clearing all auth data from storage")
    await chrome.storage.local.remove([
        "nexbit_auth_token",
        "nexbit_stytch_session_token",
        "nexbit_stytch_session_jwt",
        "nexbit_stytch_org_id",
        "nexbit_stytch_user_info",
        "nexbit_user_name"
    ])
}

// Set icon with specific prefix
async function setIconWithPrefix(prefix: string) {
    try {
        await chrome.action.setIcon({
            path: {
                "16": chrome.runtime.getURL(`assets/icons/${prefix}-16.png`),
                "32": chrome.runtime.getURL(`assets/icons/${prefix}-32.png`),
                "48": chrome.runtime.getURL(`assets/icons/${prefix}-48.png`),
                "128": chrome.runtime.getURL(`assets/icons/${prefix}-128.png`)
            }
        })
    } catch (error) {
        console.error("[Nexbit] Failed to update icon:", error)
    }
}

// Start pulsing animation for recording state
function startPulsingIcon() {
    console.log("[Nexbit] Starting icon pulse animation")

    // Clear any existing interval first to avoid multiple intervals
    if (pulseInterval) {
        clearInterval(pulseInterval)
        pulseInterval = null
    }

    isPulseState = false

    // Set initial recording icon
    setIconWithPrefix("icon-recording")

    // Toggle between two icons every 500ms for a pulse effect
    pulseInterval = setInterval(() => {
        isPulseState = !isPulseState
        const prefix = isPulseState ? "icon-recording-pulse" : "icon-recording"
        setIconWithPrefix(prefix)
    }, 500)
}

// Stop pulsing animation and reset to default
function stopPulsingIcon() {
    console.log("[Nexbit] Stopping icon pulse animation")

    if (pulseInterval) {
        clearInterval(pulseInterval)
        pulseInterval = null
    }

    // Reset pulse state
    isPulseState = false

    // Reset to default icon
    setIconWithPrefix("icon-default")
}

// Update badge with click count
async function updateBadge(count: number | null) {
    try {
        if (count === null || count === 0) {
            // Clear badge when not recording or no snapshots
            await chrome.action.setBadgeText({ text: "" })
        } else {
            // Show click count (subtract 1 because first snapshot is "start", not a click)
            const clickCount = Math.max(0, count - 1)
            await chrome.action.setBadgeText({ text: clickCount.toString() })
            await chrome.action.setBadgeBackgroundColor({ color: "#ef4444" }) // Red background
            await chrome.action.setBadgeTextColor({ color: "#ffffff" }) // White text
        }
    } catch (error) {
        console.error("[Nexbit] Failed to update badge:", error)
    }
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        if (message.type === "START_RECORDING_SESSION") {
            console.log("[Nexbit] Starting recording session", message)
            const state: InternalRecordingState = {
                isRecording: true,
                tabId: sender.tab?.id || message.tabId || null,
                startTime: message.startTime || Date.now(),
                snapshots: message.firstSnapshot ? [message.firstSnapshot] : [],
                version: "2.0"
            }
            await saveState(state)
            startPulsingIcon()
            updateBadge(state.snapshots.length)
            sendResponse({ success: true })
        }

        else if (message.type === "ADD_SNAPSHOT") {
            const state = await getInitialState()
            if (state.isRecording) {
                state.snapshots.push(message.snapshot)
                await saveState(state)
                updateBadge(state.snapshots.length)
                console.log(`[Nexbit] Snapshot added. Total: ${state.snapshots.length}`)
            }
            sendResponse({ success: true })
        }

        else if (message.type === "GET_RECORDING_STATE") {
            const state = await getInitialState()
            sendResponse(state)
        }

        else if (message.type === "STOP_RECORDING_SESSION") {
            console.log("[Nexbit] Stopping recording session")
            const state = await getInitialState()
            await clearState()
            stopPulsingIcon()
            updateBadge(null)

            if (state.isRecording) {
                sendResponse({
                    success: true,
                    recording: {
                        version: state.version,
                        startTime: state.startTime,
                        snapshots: state.snapshots
                    }
                })
            } else {
                sendResponse({ success: false, error: "No active recording" })
            }
        }

        else if (message.type === "CANCEL_RECORDING_SESSION") {
            console.log("[Nexbit] Cancelling recording session")
            await clearState()
            stopPulsingIcon()
            updateBadge(null)
            sendResponse({ success: true })
        }

        // Handle auth session detected from web app
        else if (message.type === "AUTH_SESSION_DETECTED") {
            console.log("[Nexbit] Received AUTH_SESSION_DETECTED from web app")
            if (message.sessionJwt) {
                // Store the session in chrome.storage.local
                await chrome.storage.local.set({
                    "nexbit_stytch_session_token": message.sessionToken || "",
                    "nexbit_stytch_session_jwt": message.sessionJwt,
                    "nexbit_user_name": message.userName || null
                })
                console.log("[Nexbit] Auth session synced from web app")
            }
            sendResponse({ success: true })
        }

        // Handle auth session cleared from web app (logout)
        else if (message.type === "AUTH_SESSION_CLEARED") {
            console.log("[Nexbit] Received AUTH_SESSION_CLEARED from web app")
            await clearAuthStorage()
            sendResponse({ success: true })
        }

        // Backward compatibility / UI updates
        else if (message.type === "RECORDING_STARTED") {
            startPulsingIcon()
            sendResponse({ success: true })
        }
        else if (message.type === "RECORDING_STOPPED") {
            stopPulsingIcon()
            updateBadge(null)
            sendResponse({ success: true })
        }
        else if (message.type === "CLICK_RECORDED") {
            updateBadge(message.snapshotCount)
            sendResponse({ success: true })
        }
    })()

    return true // Keep channel open for async response
})

// Recover icon state on background script load (e.g. extension wakeup)
getInitialState().then(state => {
    if (state.isRecording) {
        startPulsingIcon()
        updateBadge(state.snapshots.length)
    }
})

// Listen for cookie changes to detect logout reliably
chrome.cookies.onChanged.addListener(async (changeInfo) => {
    const { cookie, removed } = changeInfo

    // Check for Stytch session cookies
    if (cookie.name === "stytch_session_jwt" || cookie.name === "stytch_session") {
        const domain = cookie.domain.toLowerCase()
        const isLocalhost = domain.includes("localhost") || domain.includes("127.0.0.1") || domain === ""
        const isNexbitDomain = domain.endsWith(".nexbit.ai") || domain.endsWith(".nexbit.io")

        if (isLocalhost || isNexbitDomain) {
            if (removed) {
                console.log(`[Nexbit] Cookie ${cookie.name} removed, triggering logout sync`)
                await clearAuthStorage()
            } else {
                console.log(`[Nexbit] Cookie ${cookie.name} updated/added`)
                // Note: We don't automatically sync here because we need the name from localStorage
                // The auth-bridge content script will handle the login sync
            }
        }
    }
})

console.log("[Nexbit] Background script loaded")
