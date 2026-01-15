'use client'

import { MousePointerClick, Clock } from 'lucide-react'
import { useEditorStore } from '../store'

interface TimelineProps {
    onEventSelect: (timestamp: number) => void
}

export function Timeline({ onEventSelect }: TimelineProps) {
    const clickEvents = useEditorStore((state) => state.clickEvents)
    const selectedEventId = useEditorStore((state) => state.selectedEventId)
    const setSelectedEvent = useEditorStore((state) => state.setSelectedEvent)
    const annotations = useEditorStore((state) => state.annotations)

    const handleEventClick = (eventId: string, timestamp: number) => {
        setSelectedEvent(eventId)
        onEventSelect(timestamp)
    }

    if (clickEvents.length === 0) {
        return (
            <div className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-primary" />
                    Interaction Timeline
                </h2>
                <div className="text-center py-8 text-foreground/50">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No click events found</p>
                    <p className="text-xs mt-1">The recording may not contain any interactions</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2 px-2">
                <MousePointerClick className="w-5 h-5 text-primary" />
                Interaction Timeline
            </h2>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
                {clickEvents.map((event, index) => {
                    const isSelected = selectedEventId === event.id
                    const hasAnnotation = annotations[event.id]

                    return (
                        <button
                            key={event.id}
                            onClick={() => handleEventClick(event.id, event.timestamp)}
                            className={`
                w-full text-left p-3 rounded-lg transition-all duration-200
                border-2 group
                ${isSelected
                                    ? 'bg-primary text-white border-primary shadow-md'
                                    : 'bg-surface border-transparent hover:border-primary/30 hover:bg-primary/5'
                                }
              `}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                    ${isSelected ? 'bg-white/20' : 'bg-primary/10 text-primary'}
                  `}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}>
                                            {hasAnnotation?.label || event.type}
                                        </p>
                                        <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-foreground/50'}`}>
                                            at {event.formattedTime}
                                        </p>
                                    </div>
                                </div>

                                {hasAnnotation && (
                                    <span className={`
                    px-2 py-0.5 rounded-full text-xs
                    ${isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}
                  `}>
                                        Annotated
                                    </span>
                                )}
                            </div>
                        </button>
                    )
                })}
            </div>

            <div className="mt-4 pt-4 border-t border-foreground/10 px-2">
                <p className="text-xs text-foreground/40">
                    {clickEvents.length} interaction{clickEvents.length !== 1 ? 's' : ''} detected
                </p>
            </div>
        </div>
    )
}
