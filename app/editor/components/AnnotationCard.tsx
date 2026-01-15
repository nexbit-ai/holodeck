'use client'

import { useState, useEffect } from 'react'
import { Edit3, Save, X } from 'lucide-react'
import { useEditorStore } from '../store'

export function AnnotationCard() {
    const selectedEventId = useEditorStore((state) => state.selectedEventId)
    const clickEvents = useEditorStore((state) => state.clickEvents)
    const annotations = useEditorStore((state) => state.annotations)
    const updateAnnotation = useEditorStore((state) => state.updateAnnotation)
    const setSelectedEvent = useEditorStore((state) => state.setSelectedEvent)

    const [label, setLabel] = useState('')
    const [script, setScript] = useState('')
    const [isSaved, setIsSaved] = useState(false)

    // Find the selected event
    const selectedEvent = clickEvents.find((e) => e.id === selectedEventId)
    const existingAnnotation = selectedEventId ? annotations[selectedEventId] : null

    // Sync form state with existing annotation
    useEffect(() => {
        if (existingAnnotation) {
            setLabel(existingAnnotation.label)
            setScript(existingAnnotation.script)
        } else {
            setLabel('')
            setScript('')
        }
        setIsSaved(false)
    }, [selectedEventId, existingAnnotation])

    if (!selectedEventId || !selectedEvent) {
        return (
            <div className="p-4 border-t border-foreground/10">
                <div className="text-center py-6 text-foreground/40">
                    <Edit3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Select an event to add annotations</p>
                </div>
            </div>
        )
    }

    const handleSave = () => {
        if (!selectedEventId) return

        updateAnnotation(selectedEventId, {
            label: label || selectedEvent.type,
            script,
        })
        setIsSaved(true)

        // Reset saved indicator after delay
        setTimeout(() => setIsSaved(false), 2000)
    }

    const handleClose = () => {
        setSelectedEvent(null)
    }

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
                    {selectedEvent.type} at <span className="font-mono">{selectedEvent.formattedTime}</span>
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
                        placeholder={selectedEvent.type}
                        className="w-full px-3 py-2 text-sm bg-background border border-foreground/10 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-foreground/70 mb-1.5">
                        AI Agent Script
                    </label>
                    <textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="What should the AI say at this step?"
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
