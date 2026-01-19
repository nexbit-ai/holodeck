'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { X, FileJson, Loader2, ArrowLeft, Download } from 'lucide-react'
import { useEditorStore } from '../store'
import { ClickSlideDeck } from '../components/ClickSlideDeck'
import { SlideSidebar } from '../components/SlideSidebar'
import { isClickRecording } from '../types/recording'
import Link from 'next/link'

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

    const handleClear = useCallback(() => {
        clearProject()
        router.push('/demos')
    }, [clearProject, router])

    // Load the recording from API
    useEffect(() => {
        async function loadRecordingData() {
            if (!id) return

            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(`/api/recordings?id=${encodeURIComponent(id)}`)
                const data = await response.json()

                if (!response.ok || data.error) {
                    setError(data.error || 'Recording not found')
                    setIsLoading(false)
                    return
                }

                const content = data.content

                // Check if it's the click-only format (v2.0)
                if (isClickRecording(content)) {
                    if (content.snapshots.length === 0) {
                        setError('The recording file has no snapshots')
                        setIsLoading(false)
                        return
                    }
                    loadRecording(content, id)  // Pass ID for auto-save
                    setIsLoading(false)
                    return
                }

                // Also check for project files that contain a recording
                if (content?.recording && isClickRecording(content.recording)) {
                    if (content.recording.snapshots.length === 0) {
                        setError('The recording file has no snapshots')
                        setIsLoading(false)
                        return
                    }
                    loadRecording(content.recording, id)  // Pass ID for auto-save
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
                            <Link
                                href="/demos"
                                className="p-2 rounded-lg hover:bg-foreground/5 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-foreground/60" />
                            </Link>
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
                                onClick={() => exportProject()}
                                className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-all flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={handleClear}
                                className="px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-all flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Close
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
                <div className="flex-1 h-full p-6 overflow-auto flex items-center justify-center bg-background">
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

