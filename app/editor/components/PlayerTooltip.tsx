'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PlayerTooltipProps {
    x: number
    y: number
    text: string
    containerWidth: number
    containerHeight: number
    onPrevious?: () => void
    onNext?: () => void
    canGoPrevious?: boolean
    canGoNext?: boolean
    isTransitioning?: boolean
    scale?: number
}

export function PlayerTooltip({
    x,
    y,
    text,
    containerWidth,
    containerHeight,
    onPrevious,
    onNext,
    canGoPrevious = false,
    canGoNext = false,
    isTransitioning = false,
    scale = 1,
}: PlayerTooltipProps) {
    // Position the tooltip - try to keep it in bounds
    const tooltipWidth = 260
    const tooltipHeight = 100
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

    const displayText = text || 'No description available'

    return (
        <div
            className="absolute z-30 transition-all duration-300 ease-out"
            style={{
                left: tooltipX,
                top: tooltipY,
                width: tooltipWidth,
                transform: `scale(${Math.max(0.7, scale)})`,
                transformOrigin: 'top left',
            }}
        >
            {/* Simple tooltip card with rustic theme */}
            <div
                className="rounded-lg shadow-xl overflow-hidden"
                style={{
                    backgroundColor: '#b05a36', // Rustic/Terracotta color
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
            >
                {/* Content */}
                <div className="px-4 py-3">
                    <p
                        className="text-sm leading-relaxed"
                        style={{
                            color: '#f5eedc', // Off-white/Cream color
                        }}
                    >
                        {displayText}
                    </p>
                </div>

                {/* Navigation Controls */}
                {(onPrevious || onNext) && (
                    <div
                        className="px-3 pb-3 pt-2 flex items-center justify-between gap-2"
                        style={{
                            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                    >
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onPrevious && canGoPrevious && !isTransitioning) {
                                    onPrevious();
                                }
                            }}
                            disabled={!canGoPrevious || isTransitioning}
                            className={`
                                flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                                transition-all duration-200
                            `}
                            style={{
                                backgroundColor: !canGoPrevious || isTransitioning
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'rgba(255, 255, 255, 0.2)',
                                color: !canGoPrevious || isTransitioning
                                    ? 'rgba(245, 238, 220, 0.4)'
                                    : '#f5eedc',
                                cursor: !canGoPrevious || isTransitioning ? 'not-allowed' : 'pointer',
                            }}
                        >
                            <ChevronLeft className="w-3 h-3" />
                            Previous
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onNext && canGoNext && !isTransitioning) {
                                    onNext();
                                }
                            }}
                            disabled={!canGoNext || isTransitioning}
                            className={`
                                flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium
                                transition-all duration-200
                            `}
                            style={{
                                backgroundColor: !canGoNext || isTransitioning
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : '#f5eedc',
                                color: !canGoNext || isTransitioning
                                    ? 'rgba(245, 238, 220, 0.4)'
                                    : '#b05a36',
                                cursor: !canGoNext || isTransitioning ? 'not-allowed' : 'pointer',
                            }}
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
