// Background script for Holodeck extension

// Animation state
let pulseInterval: ReturnType<typeof setInterval> | null = null
let isPulseState = false

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
        console.error("[Holodeck] Failed to update icon:", error)
    }
}

// Start pulsing animation for recording state
function startPulsingIcon() {
    console.log("[Holodeck] Starting icon pulse animation")
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
    console.log("[Holodeck] Stopping icon pulse animation")

    if (pulseInterval) {
        clearInterval(pulseInterval)
        pulseInterval = null
    }

    // Reset to default icon
    setIconWithPrefix("icon-default")
}

// Update badge with click count
async function updateBadge(count: number | null) {
    try {
        if (count === null) {
            // Clear badge when not recording
            await chrome.action.setBadgeText({ text: "" })
        } else {
            // Show click count (subtract 1 because first snapshot is "start", not a click)
            const clickCount = Math.max(0, count - 1)
            await chrome.action.setBadgeText({ text: clickCount.toString() })
            await chrome.action.setBadgeBackgroundColor({ color: "#ef4444" }) // Red background
            await chrome.action.setBadgeTextColor({ color: "#ffffff" }) // White text
        }
    } catch (error) {
        console.error("[Holodeck] Failed to update badge:", error)
    }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "RECORDING_STARTED") {
        startPulsingIcon()
        updateBadge(1) // Start with 0 clicks (1 snapshot is the "start")
        sendResponse({ success: true })
        return true
    }

    if (message.type === "RECORDING_STOPPED") {
        stopPulsingIcon()
        updateBadge(null) // Clear badge
        sendResponse({ success: true })
        return true
    }

    if (message.type === "CLICK_RECORDED") {
        updateBadge(message.snapshotCount)
        sendResponse({ success: true })
        return true
    }

    return false
})

console.log("[Holodeck] Background script loaded")
