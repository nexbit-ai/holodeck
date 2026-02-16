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
let isStarting = false // Guard against race conditions during initialization
let cachedCSS: string | null = null
let lastStylesheetCount = 0

// Capture all computed styles for an element
// ... removed unused getComputedStylesCSS ...

// Inline all styles for the document by mapping cloned elements to live elements
// Inline all styles and mark the target element
function inlineAllStyles(liveRoot: Node, clonedRoot: Node, targetNode?: Node): void {
    // Traverse the entire tree including shadow roots
    const walker = document.createTreeWalker(liveRoot, NodeFilter.SHOW_ELEMENT)
    const cloneWalker = document.createTreeWalker(clonedRoot, NodeFilter.SHOW_ELEMENT)

    // Essential styles to copy for layout and appearance - narrowed down to most impactful
    const stylesToCopy = [
        // Layout
        'display', 'position', 'top', 'left', 'right', 'bottom',
        'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
        'margin', 'padding', 'box-sizing', 'vertical-align', 'z-index', 'overflow',

        // Flexbox & Grid
        'flex', 'flex-direction', 'flex-wrap', 'align-items', 'justify-content', 'gap',
        'grid-template-columns', 'grid-template-rows', 'grid-area',

        // Appearance
        'background-color', 'background-image', 'background-size',
        'border', 'border-radius', 'box-shadow', 'opacity', 'visibility',

        // Typography
        'color', 'font-family', 'font-size', 'font-weight', 'line-height',
        'text-align', 'text-overflow', 'white-space',

        // Effects
        'transform', 'filter', 'backdrop-filter', 'pointer-events'
    ]

    let liveEl = walker.nextNode() as HTMLElement | null
    let clonedEl = cloneWalker.nextNode() as HTMLElement | null

    while (liveEl && clonedEl) {
        // Mark target element if it's the one that was clicked
        if (targetNode && liveEl === targetNode) {
            clonedEl.setAttribute('data-ai-target', 'primary')
        }

        const computedStyles = window.getComputedStyle(liveEl)
        const display = computedStyles.display

        if (display !== 'none' || liveEl.tagName === 'STYLE' || liveEl.tagName === 'LINK') {
            const rect = liveEl.getBoundingClientRect()
            clonedEl.setAttribute('data-ai-x', Math.round(rect.left).toString())
            clonedEl.setAttribute('data-ai-y', Math.round(rect.top).toString())
            clonedEl.setAttribute('data-ai-w', Math.round(rect.width).toString())
            clonedEl.setAttribute('data-ai-h', Math.round(rect.height).toString())

            // Optimization: Only copy styles if they differ from common defaults
            for (const prop of stylesToCopy) {
                const value = computedStyles.getPropertyValue(prop)
                if (value && value !== '' && value !== 'normal' && value !== 'none' &&
                    value !== 'auto' && value !== '0px' && value !== 'rgba(0, 0, 0, 0)' &&
                    value !== 'transparent' && value !== '0px none rgb(0, 0, 0)') {
                    clonedEl.style.setProperty(prop, value)
                }
            }
        }

        // Handle Shadow DOM
        if (liveEl.shadowRoot && clonedEl.shadowRoot) {
            try {
                inlineAllStyles(liveEl.shadowRoot, clonedEl.shadowRoot, targetNode)
            } catch (e) {
                console.warn("[Nexbit] Failed to inline shadow styles:", e)
            }
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

// Custom serializer to handle Shadow DOM via Declarative Shadow DOM (<template shadowrootmode>)
function serializeNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    }

    if (node.nodeType === Node.COMMENT_NODE) {
        return `<!--${node.textContent}-->`
    }

    if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
        const doctype = node as DocumentType
        return `<!DOCTYPE ${doctype.name}${doctype.publicId ? ` PUBLIC "${doctype.publicId}"` : ''}${doctype.systemId ? ` "${doctype.systemId}"` : ''}>`
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
        return ''
    }

    const el = node as Element
    const tagName = el.tagName.toLowerCase()

    // Start tag
    let html = `<${tagName}`

    // Attributes
    for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i]
        html += ` ${attr.name}="${attr.value.replace(/"/g, '&quot;')}"`
    }

    html += '>'

    // Shadow Root (Declarative Shadow DOM)
    if (el.shadowRoot) {
        const mode = el.shadowRoot.mode || 'open'
        html += `<template shadowrootmode="${mode}">`
        for (const child of el.shadowRoot.childNodes) {
            html += serializeNode(child)
        }
        html += '</template>'
    }

    // Children
    for (const child of el.childNodes) {
        html += serializeNode(child)
    }

    // End tag (except for void elements)
    const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
    if (!voidElements.includes(tagName)) {
        html += `</${tagName}>`
    }

    return html
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
function captureDOM(targetNode?: Node): string {
    // Clone the document with shadow roots
    const docClone = cloneNodeWithShadow(document.documentElement) as HTMLElement

    // Inline computed styles and mark target for all elements
    inlineAllStyles(document.documentElement, docClone, targetNode)

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

    // Serialize using our custom serializer to include Shadow DOM
    const doctype = document.doctype
    const doctypeString = doctype
        ? serializeNode(doctype)
        : '<!DOCTYPE html>'

    return doctypeString + serializeNode(docClone)
}

// Create a snapshot
function createSnapshot(type: EventType, clickX?: number, clickY?: number, targetNode?: Node): ClickSnapshot {
    return {
        type,
        timestamp: Date.now(),
        html: captureDOM(targetNode),
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

    // 2. Heavy snapshotting (we capture DOM state synchronously first, 
    // and then send it to the background).
    try {
        const snapshot = createSnapshot(EventType.CLICK, event.clientX, event.clientY, event.target as Node)

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
        if (isRecording || isStarting) {
            sendResponse({ success: false, error: "Recording already in progress or starting" })
            return true
        }

        isStarting = true

        // 1. Capture the initial "start" snapshot SYNCHRONOUSLY to prevent race conditions
        let initialSnapshot = null
        try {
            initialSnapshot = createSnapshot(EventType.START)
        } catch (error) {
            console.error("[Nexbit] Failed to capture initial snapshot:", error)
            isStarting = false
            sendResponse({ success: false, error: "Failed to capture initial snapshot" })
            return true
        }

        // 2. Start session with the bundled snapshot
        chrome.runtime.sendMessage({
            type: "START_RECORDING_SESSION",
            startTime: Date.now(),
            firstSnapshot: initialSnapshot
        }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("[Nexbit] Failed to start recording session:", chrome.runtime.lastError)
                isStarting = false
                sendResponse({ success: false, error: "Failed to communicate with background script" })
                return
            }
            if (response?.success) {
                startRecordingListeners()
            }
            isStarting = false
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

            // Sync local state with background, avoiding interruption if we're currently starting
            if (active && !isRecording && !isStarting) {
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
    if (isRecording || isStarting) return

    isStarting = true

    // 1. Capture the initial "start" snapshot SYNCHRONOUSLY
    let initialSnapshot = null
    try {
        initialSnapshot = createSnapshot(EventType.START)
    } catch (error) {
        console.error("[Nexbit] Failed to capture initial snapshot during countdown:", error)
        isStarting = false
        return
    }

    // 2. Start session bundled with the first snapshot
    chrome.runtime.sendMessage({
        type: "START_RECORDING_SESSION",
        startTime: Date.now(),
        firstSnapshot: initialSnapshot
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.error("[Nexbit] Failed to start recording after countdown:", chrome.runtime.lastError)
            isStarting = false
            return
        }
        if (response?.success) {
            startRecordingListeners()
        }
        isStarting = false
    })
})

// Check status on script load to re-attach listeners if recording
chrome.runtime.sendMessage({ type: "GET_RECORDING_STATE" }, (response) => {
    if (response?.isRecording && !isRecording && !isStarting) {
        startRecordingListeners()
    }
})
