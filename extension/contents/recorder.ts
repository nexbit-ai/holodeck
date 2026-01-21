import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
    run_at: "document_idle"
}

export enum EventType {
    START = 0,
    CLICK = 1,
    RESIZE = 2,
    SCROLL = 3,
    META = 4,
    COVER = 5,
    END = 6,
}

// Click snapshot data structure
export interface ClickSnapshot {
    type: EventType | "start" | "click"
    timestamp: number
    html: string
    clickX?: number
    clickY?: number
    scrollX: number
    scrollY: number
    url: string
    viewportWidth: number
    viewportHeight: number
}

export interface ClickRecording {
    version: "2.0"
    startTime: number
    snapshots: ClickSnapshot[]
}

// State
let recording: ClickRecording | null = null
let isRecording = false
let recordingStartTime: number | null = null

// Capture all computed styles for an element
function getComputedStylesCSS(element: Element): string {
    const computedStyle = window.getComputedStyle(element)
    let cssText = ''
    for (let i = 0; i < computedStyle.length; i++) {
        const prop = computedStyle[i]
        cssText += `${prop}:${computedStyle.getPropertyValue(prop)};`
    }
    return cssText
}

// Inline all styles for the document by mapping cloned elements to live elements
function inlineAllStyles(liveRoot: Element, clonedRoot: Element): void {
    const liveElements = liveRoot.querySelectorAll('*')
    const clonedElements = clonedRoot.querySelectorAll('*')

    // Ensure we have the same number of elements
    const count = Math.min(liveElements.length, clonedElements.length)

    for (let i = 0; i < count; i++) {
        const liveEl = liveElements[i] as HTMLElement
        const clonedEl = clonedElements[i] as HTMLElement

        // Skip if elements don't match tags (sanity check)
        if (liveEl.tagName !== clonedEl.tagName) continue

        const computedStyles = window.getComputedStyle(liveEl)

        // Capture styles that are critical for layout and appearance, especially for icons
        // We include specific dimensions and SVG properties
        const stylesToCopy = [
            'display', 'position', 'top', 'left', 'right', 'bottom',
            'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
            'margin', 'padding', 'border', 'border-radius',
            'background', 'background-color', 'background-image',
            'color', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align',
            'flex', 'flex-direction', 'justify-content', 'align-items', 'gap',
            'grid', 'grid-template-columns', 'grid-template-rows',
            'box-shadow', 'opacity', 'visibility', 'z-index', 'overflow',
            'transform', 'transition',
            // critical for SVG icons
            'fill', 'stroke', 'stroke-width', 'vertical-align'
        ]

        stylesToCopy.forEach(prop => {
            const value = computedStyles.getPropertyValue(prop)
            if (value && value !== '' && value !== 'none' && value !== 'normal' && value !== 'auto') {
                clonedEl.style.setProperty(prop, value)
            }
        })
    }
}

// Generate a simple selector for an element
function getElementSelector(el: Element): string {
    if (el.id) return `#${el.id}`

    const path: string[] = []
    let current: Element | null = el

    while (current && current !== document.body && path.length < 5) {
        let selector = current.tagName.toLowerCase()
        if (current.className && typeof current.className === 'string') {
            const classes = current.className.trim().split(/\s+/).slice(0, 2).join('.')
            if (classes) selector += `.${classes}`
        }
        path.unshift(selector)
        current = current.parentElement
    }

    return path.join(' > ')
}

// Capture all stylesheets as inline styles
function captureStylesheets(): string {
    let allCSS = ''
    let accessedCount = 0
    let skippedCount = 0

    // Capture all stylesheet rules
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i]
            if (sheet.cssRules) {
                for (let j = 0; j < sheet.cssRules.length; j++) {
                    allCSS += sheet.cssRules[j].cssText + '\n'
                }
                accessedCount++
            }
        } catch (e) {
            // Cross-origin stylesheets can't be accessed
            skippedCount++
        }
    }

    if (skippedCount > 0) {
        console.log(`[Holodeck] Stylesheet capture: ${accessedCount} accessed, ${skippedCount} skipped (likely cross-origin). Inlining computed styles for critical elements...`)
    }

    return allCSS
}

// Capture current DOM as HTML string with inlined styles
function captureDOM(): string {
    // Clone the document to avoid modifying the live DOM
    const docClone = document.documentElement.cloneNode(true) as HTMLElement

    // Inline computed styles for all elements to handle cross-origin CSS issues (like icons)
    // We do this BEFORE removing any elements from the clone to ensure index-based matching works perfectly
    inlineAllStyles(document.documentElement, docClone)

    // Remove any scripts to prevent execution issues
    const scripts = docClone.querySelectorAll('script')
    scripts.forEach(script => script.remove())

    // Remove preloads and other head noise that causes 404s
    const removals = docClone.querySelectorAll('link[rel="preload"], link[rel="prefetch"], link[rel="modulepreload"], link[rel="next-head"]')
    removals.forEach(el => el.remove())

    // Remove iframes to prevent nested fetches
    const iframes = docClone.querySelectorAll('iframe')
    iframes.forEach(iframe => iframe.remove())

    // Remove existing link stylesheets (we'll inline them)
    const links = docClone.querySelectorAll('link[rel="stylesheet"]')
    links.forEach(link => link.remove())

    // Capture all CSS and add as inline style
    const allCSS = captureStylesheets()
    const styleElement = document.createElement('style')
    styleElement.textContent = allCSS

    // Add base tag to resolve relative assets (fonts, etc)
    const baseElement = document.createElement('base')
    baseElement.href = window.location.href

    // Add the captured styles and base to head
    const head = docClone.querySelector('head')
    if (head) {
        head.insertBefore(styleElement, head.firstChild)
        head.insertBefore(baseElement, head.firstChild)
    }

    // Get the HTML with doctype
    const doctype = document.doctype
    const doctypeString = doctype
        ? `<!DOCTYPE ${doctype.name}${doctype.publicId ? ` PUBLIC "${doctype.publicId}"` : ''}${doctype.systemId ? ` "${doctype.systemId}"` : ''}>`
        : '<!DOCTYPE html>'

    return doctypeString + docClone.outerHTML
}

// Create a snapshot
function createSnapshot(type: EventType, clickX?: number, clickY?: number): ClickSnapshot {
    return {
        type,
        timestamp: Date.now(),
        html: captureDOM(),
        clickX,
        clickY,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        url: window.location.href,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight
    }
}

// Click handler
function handleClick(event: MouseEvent) {
    if (!isRecording || !recording) return

    const snapshot = createSnapshot(EventType.CLICK, event.clientX, event.clientY)
    recording.snapshots.push(snapshot)

    // Notify background to update badge with click count
    chrome.runtime.sendMessage({
        type: "CLICK_RECORDED",
        snapshotCount: recording.snapshots.length
    })

    console.log(`[Holodeck] Click captured at (${event.clientX}, ${event.clientY}). Total: ${recording.snapshots.length} snapshots`)
}

// Start recording
function startRecording(): { success: boolean; startTime?: number; error?: string } {
    if (isRecording) {
        return { success: false, error: "Already recording" }
    }

    try {
        recordingStartTime = Date.now()
        isRecording = true

        // Initialize recording with start snapshot
        recording = {
            version: "2.0",
            startTime: recordingStartTime,
            snapshots: [createSnapshot(EventType.START)]
        }

        // Add click listener
        document.addEventListener("click", handleClick, true)

        // Notify background to change icon
        chrome.runtime.sendMessage({ type: "RECORDING_STARTED" })

        console.log("[Holodeck] Click-only recording started")
        return { success: true, startTime: recordingStartTime }
    } catch (error) {
        isRecording = false
        recordingStartTime = null
        recording = null
        return { success: false, error: String(error) }
    }
}

// Stop recording
function stopRecording(): { success: boolean; recording?: ClickRecording; error?: string } {
    if (!isRecording || !recording) {
        return { success: false, error: "Not recording" }
    }

    try {
        // Remove click listener
        document.removeEventListener("click", handleClick, true)

        isRecording = false
        const capturedRecording = { ...recording }

        console.log(`[Holodeck] Recording stopped. Captured ${capturedRecording.snapshots.length} snapshots.`)

        // Notify background to change icon
        chrome.runtime.sendMessage({ type: "RECORDING_STOPPED" })

        // Clear state
        recording = null
        recordingStartTime = null

        return { success: true, recording: capturedRecording }
    } catch (error) {
        return { success: false, error: String(error) }
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_RECORDING") {
        const result = startRecording()
        sendResponse(result)
        return true
    }

    if (message.type === "STOP_RECORDING") {
        const result = stopRecording()
        if (result.success && result.recording) {
            // Return recording data for popup to save
            sendResponse({
                success: true,
                recording: result.recording,
                snapshotCount: result.recording.snapshots.length
            })
        } else {
            sendResponse(result)
        }
        return true
    }

    if (message.type === "CANCEL_RECORDING") {
        // Cancel recording without saving - just discard the data
        if (!isRecording) {
            sendResponse({ success: false, error: "Not recording" })
            return true
        }

        try {
            // Remove click listener
            document.removeEventListener("click", handleClick, true)

            isRecording = false
            const snapshotCount = recording?.snapshots.length || 0

            // Clear state without returning data
            recording = null
            recordingStartTime = null

            console.log(`[Holodeck] Recording cancelled. Discarded ${snapshotCount} snapshots.`)

            // Notify background to reset icon
            chrome.runtime.sendMessage({ type: "RECORDING_STOPPED" })

            sendResponse({ success: true })
        } catch (error) {
            sendResponse({ success: false, error: String(error) })
        }
        return true
    }

    if (message.type === "GET_STATUS") {
        sendResponse({
            isRecording,
            snapshotCount: recording?.snapshots.length || 0,
            startTime: recordingStartTime
        })
        return true
    }

    return false
})

// Listen for countdown completion from countdown-overlay.tsx
window.addEventListener("holodeck-countdown-complete", () => {
    console.log("[Holodeck] Countdown complete, starting recording...")
    const result = startRecording()
    if (result.success) {
        console.log("[Holodeck] Recording started successfully after countdown")
    } else {
        console.error("[Holodeck] Failed to start recording:", result.error)
    }
})

// Listen for countdown cancellation
window.addEventListener("holodeck-countdown-cancelled", () => {
    console.log("[Holodeck] Countdown cancelled by user")
})

// Notify background to reset icon if page is closed during recording
window.addEventListener("beforeunload", () => {
    if (isRecording) {
        chrome.runtime.sendMessage({ type: "RECORDING_STOPPED" })
    }
})

console.log("[Holodeck] Click-only recorder loaded and ready")
