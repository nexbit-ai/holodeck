'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Check, X, Move, Maximize2 } from 'lucide-react'
import type { ZoomPan } from '../types/recording'

interface ZoomPanSelectorProps {
    containerWidth: number
    containerHeight: number
    originalWidth: number
    originalHeight: number
    scale: number
    clickX?: number
    clickY?: number
    initialZoomPan?: ZoomPan
    onConfirm: (zoomPan: ZoomPan) => void
    onCancel: () => void
}

const DEFAULT_WIDTH = 400
const DEFAULT_HEIGHT = 300
const MIN_SIZE = 100

export function ZoomPanSelector({
    containerWidth,
    containerHeight,
    originalWidth,
    originalHeight,
    scale,
    clickX,
    clickY,
    initialZoomPan,
    onConfirm,
    onCancel,
}: ZoomPanSelectorProps) {
    // Store coordinates in original (unscaled) viewport space
    const [rect, setRect] = useState(() => {
        if (initialZoomPan && initialZoomPan.enabled) {
            return {
                x: initialZoomPan.x,
                y: initialZoomPan.y,
                width: initialZoomPan.width,
                height: initialZoomPan.height,
            }
        }
        // Use 1/4th of the screen area (1/2 width and 1/2 height)
        const width = originalWidth / 2
        const height = originalHeight / 2

        // Center selection around click point (or center of screen), then clamp to screen bounds
        const targetX = clickX ?? originalWidth / 2
        const targetY = clickY ?? originalHeight / 2

        const x = Math.max(0, Math.min(targetX - width / 2, originalWidth - width))
        const y = Math.max(0, Math.min(targetY - height / 2, originalHeight - height))

        return { x, y, width, height }
    })

    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [rectStart, setRectStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

    const containerRef = useRef<HTMLDivElement>(null)

    // Convert original coordinates to scaled display coordinates
    const displayRect = {
        x: rect.x * scale,
        y: rect.y * scale,
        width: rect.width * scale,
        height: rect.height * scale,
    }

    // Calculate zoom preview info
    const zoomScale = Math.min(
        originalWidth / rect.width,
        originalHeight / rect.height
    )

    // Handle mouse move for dragging and resizing
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging && !isResizing) return

        const dx = (e.clientX - dragStart.x) / scale
        const dy = (e.clientY - dragStart.y) / scale

        if (isDragging) {
            // Move the rectangle
            let newX = rectStart.x + dx
            let newY = rectStart.y + dy

            // Clamp to bounds
            newX = Math.max(0, Math.min(newX, originalWidth - rect.width))
            newY = Math.max(0, Math.min(newY, originalHeight - rect.height))

            setRect(prev => ({ ...prev, x: newX, y: newY }))
        } else if (isResizing) {
            // Resize from bottom-right corner
            let newWidth = rectStart.width + dx
            let newHeight = rectStart.height + dy

            // Clamp to minimum size
            newWidth = Math.max(MIN_SIZE, newWidth)
            newHeight = Math.max(MIN_SIZE, newHeight)

            // Clamp to container bounds
            newWidth = Math.min(newWidth, originalWidth - rect.x)
            newHeight = Math.min(newHeight, originalHeight - rect.y)

            setRect(prev => ({ ...prev, width: newWidth, height: newHeight }))
        }
    }, [isDragging, isResizing, dragStart, rectStart, scale, rect.width, rect.height, rect.x, rect.y, originalWidth, originalHeight])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        setIsResizing(false)
    }, [])

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
            return () => {
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }
        }
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

    const handleDragStart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        setRectStart({ ...rect })
    }

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        setRectStart({ ...rect })
    }

    const handleConfirm = () => {
        onConfirm({
            enabled: true,
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
        })
    }

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-40"
            style={{ cursor: isDragging ? 'grabbing' : 'default' }}
        >
            {/* Semi-transparent overlay outside selection */}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            {/* Selection rectangle cutout */}
            <div
                className="absolute bg-transparent border-2 border-primary shadow-lg"
                style={{
                    left: displayRect.x,
                    top: displayRect.y,
                    width: displayRect.width,
                    height: displayRect.height,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
                }}
            >
                {/* Clear the inner area */}
                <div className="absolute inset-0 bg-transparent" />

                {/* Drag handle (center) */}
                <div
                    className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
                    onMouseDown={handleDragStart}
                >
                    <div className="px-3 py-1.5 bg-primary/90 rounded-full flex items-center gap-2 text-white text-xs font-medium shadow-lg">
                        <Move className="w-3 h-3" />
                        Drag to move
                    </div>
                </div>

                {/* Resize handle (bottom-right corner) */}
                <div
                    className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-tl-lg cursor-se-resize flex items-center justify-center"
                    onMouseDown={handleResizeStart}
                >
                    <Maximize2 className="w-3 h-3 text-white rotate-90" />
                </div>

                {/* Corner indicators */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
            </div>

            {/* Control buttons */}
            <div
                className="absolute flex items-center gap-2"
                style={{
                    left: displayRect.x + displayRect.width / 2,
                    top: displayRect.y + displayRect.height + 12,
                    transform: 'translateX(-50%)',
                }}
            >
                <button
                    onClick={onCancel}
                    className="px-3 py-1.5 bg-surface border border-foreground/20 rounded-lg text-sm font-medium text-foreground hover:bg-foreground/5 transition-colors flex items-center gap-1.5 shadow-lg"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button
                    onClick={handleConfirm}
                    className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-lg"
                >
                    <Check className="w-4 h-4" />
                    Apply Zoom ({zoomScale.toFixed(1)}x)
                </button>
            </div>

            {/* Zoom preview info */}
            <div
                className="absolute px-2 py-1 bg-background/90 backdrop-blur-sm rounded text-xs text-foreground border border-foreground/10"
                style={{
                    left: displayRect.x,
                    top: displayRect.y - 28,
                }}
            >
                Zoom Area: {Math.round(rect.width)} × {Math.round(rect.height)}px
            </div>
        </div>
    )
}
