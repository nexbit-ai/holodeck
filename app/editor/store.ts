import { create } from 'zustand'
import type { ClickRecording, ClickSnapshot } from './types/recording'

export interface Annotation {
    label: string
    script: string
}

// Extended snapshot with annotation
export interface AnnotatedSnapshot extends ClickSnapshot {
    annotation?: Annotation
}

// Extended recording with annotations
export interface AnnotatedRecording extends Omit<ClickRecording, 'snapshots'> {
    snapshots: AnnotatedSnapshot[]
}

interface EditorState {
    // Data
    clickRecording: AnnotatedRecording | null
    recordingId: string | null  // File ID for saving back

    // UI State
    selectedSlideIndex: number
    isLoaded: boolean
    isSaving: boolean
    lastSaved: Date | null

    // Actions
    loadRecording: (recording: ClickRecording | AnnotatedRecording, id?: string) => void
    setSelectedSlide: (index: number) => void
    updateAnnotation: (snapshotIndex: number, annotation: Annotation) => void
    deleteSnapshot: (snapshotIndex: number) => void
    deleteSnapshots: (indices: number[]) => void
    saveRecording: () => Promise<void>
    clearProject: () => void
    exportProject: () => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
    // Initial state
    clickRecording: null,
    recordingId: null,
    selectedSlideIndex: 0,
    isLoaded: false,
    isSaving: false,
    lastSaved: null,

    // Actions
    loadRecording: (recording, id) => {
        set({
            clickRecording: recording as AnnotatedRecording,
            recordingId: id || null,
            isLoaded: true,
            selectedSlideIndex: 0,
            lastSaved: null,
        })
    },

    setSelectedSlide: (index) => {
        const { clickRecording } = get()
        const totalSlides = clickRecording?.snapshots.length || 0
        if (index >= 0 && index < totalSlides) {
            set({ selectedSlideIndex: index })
        }
    },

    updateAnnotation: (snapshotIndex, annotation) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        // Update the annotation in the snapshot itself
        const updatedSnapshots = [...clickRecording.snapshots]
        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            annotation,
        }

        const updatedRecording = {
            ...clickRecording,
            snapshots: updatedSnapshots,
        }

        set({ clickRecording: updatedRecording })

        // Auto-save if we have a recording ID
        if (recordingId) {
            get().saveRecording()
        }
    },

    deleteSnapshot: (snapshotIndex) => {
        const { clickRecording, recordingId, selectedSlideIndex } = get()
        if (!clickRecording) return
        if (clickRecording.snapshots.length <= 1) return // Keep at least one slide

        // Remove the snapshot at the given index
        const updatedSnapshots = clickRecording.snapshots.filter((_, i) => i !== snapshotIndex)

        const updatedRecording = {
            ...clickRecording,
            snapshots: updatedSnapshots,
        }

        // Adjust selected index if needed
        let newSelectedIndex = selectedSlideIndex
        if (selectedSlideIndex >= updatedSnapshots.length) {
            newSelectedIndex = updatedSnapshots.length - 1
        } else if (selectedSlideIndex > snapshotIndex) {
            newSelectedIndex = selectedSlideIndex - 1
        }

        set({
            clickRecording: updatedRecording,
            selectedSlideIndex: Math.max(0, newSelectedIndex),
        })

        // Auto-save if we have a recording ID
        if (recordingId) {
            get().saveRecording()
        }
    },

    deleteSnapshots: (indices) => {
        const { clickRecording, recordingId, selectedSlideIndex } = get()
        if (!clickRecording) return

        const indicesToDelete = new Set(indices)
        const updatedSnapshots = clickRecording.snapshots.filter((_, i) => !indicesToDelete.has(i))

        if (updatedSnapshots.length === 0) return // Keep at least one slide

        const updatedRecording = {
            ...clickRecording,
            snapshots: updatedSnapshots,
        }

        // Adjust selected index
        let newSelectedIndex = 0
        if (selectedSlideIndex < updatedSnapshots.length) {
            // Count how many deleted indices are before the current selection
            const deletedBefore = indices.filter(i => i < selectedSlideIndex).length
            newSelectedIndex = Math.max(0, selectedSlideIndex - deletedBefore)
        }

        set({
            clickRecording: updatedRecording,
            selectedSlideIndex: Math.min(newSelectedIndex, updatedSnapshots.length - 1),
        })

        // Auto-save if we have a recording ID
        if (recordingId) {
            get().saveRecording()
        }
    },

    saveRecording: async () => {
        const { clickRecording, recordingId, isSaving } = get()
        if (!clickRecording || !recordingId || isSaving) return

        set({ isSaving: true })

        try {
            const response = await fetch('/api/recordings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: recordingId,
                    content: clickRecording,
                }),
            })

            if (response.ok) {
                set({ lastSaved: new Date() })
                console.log('[Store] Recording saved successfully')
            } else {
                console.error('[Store] Failed to save recording')
            }
        } catch (error) {
            console.error('[Store] Error saving recording:', error)
        } finally {
            set({ isSaving: false })
        }
    },

    clearProject: () => {
        set({
            clickRecording: null,
            recordingId: null,
            selectedSlideIndex: 0,
            isLoaded: false,
            isSaving: false,
            lastSaved: null,
        })
    },

    exportProject: () => {
        const { clickRecording } = get()

        if (!clickRecording) return

        const blob = new Blob([JSON.stringify(clickRecording, null, 2)], {
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
