import { useEffect, useState } from "react"
import "./popup.css"
import {
    getAuthToken,
    isAuthenticated,
    openLoginPage,
    openEditorPage,
    uploadRecording,
    removeAuthToken,
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

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            const authenticated = await isAuthenticated()
            setAuthState(authenticated ? "logged_in" : "logged_out")
        }
        checkAuth()
    }, [])

    // Check recording status on mount
    useEffect(() => {
        if (authState !== "logged_in") return

        const checkStatus = async () => {
            try {
                const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
                if (!tab?.id) {
                    setState("idle")
                    return
                }

                chrome.tabs.sendMessage(tab.id, { type: "GET_STATUS" }, (response) => {
                    if (chrome.runtime.lastError) {
                        // Content script not loaded yet
                        setState("idle")
                        return
                    }

                    if (response?.isRecording) {
                        setState("recording")
                        // Calculate elapsed time from stored start time
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

    const handleLogout = async () => {
        await removeAuthToken()
        setAuthState("logged_out")
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
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            if (!tab?.id) return

            chrome.tabs.sendMessage(tab.id, { type: "STOP_RECORDING" }, async (response) => {
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
                            sourceUrl: tab.url || "unknown",
                            duration: elapsedTime,
                            eventCount: response.recording.length,
                            events: response.recording,
                            metadata: {
                                extensionVersion: chrome.runtime.getManifest().version,
                                browserName: "Chrome",
                                screenWidth: window.screen.width,
                                screenHeight: window.screen.height,
                            },
                        }

                        const result = await uploadRecording(payload)

                        // Open editor for the new recording
                        openEditorPage(result.id)

                        // Close popup after opening editor
                        window.close()
                    } catch (uploadError: any) {
                        console.error("Upload failed:", uploadError)
                        setError(uploadError.message || "Failed to upload recording")

                        // If auth error, update auth state
                        if (uploadError.message?.includes("log in")) {
                            setAuthState("logged_out")
                        }

                        setState("idle")
                    }
                } else {
                    setError(response?.error || "Failed to stop recording")
                }
            })
        } catch (err) {
            setError("Error stopping recording")
            console.error(err)
        }
    }

    const cancelRecording = async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            if (!tab?.id) return

            chrome.tabs.sendMessage(tab.id, { type: "CANCEL_RECORDING" }, (response) => {
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
                    <img src="assets/logo.jpg" alt="Nexbit" className="h-6 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Record your product interactions</p>
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
                    <img src="assets/logo.jpg" alt="Nexbit" className="h-6 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Record your product interactions</p>
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
                    <img src="assets/logo.jpg" alt="Nexbit" className="h-6 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Record your product interactions</p>
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
                    <img src="assets/logo.jpg" alt="Nexbit" className="h-6 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">Record your product interactions</p>
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
            {/* Header with logout */}
            <div className="text-center mb-3 relative">
                <img src="assets/logo.jpg" alt="Nexbit" className="h-6 mx-auto mb-1" />
                <p className="text-xs text-gray-600">Record your product interactions</p>
                <button
                    onClick={handleLogout}
                    className="absolute top-0 right-0 text-xs text-gray-400 hover:text-gray-600"
                    title="Log out"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                </button>
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
                            {formatTime(elapsedTime)}
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
