import { create } from 'zustand'
import type { eventWithTime } from '@rrweb/types'

export interface Annotation {
    label: string
    script: string
}

export interface ClickEvent {
    id: string
    timestamp: number
    formattedTime: string
    type: string
}

interface EditorState {
    // Data
    events: eventWithTime[]
    clickEvents: ClickEvent[]
    annotations: Record<string, Annotation>

    // UI State
    selectedEventId: string | null
    isLoaded: boolean

    // Actions
    loadEvents: (events: eventWithTime[], clickEvents: ClickEvent[]) => void
    setSelectedEvent: (id: string | null) => void
    updateAnnotation: (eventId: string, annotation: Annotation) => void
    clearProject: () => void
    exportProject: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
    // Initial state
    events: [],
    clickEvents: [],
    annotations: {},
    selectedEventId: null,
    isLoaded: false,

    // Actions
    loadEvents: (events, clickEvents) => {
        set({
            events,
            clickEvents,
            isLoaded: true,
            selectedEventId: null,
            annotations: {},
        })
    },

    setSelectedEvent: (id) => {
        set({ selectedEventId: id })
    },

    updateAnnotation: (eventId, annotation) => {
        set((state) => ({
            annotations: {
                ...state.annotations,
                [eventId]: annotation,
            },
        }))
    },

    clearProject: () => {
        set({
            events: [],
            clickEvents: [],
            annotations: {},
            selectedEventId: null,
            isLoaded: false,
        })
    },

    exportProject: () => {
        const { events, annotations, clickEvents } = get()

        const project = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            events,
            clickEvents,
            annotations,
        }

        const blob = new Blob([JSON.stringify(project, null, 2)], {
            type: 'application/json',
        })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = 'demo-project.json'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    },
}))
