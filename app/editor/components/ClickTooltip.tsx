'use client'

import { useState } from 'react'
import { MessageCircle, X, Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'

interface ClickTooltipProps {
    x: number
    y: number
    text: string
    isEditing: boolean
    onTextChange: (text: string) => void
    onStartEdit: () => void
    onFinishEdit: () => void
    containerWidth: number
    containerHeight: number
    onPrevious?: () => void
    onNext?: () => void
    canGoPrevious?: boolean
    canGoNext?: boolean
    isTransitioning?: boolean
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    onDelete?: () => void
}

export function ClickTooltip({
    x,
    y,
    text,
    isEditing,
    onTextChange,
    onStartEdit,
    onFinishEdit,
    containerWidth,
    containerHeight,
    onPrevious,
    onNext,
    canGoPrevious = false,
    canGoNext = false,
    isTransitioning = false,
    primaryColor = '#b05a36',
    secondaryColor = '#b05a36',
    accentColor = '#b05a36',
    onDelete,
}: ClickTooltipProps) {
    const [localText, setLocalText] = useState(text)

    // Position the tooltip - try to keep it in bounds
    const tooltipWidth = 280
    const tooltipHeight = 160 // Increased height to accommodate navigation buttons
    const padding = 16
    const cursorOffset = 30

    // Default position: to the right and below cursor
    let tooltipX = x + cursorOffset
    let tooltipY = y + cursorOffset

    // Adjust if going off right edge
    if (tooltipX + tooltipWidth > containerWidth - padding) {
        tooltipX = x - tooltipWidth - cursorOffset
    }

    // Adjust if going off bottom edge
    if (tooltipY + tooltipHeight > containerHeight - padding) {
        tooltipY = y - tooltipHeight - cursorOffset
    }

    // Ensure minimum position
    tooltipX = Math.max(padding, tooltipX)
    tooltipY = Math.max(padding, tooltipY)

    const handleSave = () => {
        onTextChange(localText)
        onFinishEdit()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setLocalText(text)
            onFinishEdit()
        } else if (e.key === 'Enter' && e.metaKey) {
            handleSave()
        }
    }

    const displayText = text || 'Click to add description...'

    return (
        <div
            className="absolute z-30 transition-all duration-300 ease-out"
            style={{
                left: tooltipX,
                top: tooltipY,
                width: tooltipWidth,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Tooltip card */}
            <div className="bg-background border-2 rounded-xl shadow-xl overflow-hidden" style={{ borderColor: primaryColor }}>
                {/* Header */}
                <div className="px-3 py-2 border-b flex items-center justify-between" style={{ backgroundColor: primaryColor + '10', borderColor: primaryColor + '30' }}>
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" style={{ color: primaryColor }} />
                        <span className="text-xs font-semibold" style={{ color: primaryColor }}>Step Description</span>
                    </div>
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="p-1 rounded hover:bg-primary/20 transition-colors"
                            style={{ color: primaryColor }}
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            {onDelete && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete()
                                    }}
                                    className="p-1 rounded hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-colors"
                                    title="Delete hotspot"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button
                                onClick={onStartEdit}
                                className="text-xs hover:text-primary transition-colors"
                                style={{ color: primaryColor + 'B0' }}
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3">
                    {isEditing ? (
                        <textarea
                            value={localText}
                            onChange={(e) => setLocalText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what happens when you click here..."
                            className="w-full h-16 text-sm bg-background border rounded-lg px-3 py-2 focus:outline-none resize-none"
                            style={{ borderColor: 'var(--foreground-10, #e5e7eb)', outlineColor: primaryColor }}
                            autoFocus
                        />
                    ) : (
                        <p
                            className={`text-sm leading-relaxed ${text ? 'text-foreground' : 'text-foreground/40 italic'}`}
                            onClick={onStartEdit}
                        >
                            {displayText}
                        </p>
                    )}
                </div>

                {/* Footer hint */}
                {isEditing && (
                    <div className="px-3 pb-2">
                        <p className="text-xs text-foreground/40">
                            Press <kbd className="px-1 py-0.5 bg-foreground/10 rounded font-mono">⌘ Enter</kbd> to save
                        </p>
                    </div>
                )}

                {/* Navigation Controls */}
                {(onPrevious || onNext) && (
                    <div className="px-3 pb-3 pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: primaryColor + '20' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onPrevious && canGoPrevious && !isTransitioning && !isEditing) {
                                    onPrevious();
                                }
                            }}
                            disabled={!canGoPrevious || isTransitioning || isEditing}
                            className={`
                                flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                                transition-all duration-200
                                ${!canGoPrevious || isTransitioning || isEditing
                                    ? 'bg-foreground/5 text-foreground/30 cursor-not-allowed'
                                    : 'bg-transparent border text-foreground hover:bg-primary/5'
                                }
                            `}
                            style={!canGoPrevious && !isTransitioning && !isEditing ? {} : { borderColor: secondaryColor + '40' }}
                        >
                            <ChevronLeft className="w-3 h-3" />
                            Previous
                        </button>


                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onNext && canGoNext && !isTransitioning && !isEditing) {
                                    onNext();
                                }
                            }}
                            disabled={!canGoNext || isTransitioning || isEditing}
                            className={`
                                flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                                transition-all duration-200
                                ${!canGoNext || isTransitioning || isEditing
                                    ? 'bg-foreground/5 text-foreground/30 cursor-not-allowed'
                                    : 'text-white hover:opacity-90 shadow-md'
                                }
                            `}
                            style={!canGoNext || isTransitioning || isEditing ? {} : { backgroundColor: accentColor }}
                        >
                            Next
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
