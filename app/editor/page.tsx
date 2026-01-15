'use client'

import { useRef, useCallback } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { Save, Trash2, FileJson } from 'lucide-react'
import { useEditorStore } from './store'
import { DropZone } from './components/DropZone'
import { Player, type PlayerHandle } from './components/Player'
import { Timeline } from './components/Timeline'
import { AnnotationCard } from './components/AnnotationCard'

export default function EditorPage() {
    const isLoaded = useEditorStore((state) => state.isLoaded)
    const events = useEditorStore((state) => state.events)
    const exportProject = useEditorStore((state) => state.exportProject)
    const clearProject = useEditorStore((state) => state.clearProject)
    const clickEvents = useEditorStore((state) => state.clickEvents)

    const playerRef = useRef<PlayerHandle>(null)

    const handleEventSelect = useCallback((timestamp: number) => {
        if (playerRef.current) {
            playerRef.current.seekTo(timestamp)
        }
    }, [])

    // Empty state - show upload
    if (!isLoaded) {
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

    // Editor state - show split pane
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
                                    {events.length} events • {clickEvents.length} interactions detected
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
                                <Save className="w-4 h-4" />
                                Save Project
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main content with resizable panels */}
            <Group orientation="horizontal" className="flex-1">
                {/* Left Panel - Player */}
                <Panel defaultSize="65%" minSize="40%">
                    <div className="h-full p-6 overflow-auto flex items-center justify-center">
                        <Player ref={playerRef} events={events} />
                    </div>
                </Panel>

                {/* Resize Handle */}
                <Separator className="w-1.5 bg-foreground/5 hover:bg-primary/30 transition-colors cursor-col-resize" />

                {/* Right Panel - Timeline & Annotations */}
                <Panel defaultSize="35%" minSize="25%">
                    <div className="h-full bg-surface border-l border-foreground/10 flex flex-col overflow-hidden">
                        <div className="flex-1 overflow-y-auto">
                            <Timeline onEventSelect={handleEventSelect} />
                        </div>
                        <AnnotationCard />
                    </div>
                </Panel>
            </Group>
        </div>
    )
}
