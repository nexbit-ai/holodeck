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
let isRecording = false
let cachedCSS: string | null = null
let lastStylesheetCount = 0

// Capture all computed styles for an element
// ... removed unused getComputedStylesCSS ...

// Inline all styles for the document by mapping cloned elements to live elements
function inlineAllStyles(liveRoot: Element, clonedRoot: Element): void {
    const liveElements = liveRoot.querySelectorAll('*')
    const clonedElements = clonedRoot.querySelectorAll('*')

    // Ensure we have the same number of elements
    const count = Math.min(liveElements.length, clonedElements.length)

    // Critical styles to copy for layout and appearance
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
        'fill', 'stroke', 'stroke-width', 'vertical-align'
    ]

    for (let i = 0; i < count; i++) {
        const liveEl = liveElements[i] as HTMLElement
        const clonedEl = clonedElements[i] as HTMLElement

        // Skip if elements don't match tags (sanity check)
        if (liveEl.tagName !== clonedEl.tagName) continue

        // Performance: Skip hidden elements
        const rect = liveEl.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) continue

        const computedStyles = window.getComputedStyle(liveEl)

        for (let j = 0; j < stylesToCopy.length; j++) {
            const prop = stylesToCopy[j]
            const value = computedStyles.getPropertyValue(prop)
            if (value && value !== '' && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)') {
                clonedEl.style.setProperty(prop, value)
            }
        }
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

// Capture all stylesheets as inline styles with caching
function captureStylesheets(): string {
    const currentCount = document.styleSheets.length
    if (cachedCSS && currentCount === lastStylesheetCount) {
        return cachedCSS
    }

    let allCSS = ''
    let accessedCount = 0
    let skippedCount = 0

    // Capture all stylesheet rules
    for (let i = 0; i < document.styleSheets.length; i++) {
        try {
            const sheet = document.styleSheets[i]
            const rules = sheet.cssRules || sheet.rules
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    allCSS += rules[j].cssText + '\n'
                }
                accessedCount++
            }
        } catch (e) {
            // Cross-origin stylesheets can't be accessed
            skippedCount++
        }
    }

    if (skippedCount > 0) {
        console.log(`[Nexbit] Stylesheet capture: ${accessedCount} accessed, ${skippedCount} skipped (likely cross-origin). Inlining computed styles for critical elements...`)
    }

    cachedCSS = allCSS
    lastStylesheetCount = currentCount
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
    if (!isRecording) return

    const snapshot = createSnapshot(EventType.CLICK, event.clientX, event.clientY)

    // Send to background to store
    chrome.runtime.sendMessage({
        type: "ADD_SNAPSHOT",
        snapshot
    })

    console.log(`[Nexbit] Click captured at (${event.clientX}, ${event.clientY}). Snapshot sent to background.`)
}

// Start recording (called after countdown or from background state)
function startRecordingListeners() {
    if (isRecording) return
    isRecording = true
    document.addEventListener("click", handleClick, true)
    console.log("[Nexbit] Listeners attached for recording")
}

// Stop recording listeners
function stopRecordingListeners() {
    isRecording = false
    document.removeEventListener("click", handleClick, true)
    console.log("[Nexbit] Listeners removed for recording")
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_RECORDING") {
        // This is now just a trigger for the listeners, but we officially start in background
        const firstSnapshot = createSnapshot(EventType.START)
        chrome.runtime.sendMessage({
            type: "START_RECORDING_SESSION",
            startTime: Date.now(),
            firstSnapshot
        }, (response) => {
            if (response?.success) {
                startRecordingListeners()
            }
            sendResponse(response)
        })
        return true
    }

    if (message.type === "STOP_RECORDING") {
        chrome.runtime.sendMessage({ type: "STOP_RECORDING_SESSION" }, (response) => {
            if (response?.success) {
                stopRecordingListeners()
            }
            sendResponse(response)
        })
        return true
    }

    if (message.type === "CANCEL_RECORDING") {
        chrome.runtime.sendMessage({ type: "CANCEL_RECORDING_SESSION" }, (response) => {
            if (response?.success) {
                stopRecordingListeners()
            }
            sendResponse(response)
        })
        return true
    }

    if (message.type === "GET_STATUS") {
        chrome.runtime.sendMessage({ type: "GET_RECORDING_STATE" }, (response) => {
            // Check if this tab is the one being recorded (optional refinement later)
            const active = response?.isRecording || false

            // Sync local state with background
            if (active && !isRecording) {
                startRecordingListeners()
            } else if (!active && isRecording) {
                stopRecordingListeners()
            }

            sendResponse({
                isRecording: active,
                snapshotCount: response?.snapshots?.length || 0,
                startTime: response?.startTime
            })
        })
        return true
    }

    return false
})

// Listen for countdown completion from countdown-overlay.tsx
window.addEventListener("nexbit-countdown-complete", () => {
    console.log("[Nexbit] Countdown complete, notifying background...")
    const firstSnapshot = createSnapshot(EventType.START)
    chrome.runtime.sendMessage({
        type: "START_RECORDING_SESSION",
        startTime: Date.now(),
        firstSnapshot
    }, (response) => {
        if (response?.success) {
            startRecordingListeners()
        }
    })
})

// Check status on script load to re-attach listeners if recording
chrome.runtime.sendMessage({ type: "GET_RECORDING_STATE" }, (response) => {
    if (response?.isRecording) {
        console.log("[Nexbit] Active recording found on script load, re-attaching listeners")
        startRecordingListeners()
    }
})

console.log("[Nexbit] Stateless recorder loaded and synchronized")
