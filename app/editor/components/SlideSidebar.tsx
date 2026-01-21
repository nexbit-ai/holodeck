'use client'

import { SlideThumbnail } from './SlideThumbnail'
import { AddStepMenu } from './AddStepMenu'
import { useEditorStore, type AnnotatedSnapshot } from '../store'
import { MousePointerClick } from 'lucide-react'

export function SlideSidebar() {
    const clickRecording = useEditorStore((state) => state.clickRecording)
    const selectedSlideIndex = useEditorStore((state) => state.selectedSlideIndex)
    const setSelectedSlide = useEditorStore((state) => state.setSelectedSlide)
    const deleteSnapshot = useEditorStore((state) => state.deleteSnapshot)

    const snapshots = (clickRecording?.snapshots || []) as AnnotatedSnapshot[]

    // Get slide label
    const getSlideLabel = (index: number): string => {
        const snapshot = snapshots[index]
        if (!snapshot) return ''

        // Use annotation label if available
        if (snapshot.annotation?.label) {
            return snapshot.annotation.label
        }

        if (snapshot.type === 'cover') return 'Cover Screen'
        if (snapshot.type === 'start') return 'Start Recording'
        if (snapshot.type === 'end') return 'End Screen'

        // Find which click number this is
        let clickCount = 0
        for (let i = 0; i <= index; i++) {
            if (snapshots[i].type === 'click') clickCount++
        }
        return `Click ${clickCount}`
    }

    // Get the last URL for "record more" functionality
    const getLastUrl = (): string => {
        if (snapshots.length === 0) return ''
        return snapshots[snapshots.length - 1].url
    }

    // Handle "Record More Steps" action
    const handleRecordMore = (url: string) => {
        // Open a new tab with the URL
        // The extension should detect this and offer to record
        window.open(url, '_blank')
    }

    // Handle slide click
    const handleSlideClick = (index: number) => {
        setSelectedSlide(index)
    }

    // Handle slide delete
    const handleSlideDelete = (index: number) => {
        deleteSnapshot(index)
    }

    const clickCount = snapshots.filter(s => s.type === 'click').length

    if (snapshots.length === 0) {
        return (
            <div className="h-full flex items-center justify-center p-4 bg-surface/50">
                <p className="text-foreground/40 text-sm text-center">
                    No slides yet
                </p>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-surface/50 border-r border-foreground/10">
            {/* Header */}
            <div className="p-3 border-b border-foreground/10">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-primary" />
                    Slides
                </h2>
                <p className="text-xs text-foreground/40 mt-0.5">
                    {snapshots.length} steps • {clickCount} clicks
                </p>
            </div>

            {/* Slides list with Add Step buttons */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {snapshots.map((snapshot, index) => (
                    <div key={`${snapshot.type}-${snapshot.timestamp}-${index}`}>
                        {/* Slide Thumbnail */}
                        <SlideThumbnail
                            snapshot={snapshot}
                            index={index + 1}
                            isSelected={selectedSlideIndex === index}
                            slideLabel={getSlideLabel(index)}
                            onClick={() => handleSlideClick(index)}
                            onDelete={() => handleSlideDelete(index)}
                            canDelete={snapshots.length > 1}
                        />

                        {/* Add Step Menu after each slide */}
                        <div className="mt-2">
                            <AddStepMenu
                                insertIndex={index + 1}
                                lastUrl={getLastUrl()}
                                onRecordMore={handleRecordMore}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
