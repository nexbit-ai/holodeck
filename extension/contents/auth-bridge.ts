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
            console.log("[Nexbit Auth] Found Stytch session, sending to extension")
            sendResponse({
                success: true,
                sessionToken,
                sessionJwt,
                userName
            })
        } else {
            console.log("[Nexbit Auth] No Stytch session found")
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

// Also watch for cookie changes (for when user logs in)
// Poll periodically as there's no native cookie change event
let lastSessionJwt = getCookie(STYTCH_JWT_COOKIE)
setInterval(() => {
    const currentJwt = getCookie(STYTCH_JWT_COOKIE)
    const currentName = localStorage.getItem("nexbit_user_name")

    // Notify if either JWT or Name changes (e.g. login or logout)
    if (currentJwt !== lastSessionJwt || currentName !== localStorage.getItem("last_notified_name")) {
        console.log("[Nexbit Auth] Auth state changed in web app, notifying extension")
        lastSessionJwt = currentJwt
        localStorage.setItem("last_notified_name", currentName || "")
        notifyExtensionOfSession()
    }
}, 1000) // Check every second for better responsiveness
