// Types for click-only recording format (v2.0)

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
