'use client'

import { useCallback } from 'react'
import { Trash2, FileJson, Play } from 'lucide-react'
import { useEditorStore } from './store'
import { DropZone } from './components/DropZone'
import { ClickSlideDeck } from './components/ClickSlideDeck'
import { SlideSidebar } from './components/SlideSidebar'
import { EditorToolbar } from './components/EditorToolbar'
import { EventType } from './types/recording'

export default function EditorPage() {
    const isLoaded = useEditorStore((state) => state.isLoaded)
    const clickRecording = useEditorStore((state) => state.clickRecording)
    const clearProject = useEditorStore((state) => state.clearProject)
    const isPreviewMode = useEditorStore((state) => state.isPreviewMode)
    const setIsPreviewMode = useEditorStore((state) => state.setIsPreviewMode)
    const selectedSlideIndex = useEditorStore((state) => state.selectedSlideIndex)
    const setSelectedSlide = useEditorStore((state) => state.setSelectedSlide)
    const isSaving = useEditorStore((state) => state.isSaving)
    const lastSaved = useEditorStore((state) => state.lastSaved)
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

    const handleSlideChange = useCallback((index: number) => {
        setSelectedSlide(index)
    }, [setSelectedSlide])

    // Empty state - show upload
    if (!isLoaded || !clickRecording) {
        return (
            <div className="min-h-screen bg-background">
                <header className="border-b border-foreground/10 bg-surface/80 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <FileJson className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground tracking-tight">Demo <span className="text-primary">Editor</span></h1>
                                <p className="text-xs text-foreground/40 font-medium">Create interactive experiences from recordings</p>
                            </div>
                        </div>
                    </div>
                </header>

                <DropZone />
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
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <FileJson className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-foreground tracking-tight">Demo <span className="text-primary font-black">Editor</span></h1>
                                {!isPreviewMode && (
                                    <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">
                                        {snapshotCount} slides • {clickCount} clicks
                                        {isSaving && <span className="ml-2 text-primary animate-pulse italic">Saving...</span>}
                                        {!isSaving && lastSaved && <span className="ml-2 text-green-500 font-bold">✓ Ready</span>}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={clearProject}
                                className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-all flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear
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
                                onZoomClick={() => setZoomMode(!isZoomMode)}
                                isZoomActive={isZoomMode}
                                canZoom={clickRecording.snapshots[selectedSlideIndex]?.type === 'click' || clickRecording.snapshots[selectedSlideIndex]?.type === EventType.CLICK}
                                onHotspotClick={() => setHotspotMode(!isHotspotMode)}
                                isHotspotActive={isHotspotMode}
                                canAddHotspot={true}
                                onBlurClick={() => setBlurMode(!isBlurMode)}
                                isBlurActive={isBlurMode}
                                onCropClick={() => setCropMode(!isCropMode)}
                                isCropActive={isCropMode}
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
