'use client'

import { useState, useEffect } from 'react'
import { Edit3, Save, X } from 'lucide-react'
import { useEditorStore, type AnnotatedSnapshot } from '../store'

// Format timestamp
function formatTimestamp(ms: number, baseTime: number): string {
    const seconds = Math.floor((ms - baseTime) / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export function AnnotationCard() {
    const clickRecording = useEditorStore((state) => state.clickRecording)
    const selectedSlideIndex = useEditorStore((state) => state.selectedSlideIndex)
    const setSelectedSlide = useEditorStore((state) => state.setSelectedSlide)
    const updateAnnotation = useEditorStore((state) => state.updateAnnotation)

    const [label, setLabel] = useState('')
    const [script, setScript] = useState('')
    const [isSaved, setIsSaved] = useState(false)

    // Get the selected snapshot
    const snapshots = (clickRecording?.snapshots || []) as AnnotatedSnapshot[]
    const startTime = clickRecording?.startTime || 0
    const selectedSnapshot = snapshots[selectedSlideIndex]
    const existingAnnotation = selectedSnapshot?.annotation

    // Get default label based on snapshot type
    const getDefaultLabel = () => {
        if (!selectedSnapshot) return 'Unknown'
        if (selectedSnapshot.type === 'start') return 'Start'

        // Count clicks up to this point
        let clickNumber = 0
        for (let i = 0; i <= selectedSlideIndex; i++) {
            if (snapshots[i].type === 'click') clickNumber++
        }
        return `Click ${clickNumber}`
    }

    // Sync form state with existing annotation
    useEffect(() => {
        if (existingAnnotation) {
            setLabel(existingAnnotation.label || '')
            setScript(existingAnnotation.script || '')
        } else {
            setLabel('')
            setScript('')
        }
        setIsSaved(false)
    }, [selectedSlideIndex, existingAnnotation])

    if (!selectedSnapshot) {
        return (
            <div className="p-4 border-t border-foreground/10">
                <div className="text-center py-6 text-foreground/40">
                    <Edit3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Select a step to add annotations</p>
                </div>
            </div>
        )
    }

    const handleSave = () => {
        updateAnnotation(selectedSlideIndex, {
            label: label || getDefaultLabel(),
            script,
        })
        setIsSaved(true)

        // Reset saved indicator after delay
        setTimeout(() => setIsSaved(false), 2000)
    }

    const handleClose = () => {
        setSelectedSlide(0)
    }

    const defaultLabel = getDefaultLabel()

    return (
        <div className="p-4 border-t border-foreground/10 bg-surface">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Edit3 className="w-4 h-4 text-primary" />
                    Edit Annotation
                </h3>
                <button
                    onClick={handleClose}
                    className="p-1 rounded-md hover:bg-foreground/5 text-foreground/40 hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div className="mb-3 p-2 bg-primary/5 rounded-lg">
                <p className="text-xs text-foreground/60">
                    {defaultLabel} at <span className="font-mono">{formatTimestamp(selectedSnapshot.timestamp, startTime)}</span>
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                        Step Name
                    </label>
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder={defaultLabel}
                        className="w-full px-3 py-2 text-sm bg-background border border-foreground/10 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                        Description
                    </label>
                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Describe what happens at this step..."
                        rows={4}
                        className="w-full px-3 py-2 text-sm bg-background border border-foreground/10 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
                    />
                </div>

                <button
                    onClick={handleSave}
                    className={`
            w-full py-2.5 px-4 rounded-lg font-medium text-sm
            flex items-center justify-center gap-2 transition-all duration-200
            ${isSaved
                            ? 'bg-green-500 text-white'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
                        }
          `}
                >
                    <Save className="w-4 h-4" />
                    {isSaved ? 'Saved!' : 'Save Annotation'}
                </button>
            </div>
        </div>
    )
}
