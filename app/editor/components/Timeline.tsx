'use client'

import { MousePointerClick, Clock, Play, Save, Check, Trash2 } from 'lucide-react'
import { useEditorStore, type AnnotatedSnapshot } from '../store'
import { EventType } from '../types/recording'

// Format timestamp
function formatTimestamp(ms: number, baseTime: number): string {
    const seconds = Math.floor((ms - baseTime) / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function Timeline() {
    const clickRecording = useEditorStore((state) => state.clickRecording)
    const selectedSlideIndex = useEditorStore((state) => state.selectedSlideIndex)
    const setSelectedSlide = useEditorStore((state) => state.setSelectedSlide)
    const deleteSnapshot = useEditorStore((state) => state.deleteSnapshot)
    const isSaving = useEditorStore((state) => state.isSaving)
    const lastSaved = useEditorStore((state) => state.lastSaved)
    const recordingId = useEditorStore((state) => state.recordingId)

    const snapshots = (clickRecording?.snapshots || []) as AnnotatedSnapshot[]
    const startTime = clickRecording?.startTime || 0

    const handleSlideClick = (slideIndex: number) => {
        setSelectedSlide(slideIndex)
    }

    const handleDelete = (e: React.MouseEvent, index: number) => {
        e.stopPropagation()  // Don't trigger slide selection

        // Confirm before deleting
        const confirmMessage = snapshots.length <= 2
            ? 'This will leave only one slide. Are you sure?'
            : 'Delete this slide?'

        if (confirm(confirmMessage)) {
            deleteSnapshot(index)
        }
    }

    if (snapshots.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-primary" />
                    Steps Timeline
                </h2>
                <div className="text-center py-8 text-foreground/50">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No snapshots found</p>
                    <p className="text-xs mt-1">Record interactions to see them here</p>
                </div>
            </div>
        )
    }

    const clickCount = snapshots.filter(s => s.type === 'click' || s.type === EventType.CLICK).length

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-primary" />
                    Steps Timeline
                </h2>

                {/* Save status indicator */}
                {recordingId && (
                    <div className="flex items-center gap-2">
                        {isSaving ? (
                            <span className="flex items-center gap-1 text-xs text-foreground/50">
                                <Save className="w-3 h-3 animate-pulse" />
                                Saving...
                            </span>
                        ) : lastSaved ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                                <Check className="w-3 h-3" />
                                Saved
                            </span>
                        ) : null}
                    </div>
                )}
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {snapshots.map((snapshot, index) => {
                    const isSelected = selectedSlideIndex === index
                    const hasAnnotation = snapshot.annotation?.script
                    const isStart = snapshot.type === 'start' || snapshot.type === EventType.START
                    const canDelete = snapshots.length > 1  // Keep at least one

                    // Count clicks up to this point
                    let clickNumber = 0
                    if (!isStart) {
                        for (let i = 0; i <= index; i++) {
                            const type = snapshots[i].type
                            if (type === 'click' || type === EventType.CLICK) clickNumber++
                        }
                    }

                    // Get label from annotation or default
                    const label = snapshot.annotation?.label || (isStart ? 'Start' : `Click ${clickNumber}`)

                    return (
                        <div
                            key={`${snapshot.type}-${snapshot.timestamp}`}
                            className={`
                                w-full text-left p-3 rounded-lg transition-all duration-200
                                border-2 group relative
                                ${isSelected
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-surface border-transparent hover:border-primary/30 hover:bg-primary/5'
                                }
                            `}
                        >
                            <button
                                onClick={() => handleSlideClick(index)}
                                className="w-full text-left"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {isStart ? (
                                            <span className={`
                                                w-6 h-6 rounded-full flex items-center justify-center
                                                ${isSelected ? 'bg-white/20' : 'bg-primary/10'}
                                            `}>
                                                <Play className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-primary'}`} />
                                            </span>
                                        ) : (
                                            <span className={`
                                                w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                                                ${isSelected ? 'bg-white/20' : 'bg-primary/10 text-primary'}
                                            `}>
                                                {clickNumber}
                                            </span>
                                        )}
                                        <div>
                                            <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                                {label}
                                            </p>
                                            <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-foreground/50'}`}>
                                                {isStart ? 'Recording begins' : `at ${formatTimestamp(snapshot.timestamp, startTime)}`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pr-8">
                                        {hasAnnotation && (
                                            <span className={`
                                                px-2 py-0.5 rounded-full text-xs group-hover:opacity-0 transition-opacity
                                                ${isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}
                                            `}>
                                                Annotated
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {/* Delete button - shown on hover */}
                            {canDelete && (
                                <button
                                    onClick={(e) => handleDelete(e, index)}
                                    className={`
                                        absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg
                                        opacity-0 group-hover:opacity-100 transition-opacity
                                        ${isSelected
                                            ? 'hover:bg-white/20 text-white/70 hover:text-white'
                                            : 'hover:bg-red-50 text-foreground/30 hover:text-red-500'
                                        }
                                    `}
                                    title="Delete this slide"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-foreground/10 px-2">
                <p className="text-xs text-foreground/40">
                    {snapshots.length} step{snapshots.length !== 1 ? 's' : ''} (Start + {clickCount} click{clickCount !== 1 ? 's' : ''})
                </p>
            </div>
        </div>
    )
}
