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
function inlineAllStyles(liveRoot: Node, clonedRoot: Node): void {
    // Traverse the entire tree including shadow roots
    const walker = document.createTreeWalker(liveRoot, NodeFilter.SHOW_ELEMENT)
    const cloneWalker = document.createTreeWalker(clonedRoot, NodeFilter.SHOW_ELEMENT)

    // Essential styles to copy for layout and appearance
    const stylesToCopy = [
        'display', 'position', 'top', 'left', 'right', 'bottom',
        'width', 'height', 'min-width', 'min-height',
        'margin', 'padding', 'border', 'border-radius',
        'background-color', 'background-image',
        'color', 'font-family', 'font-size', 'font-weight',
        'flex', 'flex-direction', 'justify-content', 'align-items', 'gap',
        'box-shadow', 'opacity', 'visibility', 'z-index', 'overflow',
        'transform'
    ]

    let liveEl = walker.nextNode() as HTMLElement | null
    let clonedEl = cloneWalker.nextNode() as HTMLElement | null

    while (liveEl && clonedEl) {
        // Skip hidden elements (performance)
        if (liveEl.offsetWidth !== 0 || liveEl.offsetHeight !== 0) {
            const computedStyles = window.getComputedStyle(liveEl)

            for (let j = 0; j < stylesToCopy.length; j++) {
                const prop = stylesToCopy[j]
                const value = computedStyles.getPropertyValue(prop)

                // Only set if value is non-default and meaningful
                if (value && value !== '' && value !== 'none' && value !== 'normal' && value !== 'auto' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)') {
                    clonedEl.style.setProperty(prop, value)
                }
            }
        }

        // Handle Shadow DOM
        if (liveEl.shadowRoot && clonedEl.shadowRoot) {
            inlineAllStyles(liveEl.shadowRoot, clonedEl.shadowRoot)
        }

        liveEl = walker.nextNode() as HTMLElement | null
        clonedEl = cloneWalker.nextNode() as HTMLElement | null
    }
}

// Helper to clone a node and its shadow root if it exists
function cloneNodeWithShadow(node: Node): Node {
    const clone = node.cloneNode(false)

    if (node instanceof Element && node.shadowRoot) {
        const shadowClone = (clone as Element).attachShadow({ mode: node.shadowRoot.mode })
        for (const child of node.shadowRoot.childNodes) {
            shadowClone.appendChild(cloneNodeWithShadow(child))
        }
    }

    for (const child of node.childNodes) {
        clone.appendChild(cloneNodeWithShadow(child))
    }

    return clone
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

        // Handle Shadow DOM traversal upwards
        const parent = current.parentElement || (current.getRootNode() instanceof ShadowRoot ? (current.getRootNode() as ShadowRoot).host : null)
        current = parent as Element | null
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
            }
        } catch (e) {
            // Cross-origin stylesheets can't be accessed
            skippedCount++
        }
    }

    if (skippedCount > 0) {
        console.warn(`[Nexbit] ${skippedCount} cross-origin stylesheets could not be accessed. Styles inlined via computed styles.`)
    }

    cachedCSS = allCSS
    lastStylesheetCount = currentCount
    return allCSS
}

// Capture current DOM as HTML string with inlined styles
function captureDOM(): string {
    // Clone the document with shadow roots
    const docClone = cloneNodeWithShadow(document.documentElement) as HTMLElement

    // Inline computed styles for all elements
    inlineAllStyles(document.documentElement, docClone)

    // Helper to process clones (remove scripts, links, etc)
    function processClone(root: Node) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
        const removals: Element[] = []

        let el = walker.nextNode() as HTMLElement | null
        while (el) {
            if (el.tagName === 'SCRIPT' ||
                el.tagName === 'IFRAME' ||
                (el.tagName === 'LINK' && (el.getAttribute('rel') === 'stylesheet' || el.getAttribute('rel')?.includes('preload')))) {
                removals.push(el)
            }

            if (el.shadowRoot) {
                processClone(el.shadowRoot)
            }
            el = walker.nextNode() as HTMLElement | null
        }

        removals.forEach(e => e.remove())
    }

    processClone(docClone)

    // Capture all CSS and add as inline style
    const allCSS = captureStylesheets()
    const styleElement = document.createElement('style')
    styleElement.textContent = allCSS

    // Add base tag to resolve relative assets
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

    // OuterHTML doesn't capture shadow roots, we need to handle that or use a custom serializer
    // For now, let's use a simpler approach for the prototype or implement a full serializer
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

    // 1. Immediate feedback to background script (to update badge ASAP)
    chrome.runtime.sendMessage({
        type: "CLICK_RECORDED",
        timestamp: Date.now()
    }).catch(err => console.error("[Nexbit] Failed to send click feedback:", err))

    // 2. Heavy snapshotting (wrapped in timeout to avoid blocking main thread if possible, 
    // but we capture DOM state synchronously first)
    try {
        const snapshot = createSnapshot(EventType.CLICK, event.clientX, event.clientY)

        // Send to background to store
        chrome.runtime.sendMessage({
            type: "ADD_SNAPSHOT",
            snapshot
        }).catch(err => {
            console.error("[Nexbit] Failed to send snapshot to background:", err)
        })
    } catch (error) {
        console.error("[Nexbit] Error during snapshot capture:", error)
    }
}

// Start recording (called after countdown or from background state)
function startRecordingListeners() {
    if (isRecording) return
    isRecording = true
    // Use capture phase to ensure we catch clicks before they are stopped by other listeners
    document.addEventListener("click", handleClick, { capture: true, passive: true })
}

// Stop recording listeners
function stopRecordingListeners() {
    isRecording = false
    document.removeEventListener("click", handleClick, true)
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START_RECORDING") {
        // 1. Start session IMMEDIATELY 
        chrome.runtime.sendMessage({
            type: "START_RECORDING_SESSION",
            startTime: Date.now()
        }, (response) => {
            if (response?.success) {
                startRecordingListeners()

                // 2. Capture and add the "start" snapshot asynchronously
                setTimeout(() => {
                    try {
                        const firstSnapshot = createSnapshot(EventType.START)
                        chrome.runtime.sendMessage({
                            type: "ADD_SNAPSHOT",
                            snapshot: firstSnapshot
                        })
                    } catch (error) {
                        console.error("[Nexbit] Failed to capture initial snapshot:", error)
                    }
                }, 100)
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
    // 1. Start session IMMEDIATELY without waiting for heavy snapshot
    chrome.runtime.sendMessage({
        type: "START_RECORDING_SESSION",
        startTime: Date.now()
    }, (response) => {
        if (response?.success) {
            startRecordingListeners()

            // 2. Capture and add the "start" snapshot asynchronously
            setTimeout(() => {
                try {
                    const firstSnapshot = createSnapshot(EventType.START)
                    chrome.runtime.sendMessage({
                        type: "ADD_SNAPSHOT",
                        snapshot: firstSnapshot
                    })
                } catch (error) {
                    console.error("[Nexbit] Failed to capture initial snapshot:", error)
                }
            }, 100)
        }
    })
})

// Check status on script load to re-attach listeners if recording
chrome.runtime.sendMessage({ type: "GET_RECORDING_STATE" }, (response) => {
    if (response?.isRecording) {
        startRecordingListeners()
    }
})
