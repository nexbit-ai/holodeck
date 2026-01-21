import { create } from 'zustand'
import type { ClickRecording, ClickSnapshot, ZoomPan } from './types/recording'
import { EventType } from './types/recording'

export interface Hotspot {
    id: string
    x: number
    y: number
    text: string
}

export interface BlurRegion {
    id: string
    x: number
    y: number
    width: number
    height: number
}

export interface CropData {
    x: number
    y: number
    width: number
    height: number
}

export interface Annotation {
    label: string
    script: string
    zoomPan?: ZoomPan
    hotspots?: Hotspot[]
    blurRegions?: BlurRegion[]
    crop?: CropData
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
    isZoomMode: boolean
    isHotspotMode: boolean
    isBlurMode: boolean
    isCropMode: boolean

    // Actions
    loadRecording: (recording: ClickRecording | AnnotatedRecording, id?: string) => void
    setSelectedSlide: (index: number) => void
    updateAnnotation: (snapshotIndex: number, annotation: Annotation) => void
    updateZoomPan: (snapshotIndex: number, zoomPan: ZoomPan | undefined) => void
    updateCoverMetadata: (snapshotIndex: number, metadata: { title?: string, logo?: string, description?: string }) => void
    updateEndMetadata: (snapshotIndex: number, metadata: { title?: string, logo?: string, description?: string, ctaLink?: string }) => void
    deleteSnapshot: (snapshotIndex: number) => void
    deleteSnapshots: (indices: number[]) => void
    saveRecording: () => Promise<void>
    setZoomMode: (active: boolean) => void
    setHotspotMode: (active: boolean) => void
    setBlurMode: (active: boolean) => void
    setCropMode: (active: boolean) => void
    addHotspot: (snapshotIndex: number, hotspot: Hotspot) => void
    updateHotspot: (snapshotIndex: number, hotspotId: string, text: string) => void
    deleteHotspot: (snapshotIndex: number, hotspotId: string) => void
    addBlurRegion: (snapshotIndex: number, region: BlurRegion) => void
    deleteBlurRegion: (snapshotIndex: number, regionId: string) => void
    updateCrop: (snapshotIndex: number, crop: CropData | undefined) => void
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
    isZoomMode: false,
    isHotspotMode: false,
    isBlurMode: false,
    isCropMode: false,

    // Actions
    loadRecording: (recording, id) => {
        let annotatedRecording = recording as AnnotatedRecording

        // Automatically add cover slide if not present
        const hasCover = annotatedRecording.snapshots.some(s => s.type === 'cover' || s.type === EventType.COVER)
        if (!hasCover && annotatedRecording.snapshots.length > 0) {
            const firstSnapshot = annotatedRecording.snapshots[0]
            const coverSlide: AnnotatedSnapshot = {
                ...firstSnapshot,
                type: EventType.COVER,
                title: 'Welcome to the Demo',
                description: 'Click Get Started to begin',
                timestamp: firstSnapshot.timestamp - 1000,
            }
            annotatedRecording = {
                ...annotatedRecording,
                snapshots: [coverSlide, ...annotatedRecording.snapshots]
            }
        }

        // Automatically add end slide if not present
        const hasEnd = annotatedRecording.snapshots.some(s => s.type === 'end' || s.type === EventType.END)
        if (!hasEnd && annotatedRecording.snapshots.length > 0) {
            const lastSnapshot = annotatedRecording.snapshots[annotatedRecording.snapshots.length - 1]
            const endSlide: AnnotatedSnapshot = {
                ...lastSnapshot,
                type: EventType.END,
                title: 'Enjoyed the guided demo?',
                description: 'See more features on our website',
                ctaLink: 'https://nexbit.ai',
                timestamp: lastSnapshot.timestamp + 10000,
            }
            annotatedRecording = {
                ...annotatedRecording,
                snapshots: [...annotatedRecording.snapshots, endSlide]
            }
        }

        set({
            clickRecording: annotatedRecording,
            recordingId: id || null,
            isLoaded: true,
            selectedSlideIndex: 0,
            lastSaved: null,
            isZoomMode: false,
            isHotspotMode: false,
            isBlurMode: false,
            isCropMode: false,
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

    updateCoverMetadata: (snapshotIndex, metadata) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        const updatedSnapshots = [...clickRecording.snapshots]
        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            ...metadata
        }

        const updatedRecording = {
            ...clickRecording,
            snapshots: updatedSnapshots,
        }

        set({ clickRecording: updatedRecording })

        if (recordingId) {
            get().saveRecording()
        }
    },

    updateEndMetadata: (snapshotIndex, metadata) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        const updatedSnapshots = [...clickRecording.snapshots]
        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            ...metadata
        }

        const updatedRecording = {
            ...clickRecording,
            snapshots: updatedSnapshots,
        }

        set({ clickRecording: updatedRecording })

        if (recordingId) {
            get().saveRecording()
        }
    },

    updateZoomPan: (snapshotIndex, zoomPan) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        const updatedSnapshots = [...clickRecording.snapshots]
        const currentAnnotation = updatedSnapshots[snapshotIndex].annotation || { label: '', script: '' }

        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            annotation: {
                ...currentAnnotation,
                zoomPan,
            },
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

    setZoomMode: (active) => {
        set({ isZoomMode: active })
    },

    setHotspotMode: (active) => {
        set({ isHotspotMode: active })
    },

    setBlurMode: (active) => {
        set({ isBlurMode: active })
    },

    setCropMode: (active) => {
        set({ isCropMode: active })
    },

    addHotspot: (snapshotIndex, hotspot) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        const updatedSnapshots = [...clickRecording.snapshots]
        const currentAnnotation = updatedSnapshots[snapshotIndex].annotation || { label: '', script: '' }
        const currentHotspots = currentAnnotation.hotspots || []

        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            annotation: {
                ...currentAnnotation,
                hotspots: [...currentHotspots, hotspot],
            },
        }

        set({
            clickRecording: {
                ...clickRecording,
                snapshots: updatedSnapshots,
            }
        })

        if (recordingId) get().saveRecording()
    },

    updateHotspot: (snapshotIndex, hotspotId, text) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        const updatedSnapshots = [...clickRecording.snapshots]
        const currentAnnotation = updatedSnapshots[snapshotIndex].annotation
        if (!currentAnnotation || !currentAnnotation.hotspots) return

        const updatedHotspots = currentAnnotation.hotspots.map(h =>
            h.id === hotspotId ? { ...h, text } : h
        )

        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            annotation: {
                ...currentAnnotation,
                hotspots: updatedHotspots,
            },
        }

        set({
            clickRecording: {
                ...clickRecording,
                snapshots: updatedSnapshots,
            }
        })

        if (recordingId) get().saveRecording()
    },

    deleteHotspot: (snapshotIndex, hotspotId) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        const updatedSnapshots = [...clickRecording.snapshots]
        const currentAnnotation = updatedSnapshots[snapshotIndex].annotation
        if (!currentAnnotation || !currentAnnotation.hotspots) return

        const updatedHotspots = currentAnnotation.hotspots.filter(h => h.id !== hotspotId)

        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            annotation: {
                ...currentAnnotation,
                hotspots: updatedHotspots,
            },
        }

        set({
            clickRecording: {
                ...clickRecording,
                snapshots: updatedSnapshots,
            }
        })

        if (recordingId) get().saveRecording()
    },

    addBlurRegion: (snapshotIndex, region) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        const updatedSnapshots = [...clickRecording.snapshots]
        const currentAnnotation = updatedSnapshots[snapshotIndex].annotation || { label: '', script: '' }
        const currentBlurs = currentAnnotation.blurRegions || []

        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            annotation: {
                ...currentAnnotation,
                blurRegions: [...currentBlurs, region],
            },
        }

        set({
            clickRecording: {
                ...clickRecording,
                snapshots: updatedSnapshots,
            }
        })

        if (recordingId) get().saveRecording()
    },

    deleteBlurRegion: (snapshotIndex, regionId) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        const updatedSnapshots = [...clickRecording.snapshots]
        const currentAnnotation = updatedSnapshots[snapshotIndex].annotation
        if (!currentAnnotation || !currentAnnotation.blurRegions) return

        const updatedBlurs = currentAnnotation.blurRegions.filter(r => r.id !== regionId)

        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            annotation: {
                ...currentAnnotation,
                blurRegions: updatedBlurs,
            },
        }

        set({
            clickRecording: {
                ...clickRecording,
                snapshots: updatedSnapshots,
            }
        })

        if (recordingId) get().saveRecording()
    },

    updateCrop: (snapshotIndex, crop) => {
        const { clickRecording, recordingId } = get()
        if (!clickRecording) return

        const updatedSnapshots = [...clickRecording.snapshots]
        const currentAnnotation = updatedSnapshots[snapshotIndex].annotation || { label: '', script: '' }

        updatedSnapshots[snapshotIndex] = {
            ...updatedSnapshots[snapshotIndex],
            annotation: {
                ...currentAnnotation,
                crop,
            },
        }

        set({
            clickRecording: {
                ...clickRecording,
                snapshots: updatedSnapshots,
            }
        })

        if (recordingId) get().saveRecording()
    },

    clearProject: () => {
        set({
            clickRecording: null,
            recordingId: null,
            selectedSlideIndex: 0,
            isLoaded: false,
            isSaving: false,
            lastSaved: null,
            isZoomMode: false,
            isHotspotMode: false,
            isBlurMode: false,
            isCropMode: false,
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
