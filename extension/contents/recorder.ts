import type { PlasmoCSConfig } from "plasmo"
import { record } from "rrweb"
import type { eventWithTime } from "@rrweb/types"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
    run_at: "document_idle"
}

// Store for recorded events
let events: eventWithTime[] = []
let stopFn: (() => void) | null = null
let isRecording = false
let recordingStartTime: number | null = null

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_RECORDING") {
        if (isRecording) {
            sendResponse({ success: false, error: "Already recording" })
            return true
        }

        try {
            // Clear previous events
            events = []
            isRecording = true
            recordingStartTime = Date.now()

            // Start rrweb recording
            stopFn = record({
                emit(event) {
                    events.push(event)
                },
                // Record all mutations, mouse movements, scroll, etc.
                checkoutEveryNms: 10000, // Checkout every 10 seconds for better performance
                blockClass: "rr-block",
                ignoreClass: "rr-ignore",
                maskTextClass: "rr-mask",
                maskAllInputs: false,
                maskInputOptions: {
                    password: true,
                },
            })

            console.log("[Holodeck] Recording started")
            sendResponse({ success: true, startTime: recordingStartTime })
        } catch (error) {
            console.error("[Holodeck] Failed to start recording:", error)
            isRecording = false
            recordingStartTime = null
            sendResponse({ success: false, error: String(error) })
        }

        return true
    }

    if (message.type === "STOP_RECORDING") {
        if (!isRecording) {
            sendResponse({ success: false, error: "Not recording" })
            return true
        }

        try {
            // Stop the recorder
            if (stopFn) {
                stopFn()
                stopFn = null
            }

            isRecording = false
            const capturedEvents = [...events]
            console.log(`[Holodeck] Recording stopped. Captured ${capturedEvents.length} events.`)

            // Clear state
            events = []
            recordingStartTime = null

            // Send events back to popup
            sendResponse({ success: true, events: capturedEvents })
        } catch (error) {
            console.error("[Holodeck] Failed to stop recording:", error)
            sendResponse({ success: false, error: String(error) })
        }

        return true
    }

    if (message.type === "GET_STATUS") {
        sendResponse({
            isRecording,
            eventCount: events.length,
            startTime: recordingStartTime
        })
        return true
    }

    return false
})

console.log("[Holodeck] Content script loaded and ready")
