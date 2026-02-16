import { useEffect, useState } from "react"
import "./popup.css"
import {
    isAuthenticated,
    openLoginPage,
    openEditorPage,
    uploadRecording,
    getPendingRecording,
    clearPendingRecording,
    type RecordingPayload,
} from "./api"

type RecordingState = "idle" | "recording" | "loading" | "countdown" | "uploading"
type AuthState = "checking" | "logged_out" | "logged_in"

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function IndexPopup() {
    const [authState, setAuthState] = useState<AuthState>("checking")
    const [state, setState] = useState<RecordingState>("loading")
    const [elapsedTime, setElapsedTime] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null)
    const [userName, setUserName] = useState<string | null>(null)
    const [pendingRecording, setPendingRecording] = useState<RecordingPayload | null>(null)

    // Check auth status on mount and listen for changes
    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = await isAuthenticated()
            setAuthState(authenticated ? "logged_in" : "logged_out")

            // Get user name from storage
            if (authenticated) {
                chrome.storage.local.get(["nexbit_user_name"], (result) => {
                    setUserName(result.nexbit_user_name || null)
                })
            } else {
                setUserName(null)
            }
        }

        checkAuth()

        // Listen for storage changes (e.g., from background script sync)
        const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
            if (changes["nexbit_stytch_session_jwt"] || changes["nexbit_user_name"]) {
                checkAuth()
            }
        }
        chrome.storage.onChanged.addListener(handleStorageChange)

        return () => {
            chrome.storage.onChanged.removeListener(handleStorageChange)
        }
    }, [])

    // Check recording status on mount
    useEffect(() => {
        if (authState !== "logged_in") return

        const checkStatus = async () => {
            try {
                chrome.runtime.sendMessage({ type: "GET_RECORDING_STATE" }, (response) => {
                    if (chrome.runtime.lastError) {
                        setState("idle")
                        return
                    }

                    if (response?.isRecording) {
                        setState("recording")
                        if (response.startTime) {
                            const elapsed = Math.floor((Date.now() - response.startTime) / 1000)
                            setElapsedTime(elapsed)
                            setRecordingStartTime(response.startTime)
                        }
                    } else {
                        setState("idle")
                    }
                })
            } catch (err) {
                console.error("Error checking status:", err)
                setState("idle")
            }
        }

        checkStatus()
    }, [authState])

    // Check for pending recording after successful auth
    useEffect(() => {
        if (authState !== "logged_in") return

        const checkPending = async () => {
            const pending = await getPendingRecording()
            if (pending) {
                setPendingRecording(pending)
                // Auto-retry upload
                setState("uploading")
                setError(null)
                try {
                    const result = await uploadRecording(pending)
                    await clearPendingRecording()
                    setPendingRecording(null)
                    openEditorPage(result.id)
                    window.close()
                } catch (uploadError: any) {
                    console.error("Retry upload failed:", uploadError)
                    const errorMessage = uploadError.message || "Failed to upload recording"
                    setError(errorMessage)

                    // Only keep in storage if it's an auth failure (recoverable after login)
                    const isAuthError = errorMessage.toLowerCase().includes("log in") ||
                        errorMessage.toLowerCase().includes("authenticated") ||
                        errorMessage.toLowerCase().includes("session expired")

                    if (!isAuthError) {
                        await clearPendingRecording()
                    }

                    setPendingRecording(null) // Clear React state so we don't loop
                    setState("idle")
                }
            }
        }

        checkPending()
    }, [authState])

    // Timer effect - uses real elapsed time calculation
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (state === "recording" && recordingStartTime) {
            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000)
                setElapsedTime(elapsed)
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [state, recordingStartTime])

    const handleLogin = () => {
        openLoginPage()
        // Close popup after opening login
        window.close()
    }


    const startRecording = async () => {
        setError(null)
        setSuccessMessage(null)
        setElapsedTime(0)

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            if (!tab?.id) {
                setError("No active tab found")
                return
            }

            // Check if it's a restricted page
            const restrictedPrefixes = ["chrome://", "about:", "https://chrome.google.com/webstore/", "chrome-extension://", "view-source:"]
            if (tab.url && restrictedPrefixes.some(prefix => tab.url?.startsWith(prefix))) {
                setError("Chrome pages are not allowed to record")
                return
            }

            // Show countdown overlay first
            chrome.tabs.sendMessage(tab.id, { type: "SHOW_COUNTDOWN" }, (response) => {
                if (chrome.runtime.lastError) {
                    setError("Failed to start. Reload the page and try again.")
                    console.error(chrome.runtime.lastError)
                    return
                }
                if (response?.success) {
                    setState("countdown")
                    // Close the popup to let user see the countdown
                    window.close()
                } else {
                    setError("Failed to show countdown")
                }
            })
        } catch (err) {
            setError("Error starting recording")
            console.error(err)
        }
    }

    const stopRecording = async () => {
        try {
            chrome.runtime.sendMessage({ type: "STOP_RECORDING_SESSION" }, async (response) => {
                if (chrome.runtime.lastError) {
                    setError("Failed to stop recording")
                    console.error(chrome.runtime.lastError)
                    return
                }

                if (response?.success && response?.recording) {
                    // Upload to backend instead of downloading
                    setState("uploading")
                    setError(null)

                    try {
                        const payload: RecordingPayload = {
                            name: `Recording ${new Date().toISOString()}`,
                            sourceUrl: response.recording.snapshots?.[0]?.url || "unknown",
                            duration: elapsedTime,
                            eventCount: response.recording.snapshots?.length || 0,
                            events: response.recording.snapshots,
                            metadata: {
                                extensionVersion: chrome.runtime.getManifest().version,
                                browserName: "Chrome",
                                screenWidth: window.screen.width,
                                screenHeight: window.screen.height,
                                recordingVersion: response.recording.version,
                                recordingStartTime: response.recording.startTime,
                            },
                        }

                        const result = await uploadRecording(payload)
                        openEditorPage(result.id)
                        window.close()
                    } catch (uploadError: any) {
                        console.error("Upload failed:", uploadError)
                        setError(uploadError.message || "Failed to upload recording")
                        if (uploadError.message?.includes("log in")) {
                            setAuthState("logged_out")
                        }
                        setState("idle")
                    }
                } else {
                    setError(response?.error || "Failed to stop recording")
                    setState("idle")
                }
            })
        } catch (err) {
            setError("Error stopping recording")
            console.error(err)
        }
    }

    const cancelRecording = async () => {
        try {
            chrome.runtime.sendMessage({ type: "CANCEL_RECORDING_SESSION" }, (response) => {
                if (chrome.runtime.lastError) {
                    setError("Failed to cancel recording")
                    console.error(chrome.runtime.lastError)
                    return
                }

                if (response?.success) {
                    setState("idle")
                    setElapsedTime(0)
                    setRecordingStartTime(null)
                } else {
                    setError(response?.error || "Failed to cancel recording")
                }
            })
        } catch (err) {
            setError("Error cancelling recording")
            console.error(err)
        }
    }

    // Auth checking state
    if (authState === "checking") {
        return (
            <div className="bg-cream p-4 font-sans">
                <div className="text-center mb-3">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Nexbit</h1>
                    <p className="text-xs text-gray-600">
                        {userName ? `Welcome back, ${userName}` : "Record your product interactions"}
                    </p>
                </div>
                <div className="bg-surface rounded-xl shadow-lg p-4">
                    <div className="text-center">
                        <div className="w-6 h-6 mx-auto mb-3 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Checking login status...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Logged out state - show login prompt
    if (authState === "logged_out") {
        return (
            <div className="bg-cream p-4 font-sans">
                <div className="text-center mb-3">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Nexbit</h1>
                    <p className="text-xs text-gray-600">
                        {userName ? `Welcome back, ${userName}` : "Record your product interactions"}
                    </p>
                </div>
                <div className="bg-surface rounded-xl shadow-lg p-4">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cream flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-800 mb-1">Login Required</h2>
                        <p className="text-xs text-gray-500 mb-3">
                            Please log in to save recordings to your account
                        </p>
                        <button
                            onClick={handleLogin}
                            className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                        >
                            Log in with Nexbit
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Loading state
    if (state === "loading") {
        return (
            <div className="bg-cream p-4 font-sans">
                <div className="text-center mb-3">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Nexbit</h1>
                    <p className="text-xs text-gray-600">
                        {userName ? `Welcome back, ${userName}` : "Record your product interactions"}
                    </p>
                </div>
                <div className="bg-surface rounded-xl shadow-lg p-4">
                    <div className="text-center">
                        <div className="w-6 h-6 mx-auto mb-3 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Checking status...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Uploading state
    if (state === "uploading") {
        return (
            <div className="bg-cream p-4 font-sans">
                <div className="text-center mb-3">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Nexbit</h1>
                    <p className="text-xs text-gray-600">
                        {userName ? `Welcome back, ${userName}` : "Record your product interactions"}
                    </p>
                </div>
                <div className="bg-surface rounded-xl shadow-lg p-4">
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-800 mb-1">Uploading...</h2>
                        <p className="text-xs text-gray-500">Saving your recording to the cloud</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-cream p-4 font-sans">
            {/* Header */}
            <div className="text-center mb-3 relative">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Nexbit</h1>
                <p className="text-xs text-gray-600">
                    {userName ? `Welcome back, ${userName}` : "Record your product interactions"}
                </p>

            </div>

            {/* Card */}
            <div className="bg-surface rounded-xl shadow-lg p-4">
                {state === "idle" ? (
                    /* Ready State */
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-cream flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-terracotta"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <circle cx="12" cy="12" r="4" fill="currentColor" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-gray-800 mb-1">Ready to Record</h2>
                        <p className="text-xs text-gray-500 mb-3">
                            Click start to begin capturing your session
                        </p>
                        <button
                            onClick={startRecording}
                            className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                        >
                            Start Recording
                        </button>
                    </div>
                ) : (
                    /* Recording State */
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                            <div className="w-5 h-5 bg-red-500 rounded-full" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-800 mb-1">Recording...</h2>
                        <div className="text-2xl font-mono font-bold text-terracotta mb-3">
                            {elapsedTime > 0 ? formatTime(elapsedTime) : "Preparing..."}
                        </div>
                        <button
                            onClick={stopRecording}
                            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                        >
                            Stop & Save
                        </button>
                        <button
                            onClick={cancelRecording}
                            className="w-full mt-2 bg-transparent hover:bg-red-50 text-red-500 border border-red-300 font-medium py-1.5 px-4 rounded-lg transition-all duration-200 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}

                {/* Success Message */}
                {successMessage && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-600">{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default IndexPopup
