// Types for click-only recording format (v2.0)

// Zoom and pan configuration for a slide
export interface ZoomPan {
    enabled: boolean
    // Rectangle coordinates (in original viewport coordinates)
    x: number
    y: number
    width: number
    height: number
}

export interface ClickSnapshot {
    type: "start" | "click"
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

// Check if recording is the new click-only format
export function isClickRecording(data: unknown): data is ClickRecording {
    return (
        typeof data === "object" &&
        data !== null &&
        "version" in data &&
        (data as ClickRecording).version === "2.0" &&
        "snapshots" in data &&
        Array.isArray((data as ClickRecording).snapshots)
    )
}
