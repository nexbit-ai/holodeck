import { useEffect, useState } from "react"
import "./popup.css"

type RecordingState = "idle" | "recording" | "loading"

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function IndexPopup() {
    const [state, setState] = useState<RecordingState>("loading")
    const [elapsedTime, setElapsedTime] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null)

    // Check recording status on mount
    useEffect(() => {
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
    }, [])

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

    const startRecording = async () => {
        setError(null)
        setElapsedTime(0)

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
            if (!tab?.id) {
                setError("No active tab found")
                return
            }

            // Send message to content script
            chrome.tabs.sendMessage(tab.id, { type: "START_RECORDING" }, (response) => {
                if (chrome.runtime.lastError) {
                    setError("Failed to start. Reload the page and try again.")
                    console.error(chrome.runtime.lastError)
                    return
                }
                if (response?.success) {
                    setState("recording")
                    setRecordingStartTime(response.startTime || Date.now())
                } else {
                    setError(response?.error || "Failed to start recording")
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

            chrome.tabs.sendMessage(tab.id, { type: "STOP_RECORDING" }, (response) => {
                if (chrome.runtime.lastError) {
                    setError("Failed to stop recording")
                    console.error(chrome.runtime.lastError)
                    return
                }

                if (response?.success && response?.recording) {
                    // Trigger download with timestamp filename
                    const blob = new Blob([JSON.stringify(response.recording, null, 2)], {
                        type: "application/json",
                    })
                    const url = URL.createObjectURL(blob)

                    // Generate timestamp filename: recording-2026-01-16T02-30-45.json
                    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
                    const filename = `holodeck-recordings/recording-${timestamp}.json`

                    chrome.downloads.download({
                        url: url,
                        filename: filename,
                        saveAs: false, // Auto-save without folder picker
                    })

                    setState("idle")
                    setElapsedTime(0)
                    setRecordingStartTime(null)
                } else {
                    setError(response?.error || "Failed to stop recording")
                }
            })
        } catch (err) {
            setError("Error stopping recording")
            console.error(err)
        }
    }

    // Loading state
    if (state === "loading") {
        return (
            <div className="bg-cream p-5 font-sans">
                <div className="text-center mb-5">
                    <h1 className="text-xl font-bold text-terracotta mb-1">Holodeck Builder</h1>
                    <p className="text-xs text-gray-600">Record your product interactions</p>
                </div>
                <div className="bg-surface rounded-xl shadow-lg p-5">
                    <div className="text-center">
                        <div className="w-8 h-8 mx-auto mb-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Checking status...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-cream p-5 font-sans">
            {/* Header */}
            <div className="text-center mb-5">
                <h1 className="text-xl font-bold text-terracotta mb-1">Demo Builder</h1>
                <p className="text-xs text-gray-600">Record your product interactions</p>
            </div>

            {/* Card */}
            <div className="bg-surface rounded-xl shadow-lg p-5">
                {state === "idle" ? (
                    /* Ready State */
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-terracotta"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <circle cx="12" cy="12" r="4" fill="currentColor" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-2">Ready to Record</h2>
                        <p className="text-xs text-gray-500 mb-4">
                            Click start to begin capturing your session
                        </p>
                        <button
                            onClick={startRecording}
                            className="w-full bg-terracotta hover:bg-terracotta/90 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Start Recording
                        </button>
                    </div>
                ) : (
                    /* Recording State */
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
                            <div className="w-6 h-6 bg-red-500 rounded-full" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">Recording...</h2>
                        <div className="text-3xl font-mono font-bold text-terracotta mb-4">
                            {formatTime(elapsedTime)}
                        </div>
                        <button
                            onClick={stopRecording}
                            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Stop & Save
                        </button>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 mt-4">
                Powered by Nexbit
            </p>
        </div>
    )
}

export default IndexPopup
