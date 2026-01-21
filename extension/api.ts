// API service for recording uploads

const API_URL = process.env.PLASMO_PUBLIC_API_URL || "https://api.nexbit.io"
const LOGIN_URL = process.env.PLASMO_PUBLIC_LOGIN_URL || "http://localhost:3000/login"
const APP_URL = process.env.PLASMO_PUBLIC_APP_URL || "http://localhost:3000"
const DEV_TOKEN = process.env.PLASMO_PUBLIC_DEV_TOKEN || ""

// Storage key for auth token
const AUTH_TOKEN_KEY = "nexbit_auth_token"

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
    organizationId: string
    organizationName: string
}

/**
 * Get auth token from chrome storage
 * Falls back to dev token if set in env
 */
export async function getAuthToken(): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.storage.local.get([AUTH_TOKEN_KEY], (result) => {
            const token = result[AUTH_TOKEN_KEY]
            if (token) {
                resolve(token)
            } else if (DEV_TOKEN) {
                // Use dev token for testing
                resolve(DEV_TOKEN)
            } else {
                resolve(null)
            }
        })
    })
}

/**
 * Save auth token to chrome storage
 */
export async function setAuthToken(token: string): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [AUTH_TOKEN_KEY]: token }, () => {
            resolve()
        })
    })
}

/**
 * Remove auth token from chrome storage
 */
export async function removeAuthToken(): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.remove([AUTH_TOKEN_KEY], () => {
            resolve()
        })
    })
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
    const token = await getAuthToken()
    return !!token
}

/**
 * Open login page in new tab
 */
export function openLoginPage(): void {
    chrome.tabs.create({ url: `${LOGIN_URL}?source=extension` })
}

/**
 * Get current user info from backend
 */
export async function getCurrentUser(): Promise<UserInfo | null> {
    const token = await getAuthToken()
    if (!token) return null

    try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
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
    const token = await getAuthToken()
    if (!token) {
        throw new Error("Not authenticated")
    }

    console.log("[Holodeck Debug] Uploading recording to:", `${API_URL}/api/v1/recordings`)
    console.log("[Holodeck Debug] Payload:", JSON.stringify(payload, null, 2))

    const response = await fetch(`${API_URL}/api/v1/recordings`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
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

export function getLoginUrl(): string {
    return LOGIN_URL
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
