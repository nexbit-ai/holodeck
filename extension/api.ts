// API service for recording uploads

const API_URL = process.env.PLASMO_PUBLIC_API_URL || "https://api.nexbit.io"
const APP_URL = process.env.PLASMO_PUBLIC_APP_URL || "http://localhost:3000"
const DEV_TOKEN = process.env.PLASMO_PUBLIC_DEV_TOKEN || ""
// Fallback JWT from environment (for extension-only flow)
const STYTCH_SESSION_JWT = process.env.PLASMO_PUBLIC_STYTCH_SESSION_JWT || ""

// Storage keys for auth
const AUTH_TOKEN_KEY = "nexbit_auth_token"
const AUTH_SESSION_TOKEN_KEY = "nexbit_stytch_session_token"
const AUTH_SESSION_JWT_KEY = "nexbit_stytch_session_jwt"
const AUTH_ORG_ID_KEY = "nexbit_stytch_org_id"
const AUTH_USER_INFO_KEY = "nexbit_stytch_user_info"
const AUTH_USER_NAME_KEY = "nexbit_user_name"

export interface RecordingPayload {
    name: string
    sourceUrl: string
    duration: number
    eventCount: number
    events: any[]
    metadata?: {
        browserName?: string
        browserVersion?: string
        extensionVersion?: string
        screenWidth?: number
        screenHeight?: number
        // Include original recording metadata
        recordingVersion?: string
        recordingStartTime?: number
    }
}

export interface RecordingResponse {
    id: string
    name: string
    organizationId: string
    sourceUrl: string
    duration: number
    eventCount: number
    createdAt: string
    createdBy: string
}

export interface UserInfo {
    id: string
    email: string
    name: string | null
    organizationId: string
    organizationName: string
}

/**
 * Get auth token from chrome storage
 * Falls back to dev token if set in env
 * @deprecated Use getStytchSessionJWT() instead for Stytch authentication
 */
export async function getAuthToken(): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.storage.local.get([AUTH_SESSION_TOKEN_KEY, AUTH_TOKEN_KEY], (result) => {
            const token = result[AUTH_SESSION_TOKEN_KEY] || result[AUTH_TOKEN_KEY]
            resolve(token || null)
        })
    })
}

/**
 * Get Stytch session JWT from chrome storage
 * Falls back to environment variable if set (for extension-only flow)
 * This is the preferred method for Stytch authentication
 */
export async function getStytchSessionJWT(): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.storage.local.get([AUTH_SESSION_JWT_KEY], (result) => {
            const jwt = result[AUTH_SESSION_JWT_KEY]
            if (jwt) {
                resolve(jwt)
            } else {
                // Fallback to environment variable if set
                resolve(STYTCH_SESSION_JWT || null)
            }
        })
    })
}

/**
 * Get authorization headers with Stytch session JWT
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
    const sessionJWT = await getStytchSessionJWT()
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    }

    if (sessionJWT) {
        headers["Authorization"] = `Bearer ${sessionJWT}`
    }

    return headers
}

/**
 * Save auth data to chrome storage
 */
export async function setAuthData(data: {
    sessionToken: string
    sessionJwt: string
    organizationId: string
    userName?: string | null
    member?: any
}): Promise<void> {
    const userInfo: UserInfo | null = data.member ? {
        id: data.member.member_id,
        email: data.member.email_address,
        name: data.userName || data.member.name || null,
        organizationId: data.organizationId,
        organizationName: data.member.organization_name || ""
    } : null

    return new Promise((resolve) => {
        chrome.storage.local.set({
            [AUTH_SESSION_TOKEN_KEY]: data.sessionToken,
            [AUTH_SESSION_JWT_KEY]: data.sessionJwt,
            [AUTH_ORG_ID_KEY]: data.organizationId,
            [AUTH_USER_INFO_KEY]: userInfo,
            [AUTH_USER_NAME_KEY]: data.userName || null
        }, () => {
            resolve()
        })
    })
}

/**
 * Remove all auth data from chrome storage
 */
export async function removeAuthToken(): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.remove([
            AUTH_TOKEN_KEY,
            AUTH_SESSION_TOKEN_KEY,
            AUTH_SESSION_JWT_KEY,
            AUTH_ORG_ID_KEY,
            AUTH_USER_INFO_KEY,
            AUTH_USER_NAME_KEY
        ], () => {
            resolve()
        })
    })
}

/**
 * Try to sync auth session from the Nexbit web app
 * This queries the auth-bridge content script on any open Nexbit tabs
 */
export async function syncAuthFromWebApp(): Promise<boolean> {
    return new Promise((resolve) => {
        // Try to find an open Nexbit tab and ask for the session
        const appHost = new URL(APP_URL).host

        chrome.tabs.query({
            url: [
                `${APP_URL}/*`,
                "https://*.nexbit.ai/*",
                "https://*.nexbit.io/*"
            ]
        }, (holodeskTabs) => {

            if (holodeskTabs.length === 0) {
                console.log("[Nexbit Auth] No Nexbit tabs found to sync from")
                resolve(false)
                return
            }

            // Try to get auth from the first Nexbit tab
            const tabId = holodeskTabs[0].id
            if (!tabId) {
                resolve(false)
                return
            }

            chrome.tabs.sendMessage(tabId, { type: "GET_AUTH_SESSION" }, async (response) => {
                if (chrome.runtime.lastError) {
                    console.log("[Nexbit Auth] Failed to get session from tab:", chrome.runtime.lastError)
                    resolve(false)
                    return
                }

                if (response?.success && response.sessionJwt) {
                    console.log("[Nexbit Auth] Got session from web app, storing...")
                    await setAuthData({
                        sessionToken: response.sessionToken || "",
                        sessionJwt: response.sessionJwt,
                        organizationId: "", // Will be extracted from JWT if needed
                        userName: response.userName
                    })
                    resolve(true)
                } else {
                    console.log("[Nexbit Auth] No valid session in web app, clearing extension session")
                    await removeAuthToken()
                    resolve(false)
                }
            })
        })
    })
}

/**
 * Check if user is authenticated
 * First checks local storage, then tries to sync from web app if not found
 */
export async function isAuthenticated(): Promise<boolean> {
    // First check if we have a token stored locally
    const token = await getAuthToken()
    if (token) {
        return true
    }

    // If no local token, we are not authenticated. 
    // The background script handles syncing when the web app is active.
    return false
}

/**
 * Open login page in new tab
 */
export function openLoginPage(): void {
    chrome.tabs.create({ url: `${APP_URL}/login?source=extension` })
}

/**
 * Get current user info from backend
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
    const headers = await getAuthHeaders()
    if (!headers["Authorization"]) {
        return null
    }

    try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
            method: "GET",
            headers,
        })

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired, clear it
                await removeAuthToken()
            }
            return null
        }

        return await response.json()
    } catch (error) {
        console.error("Failed to get user info:", error)
        return null
    }
}

/**
 * Upload recording to backend
 */
export async function uploadRecording(
    payload: RecordingPayload
): Promise<RecordingResponse> {
    const headers = await getAuthHeaders()
    if (!headers["Authorization"]) {
        throw new Error("Not authenticated")
    }

    console.log("[Nexbit Debug] Uploading recording to:", `${API_URL}/api/v1/recordings`)
    console.log("[Nexbit Debug] Payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(`${API_URL}/api/v1/recordings`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        if (response.status === 401) {
            await removeAuthToken()
            throw new Error("Session expired. Please log in again.")
        }
        if (response.status === 413) {
            throw new Error("Recording too large. Please record a shorter session.")
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error?.message || `Upload failed: ${response.status}`)
    }

    return await response.json()
}

/**
 * Get API URLs for external use
 */
export function getApiUrl(): string {
    return API_URL
}

export function getAppUrl(): string {
    return APP_URL
}

/**
 * Open editor page for a recording in new tab
 */
export function openEditorPage(recordingId: string): void {
    chrome.tabs.create({ url: `${APP_URL}/editor/${recordingId}` })
}
