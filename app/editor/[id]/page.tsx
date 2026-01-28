'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { X, FileJson, Loader2, ArrowLeft, Download, Play } from 'lucide-react'
import { useEditorStore } from '../store'
import { ClickSlideDeck } from '../components/ClickSlideDeck'
import { SlideSidebar } from '../components/SlideSidebar'
import { isClickRecording } from '../types/recording'
import { EditorToolbar } from '../components/EditorToolbar'
import Link from 'next/link'
import { recordingService } from '../../services/recordingService'

export default function EditorWithIdPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const isLoaded = useEditorStore((state) => state.isLoaded)
    const clickRecording = useEditorStore((state) => state.clickRecording)
    const exportProject = useEditorStore((state) => state.exportProject)
    const clearProject = useEditorStore((state) => state.clearProject)
    const loadRecording = useEditorStore((state) => state.loadRecording)
    const recordingName = useEditorStore((state) => state.recordingName)
    const selectedSlideIndex = useEditorStore((state) => state.selectedSlideIndex)
    const setSelectedSlide = useEditorStore((state) => state.setSelectedSlide)
    const isSaving = useEditorStore((state) => state.isSaving)
    const lastSaved = useEditorStore((state) => state.lastSaved)
    const isPreviewMode = useEditorStore((state) => state.isPreviewMode)
    const setIsPreviewMode = useEditorStore((state) => state.setIsPreviewMode)
    const isZoomMode = useEditorStore((state) => state.isZoomMode)
    const setZoomMode = useEditorStore((state) => state.setZoomMode)
    const isHotspotMode = useEditorStore((state) => state.isHotspotMode)
    const setHotspotMode = useEditorStore((state) => state.setHotspotMode)
    const isBlurMode = useEditorStore((state) => state.isBlurMode)
    const setBlurMode = useEditorStore((state) => state.setBlurMode)
    const isCropMode = useEditorStore((state) => state.isCropMode)
    const setCropMode = useEditorStore((state) => state.setCropMode)

    // Get counts
    const snapshotCount = clickRecording?.snapshots.length || 0
    const clickCount = clickRecording?.snapshots.filter(s => s.type === 'click').length || 0

    // Zoom availability logic
    const currentSnapshot = clickRecording?.snapshots[selectedSlideIndex]
    const hasClick = currentSnapshot?.clickX !== undefined && currentSnapshot?.clickY !== undefined
    const hasHotspots = (currentSnapshot?.annotation?.hotspots?.length ?? 0) > 0
    const isSpecialSlide = currentSnapshot?.type === 'cover' || currentSnapshot?.type === 5 || currentSnapshot?.type === 'end' || currentSnapshot?.type === 6
    const canZoom = !isSpecialSlide && (hasClick || hasHotspots)

    const handleSlideChange = useCallback((index: number) => {
        setSelectedSlide(index)
    }, [setSelectedSlide])

    const handleClear = useCallback(() => {
        clearProject()
        router.push('/demos')
    }, [clearProject, router])

    const handleZoomClick = () => {
        setZoomMode(true)
        setHotspotMode(false)
        setBlurMode(false)
        setCropMode(false)
    }

    const handleHotspotClick = () => {
        setHotspotMode(!isHotspotMode)
        setZoomMode(false)
        setBlurMode(false)
        setCropMode(false)
    }

    const handleBlurClick = () => {
        setBlurMode(!isBlurMode)
        setCropMode(false)
        setZoomMode(false)
        setHotspotMode(false)
    }

    const handleCropClick = () => {
        setCropMode(!isCropMode)
        setBlurMode(false)
        setZoomMode(false)
        setHotspotMode(false)
    }

    // Load the recording from API
    useEffect(() => {
        async function loadRecordingData() {
            if (!id) return

            setIsLoading(true)
            setError(null)

            try {
                const data = await recordingService.getRecording(id)

                if (!data) {
                    setError('Recording not found')
                    setIsLoading(false)
                    return
                }

                // Map backend response to ClickRecording format for the store
                // The backend returns results from /api/v1/recordings/{id}
                // Based on common patterns and the single demo fetch logic we've seen
                const content = {
                    version: "2.0",
                    startTime: data.startTime || (data.events && data.events.length > 0 ? data.events[0].timestamp : Date.now()),
                    snapshots: data.events || data.snapshots || []
                }

                if (isClickRecording(content)) {
                    if (content.snapshots.length === 0) {
                        setError('The recording file has no snapshots')
                        setIsLoading(false)
                        return
                    }
                    loadRecording(content, id, data.name)  // Pass ID and name for auto-save and display
                    setIsLoading(false)
                    return
                }

                setError('Invalid recording format. Please use a v2.0 click recording.')
                setIsLoading(false)
            } catch (err) {
                console.error('Failed to load recording:', err)
                setError('Failed to load recording')
                setIsLoading(false)
            }
        }

        loadRecordingData()
    }, [id, loadRecording])

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-foreground/60">Loading recording...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileJson className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Load Recording</h2>
                    <p className="text-foreground/60 mb-6">{error}</p>
                    <Link
                        href="/demos"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Demos
                    </Link>
                </div>
            </div>
        )
    }

    // Editor loaded state
    if (!isLoaded || !clickRecording) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-foreground/60">Initializing editor...</p>
                </div>
            </div>
        )
    }

    // Editor state - show new layout with sidebar on left
    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="border-b border-foreground/10 bg-surface/80 backdrop-blur-sm shrink-0">
                <div className="px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (isPreviewMode) {
                                        setIsPreviewMode(false)
                                    } else {
                                        router.push('/demos')
                                    }
                                }}
                                className={isPreviewMode
                                    ? "px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-all flex items-center gap-2"
                                    : "p-2 rounded-lg hover:bg-foreground/5 transition-colors"
                                }
                            >
                                <ArrowLeft className="w-5 h-5 text-foreground/60" />
                                {isPreviewMode && "Back to Editor"}
                            </button>
                            {!isPreviewMode && (
                                <>
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <FileJson className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-bold text-foreground">
                                            {recordingName || 'Demo Editor'}
                                        </h1>
                                        <p className="text-xs text-foreground/50">
                                            {snapshotCount} slides
                                            {isSaving && <span className="ml-2 text-primary">Saving...</span>}
                                            {!isSaving && lastSaved && <span className="ml-2 text-green-500">✓ Saved</span>}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {!isPreviewMode && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => {
                                        if (isPreviewMode) {
                                            setIsPreviewMode(false)
                                        } else {
                                            router.push('/demos')
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-all flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Close
                                </button>
                                <button
                                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg shadow-md transition-all flex items-center gap-2 ${isPreviewMode
                                        ? 'bg-foreground text-background hover:bg-foreground/90'
                                        : 'bg-primary text-white hover:bg-primary/90'
                                        }`}
                                >
                                    <Play className={`w-4 h-4 ${isPreviewMode ? 'fill-current' : ''}`} />
                                    {isPreviewMode ? 'Editor' : 'Preview'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content with flexbox layout - Left sidebar + Center preview */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Slide Thumbnails */}
                {!isPreviewMode && (
                    <div className="w-80 min-w-[280px] max-w-[400px] flex-shrink-0 overflow-hidden">
                        <SlideSidebar />
                    </div>
                )}

                {/* Center Panel - Main Slide Preview */}
                <div className="flex-1 h-full flex flex-col overflow-hidden bg-playground">
                    {!isPreviewMode && (
                        <div className="shrink-0">
                            <EditorToolbar
                                isZoomActive={isZoomMode}
                                onZoomClick={handleZoomClick}
                                canZoom={canZoom}
                                isHotspotActive={isHotspotMode}
                                onHotspotClick={handleHotspotClick}
                                canAddHotspot={true}
                                isBlurActive={isBlurMode}
                                onBlurClick={handleBlurClick}
                                isCropActive={isCropMode}
                                onCropClick={handleCropClick}
                            />
                        </div>
                    )}
                    <div className={`flex-1 overflow-auto flex items-center justify-center ${isPreviewMode ? 'p-0' : 'p-6'}`}>
                        <ClickSlideDeck
                            recording={clickRecording}
                            currentSlideIndex={selectedSlideIndex}
                            onSlideChange={handleSlideChange}
                            viewOnly={isPreviewMode}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

