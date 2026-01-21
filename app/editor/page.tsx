'use client'

import { useCallback } from 'react'
import { Trash2, FileJson, Download } from 'lucide-react'
import { useEditorStore } from './store'
import { DropZone } from './components/DropZone'
import { ClickSlideDeck } from './components/ClickSlideDeck'
import { SlideSidebar } from './components/SlideSidebar'

export default function EditorPage() {
    const isLoaded = useEditorStore((state) => state.isLoaded)
    const clickRecording = useEditorStore((state) => state.clickRecording)
    const exportProject = useEditorStore((state) => state.exportProject)
    const clearProject = useEditorStore((state) => state.clearProject)
    const selectedSlideIndex = useEditorStore((state) => state.selectedSlideIndex)
    const setSelectedSlide = useEditorStore((state) => state.setSelectedSlide)
    const isSaving = useEditorStore((state) => state.isSaving)
    const lastSaved = useEditorStore((state) => state.lastSaved)

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
                                <h1 className="text-xl font-bold text-foreground">Demo Editor</h1>
                                <p className="text-xs text-foreground/50">Create interactive demos from recordings</p>
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
                                <h1 className="text-lg font-bold text-foreground">Demo Editor</h1>
                                <p className="text-xs text-foreground/50">
                                    {snapshotCount} snapshots • {clickCount} clicks
                                    {isSaving && <span className="ml-2 text-primary">Saving...</span>}
                                    {!isSaving && lastSaved && <span className="ml-2 text-green-500">✓ Saved</span>}
                                </p>
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
                                onClick={exportProject}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content with flexbox layout - Left sidebar + Center preview */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Slide Thumbnails */}
                <div className="w-80 min-w-[280px] max-w-[400px] flex-shrink-0 overflow-hidden">
                    <SlideSidebar />
                </div>

                {/* Center Panel - Main Slide Preview */}
                <div className="flex-1 h-full p-6 overflow-auto flex items-center justify-center bg-playground">
                    <ClickSlideDeck
                        recording={clickRecording}
                        currentSlideIndex={selectedSlideIndex}
                        onSlideChange={handleSlideChange}
                    />
                </div>
            </div>
        </div>
    )
}
