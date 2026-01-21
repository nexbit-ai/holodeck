// Content script that runs on the Nexbit web app (localhost:3000 / production domain)
// This script reads the Stytch session JWT cookie and sends it to the extension

import type { PlasmoCSConfig } from "plasmo"

// This content script runs on the Nexbit web app URLs
export const config: PlasmoCSConfig = {
    matches: [
        "http://localhost:3000/*",
        "https://*.nexbit.ai/*",
        "https://*.nexbit.io/*"
    ],
    run_at: "document_idle"
}

// Cookie names used by Stytch (from StytchProvider.tsx)
const STYTCH_SESSION_COOKIE = "stytch_session"
const STYTCH_JWT_COOKIE = "stytch_session_jwt"

// Get cookie value by name
function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null
    }
    return null
}

// Listen for messages from the extension popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_AUTH_SESSION") {
        const sessionToken = getCookie(STYTCH_SESSION_COOKIE)
        const sessionJwt = getCookie(STYTCH_JWT_COOKIE)
        const userName = localStorage.getItem("nexbit_user_name")

        if (sessionJwt) {
            sendResponse({
                success: true,
                sessionToken,
                sessionJwt,
                userName
            })
        } else {
            sendResponse({
                success: false,
                error: "No session found"
            })
        }
        return true // Keep message channel open for async response
    }
})

// Also notify the extension when the page loads or session changes
// This helps sync auth state when user logs in/out via the web app
function notifyExtensionOfSession() {
    const sessionJwt = getCookie(STYTCH_JWT_COOKIE)
    const sessionToken = getCookie(STYTCH_SESSION_COOKIE)
    const userName = localStorage.getItem("nexbit_user_name")

    if (sessionJwt) {
        chrome.runtime.sendMessage({
            type: "AUTH_SESSION_DETECTED",
            sessionToken,
            sessionJwt,
            userName
        }).catch(() => {
            // Extension might not be listening, that's fine
        })
    } else {
        // Notify extension that session is cleared
        chrome.runtime.sendMessage({
            type: "AUTH_SESSION_CLEARED"
        }).catch(() => {
            // Extension might not be listening
        })
    }
}

// Notify on page load
notifyExtensionOfSession()

// Also watch for auth state changes (for when user logs in or out)
// We use MutationObserver and events instead of polling to save CPU/battery
let lastSessionJwt = getCookie(STYTCH_JWT_COOKIE)

function syncIfChanged() {
    const currentJwt = getCookie(STYTCH_JWT_COOKIE)

    if (currentJwt !== lastSessionJwt) {
        lastSessionJwt = currentJwt
        notifyExtensionOfSession()
    }
}

// 1. Watch for localStorage changes from other tabs
window.addEventListener("storage", (event) => {
    if (event.key === "nexbit_user_name") {
        syncIfChanged()
    }
})

// 2. Watch for DOM changes which typically accompany login/logout in SPAs
// Use a small debounce to avoid redundant checks during heavy DOM updates
let mutationTimeout: ReturnType<typeof setTimeout>
const observer = new MutationObserver(() => {
    clearTimeout(mutationTimeout)
    mutationTimeout = setTimeout(syncIfChanged, 500)
})

observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true
})

// 3. Check when user returns to the tab to ensure state is fresh
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        syncIfChanged()
    }
})
