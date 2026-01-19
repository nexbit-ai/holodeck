'use client'

import { useState } from 'react'
import { MessageCircle, X, Check, ChevronLeft, ChevronRight, ZoomIn, Trash2 } from 'lucide-react'

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
    hasZoom?: boolean
    onZoomClick?: () => void
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
    hasZoom = false,
    onZoomClick,
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
        >
            {/* Tooltip card */}
            <div className="bg-surface border-2 border-primary rounded-xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-3 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">Step Description</span>
                    </div>
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="p-1 rounded hover:bg-primary/20 text-primary transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onStartEdit}
                            className="text-xs text-primary/70 hover:text-primary transition-colors"
                        >
                            Edit
                        </button>
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
                            className="w-full h-16 text-sm bg-background border border-foreground/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none"
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
                    <div className="px-3 pb-3 pt-2 border-t border-primary/10 flex items-center justify-between gap-2">
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
                                    : 'bg-surface border border-foreground/10 text-foreground hover:bg-primary/5 hover:border-primary/30'
                                }
                            `}
                        >
                            <ChevronLeft className="w-3 h-3" />
                            Previous
                        </button>

                        {/* Zoom Preview button */}
                        {onZoomClick && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isTransitioning && !isEditing) {
                                        onZoomClick();
                                    }
                                }}
                                disabled={isTransitioning || isEditing}
                                className={`
                                    flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                                    transition-all duration-200
                                    ${hasZoom
                                        ? 'bg-primary/20 text-primary border border-primary/30'
                                        : 'bg-surface border border-foreground/10 text-foreground/70 hover:bg-primary/5 hover:border-primary/30 hover:text-primary'
                                    }
                                    ${isTransitioning || isEditing ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                title={hasZoom ? "Edit zoom area" : "Add zoom effect"}
                            >
                                <ZoomIn className="w-3 h-3" />
                                {hasZoom ? 'Zoom' : 'Zoom'}
                            </button>
                        )}

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
                                    : 'bg-primary text-white hover:bg-primary/90 shadow-md'
                                }
                            `}
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
