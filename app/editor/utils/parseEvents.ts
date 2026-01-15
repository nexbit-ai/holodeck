import type { eventWithTime } from '@rrweb/types'
import type { ClickEvent } from '../store'

// rrweb event types (from rrweb source)
enum EventType {
    DomContentLoaded = 0,
    Load = 1,
    FullSnapshot = 2,
    IncrementalSnapshot = 3,
    Meta = 4,
    Custom = 5,
    Plugin = 6,
}

enum IncrementalSource {
    Mutation = 0,
    MouseMove = 1,
    MouseInteraction = 2,
    Scroll = 3,
    ViewportResize = 4,
    Input = 5,
    TouchMove = 6,
    MediaInteraction = 7,
    StyleSheetRule = 8,
    CanvasMutation = 9,
    Font = 10,
    Log = 11,
    Drag = 12,
    StyleDeclaration = 13,
    Selection = 14,
    AdoptedStyleSheet = 15,
    CustomElement = 16,
}

enum MouseInteractions {
    MouseUp = 0,
    MouseDown = 1,
    Click = 2,
    ContextMenu = 3,
    DblClick = 4,
    Focus = 5,
    Blur = 6,
    TouchStart = 7,
    TouchMove_Departed = 8,
    TouchEnd = 9,
    TouchCancel = 10,
}

function formatTimestamp(ms: number, baseTime: number): string {
    const seconds = Math.floor((ms - baseTime) / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function getInteractionName(type: number): string {
    switch (type) {
        case MouseInteractions.Click:
            return 'Click'
        case MouseInteractions.MouseUp:
            return 'Mouse Up'
        case MouseInteractions.MouseDown:
            return 'Mouse Down'
        case MouseInteractions.DblClick:
            return 'Double Click'
        case MouseInteractions.ContextMenu:
            return 'Right Click'
        case MouseInteractions.Focus:
            return 'Focus'
        case MouseInteractions.Blur:
            return 'Blur'
        case MouseInteractions.TouchStart:
            return 'Touch Start'
        case MouseInteractions.TouchEnd:
            return 'Touch End'
        default:
            return 'Interaction'
    }
}

export function parseClickEvents(events: eventWithTime[]): ClickEvent[] {
    if (!events || events.length === 0) return []

    // Find the base timestamp (first event)
    const baseTime = events[0]?.timestamp || 0

    const clickEvents: ClickEvent[] = []

    events.forEach((event, index) => {
        // Check if it's an IncrementalSnapshot
        if (event.type !== EventType.IncrementalSnapshot) return

        const data = event.data as { source?: number; type?: number }

        // Check if it's a MouseInteraction
        if (data.source !== IncrementalSource.MouseInteraction) return

        // Filter for click-related interactions
        const interactionType = data.type
        if (
            interactionType === MouseInteractions.Click ||
            interactionType === MouseInteractions.MouseUp ||
            interactionType === MouseInteractions.DblClick
        ) {
            clickEvents.push({
                id: `event-${index}-${event.timestamp}`,
                timestamp: event.timestamp,
                formattedTime: formatTimestamp(event.timestamp, baseTime),
                type: getInteractionName(interactionType),
            })
        }
    })

    return clickEvents
}

export function getBaseTimestamp(events: eventWithTime[]): number {
    return events[0]?.timestamp || 0
}
