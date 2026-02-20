// Auth bridge content script
// Runs on Nexbit web app pages to sync authentication state to the extension

import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: [
        "http://localhost:3000/*",
        "https://*.nexbit.ai/*"
    ],
    run_at: "document_idle"
}

const JWT_COOKIE_NAME = "stytch_session_jwt"

/**
 * Read JWT from cookies
 */
function getJwtFromCookies(): string | null {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
        const [name, ...rest] = cookie.trim().split('=')
        if (name === JWT_COOKIE_NAME && rest.length > 0) {
            return decodeURIComponent(rest.join('='))
        }
    }
    return null
}

/**
 * Get user name from the page if available
 */
function getUserName(): string | null {
    // Try to get from localStorage if Stytch stores it there
    try {
        const stytchData = localStorage.getItem('stytch-sdk-member-session')
        if (stytchData) {
            const parsed = JSON.parse(stytchData)
            return parsed?.member?.name || parsed?.member?.email_address || null
        }
    } catch {
        // Ignore parse errors
    }
    return null
}

/**
 * Sync auth state to extension
 */
function syncAuthToExtension() {
    const jwt = getJwtFromCookies()

    if (jwt) {
        // User is logged in, send session to extension
        chrome.runtime.sendMessage({
            type: "AUTH_SESSION_DETECTED",
            sessionJwt: jwt,
            sessionToken: "", // Not needed for JWT auth
            userName: getUserName()
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.debug("[Nexbit Auth Bridge] Could not sync auth:", chrome.runtime.lastError.message)
            } else {
                console.debug("[Nexbit Auth Bridge] Auth synced to extension")
            }
        })
    } else {
        // User is logged out, clear extension session
        chrome.runtime.sendMessage({
            type: "AUTH_SESSION_CLEARED"
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.debug("[Nexbit Auth Bridge] Could not clear auth:", chrome.runtime.lastError.message)
            }
        })
    }
}

// Sync on initial page load
syncAuthToExtension()

// Re-sync periodically to catch login/logout events
setInterval(syncAuthToExtension, 5000)

// Also sync when visibility changes (user comes back to tab)
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        syncAuthToExtension()
    }
})

// Listen for explicit sync requests from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "GET_AUTH_SESSION") {
        const jwt = getJwtFromCookies()
        sendResponse({
            success: !!jwt,
            sessionJwt: jwt,
            sessionToken: "",
            userName: getUserName()
        })
        return true
    }
    return false
})
