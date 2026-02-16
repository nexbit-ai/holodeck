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

// In-memory cache for the active recording to prevent race conditions
let activeState: InternalRecordingState | null = null

// Initial state
async function getInitialState(): Promise<InternalRecordingState> {
    if (activeState) {
        // Return a copy to prevent mutation of the cached reference
        return {
            ...activeState,
            snapshots: [...activeState.snapshots]
        }
    }

    const data = await chrome.storage.local.get(STORAGE_KEY)
    const state = data[STORAGE_KEY] || {
        isRecording: false,
        tabId: null,
        startTime: null,
        snapshots: [],
        version: "2.0"
    }

    if (state.isRecording) {
        activeState = state
    }

    // Return a copy even when freshly loaded
    return {
        ...state,
        snapshots: [...state.snapshots]
    }
}

// Save state
async function saveState(state: InternalRecordingState) {
    if (state.isRecording) {
        activeState = state
    } else {
        activeState = null
    }
    await chrome.storage.local.set({ [STORAGE_KEY]: state })
}

// Clear recording state
async function clearState() {
    activeState = null
    await chrome.storage.local.remove(STORAGE_KEY)
}

// Queue for state updates to prevent race conditions
let updateQueue: Promise<void> = Promise.resolve()

async function queueUpdate(task: () => Promise<void>) {
    updateQueue = updateQueue.then(async () => {
        try {
            await task()
        } catch (error) {
            console.error("[Nexbit] Error during queued update:", error)
        }
    })
    return updateQueue
}

// Clear all authentication data
async function clearAuthStorage() {
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
        try {
            if (message.type === "START_RECORDING_SESSION") {
                await queueUpdate(async () => {
                    const newState = {
                        isRecording: true,
                        tabId: sender.tab?.id || message.tabId || null,
                        startTime: message.startTime || Date.now(),
                        snapshots: message.firstSnapshot ? [message.firstSnapshot] : [],
                        version: "2.0"
                    }
                    await saveState(newState)
                    startPulsingIcon()
                    // Always initialize badge to 0 at start (even if snapshots are empty)
                    updateBadge(newState.snapshots.length)
                    sendResponse({ success: true })
                })
            }

            else if (message.type === "ADD_SNAPSHOT") {
                await queueUpdate(async () => {
                    const state = await getInitialState()
                    if (state.isRecording) {
                        const updatedState = {
                            ...state,
                            snapshots: [...state.snapshots, message.snapshot]
                        }
                        await saveState(updatedState)
                        updateBadge(updatedState.snapshots.length)
                    }
                    sendResponse({ success: true })
                })
            }

            else if (message.type === "GET_RECORDING_STATE") {
                const state = await getInitialState()
                sendResponse(state)
            }

            else if (message.type === "STOP_RECORDING_SESSION") {
                await queueUpdate(async () => {
                    const state = await getInitialState()
                    const finalRecording = state.isRecording ? {
                        version: state.version,
                        startTime: state.startTime,
                        snapshots: [...state.snapshots] // Copy to be safe
                    } : null

                    await clearState()
                    stopPulsingIcon()
                    updateBadge(null)

                    if (finalRecording) {
                        sendResponse({
                            success: true,
                            recording: finalRecording
                        })
                    } else {
                        sendResponse({ success: false, error: "No active recording" })
                    }
                })
            }

            else if (message.type === "CANCEL_RECORDING_SESSION") {
                await clearState()
                stopPulsingIcon()
                updateBadge(null)
                sendResponse({ success: true })
            }

            // Handle auth session detected from web app
            else if (message.type === "AUTH_SESSION_DETECTED") {
                if (message.sessionJwt) {
                    // Store the session in chrome.storage.local
                    await chrome.storage.local.set({
                        "nexbit_stytch_session_token": message.sessionToken || "",
                        "nexbit_stytch_session_jwt": message.sessionJwt,
                        "nexbit_user_name": message.userName || null
                    })
                }
                sendResponse({ success: true })
            }

            // Handle auth session cleared from web app (logout)
            else if (message.type === "AUTH_SESSION_CLEARED") {
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
                const state = await getInitialState()
                if (state.isRecording) {
                    // Optimistically update badge count (snapshots.length + 1 because this click isn't in state yet)
                    updateBadge(state.snapshots.length + 1)
                }
                sendResponse({ success: true })
            }
            else {
                // Return success for unknown messages to avoid hanging senders
                sendResponse({ success: false, error: "Unknown message type" })
            }
        } catch (error) {
            console.error(`[Nexbit] Error handling message ${message.type}:`, error)
            sendResponse({ success: false, error: error instanceof Error ? error.message : "Internal error" })
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
