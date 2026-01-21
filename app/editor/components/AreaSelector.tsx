'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Check, X, Move, Maximize2 } from 'lucide-react'

interface AreaRect {
    x: number
    y: number
    width: number
    height: number
}

interface AreaSelectorProps {
    containerWidth: number
    containerHeight: number
    originalWidth: number
    originalHeight: number
    scale: number
    initialRect?: AreaRect
    onConfirm: (rect: AreaRect) => void
    onCancel: () => void
    label: string
    color?: string
}

const MIN_SIZE = 10

export function AreaSelector({
    containerWidth,
    containerHeight,
    originalWidth,
    originalHeight,
    scale,
    initialRect,
    onConfirm,
    onCancel,
    label,
    color = '#b05a36',
}: AreaSelectorProps) {
    // Store coordinates in original (unscaled) viewport space
    const [rect, setRect] = useState<AreaRect>(() => {
        if (initialRect) {
            return {
                x: initialRect.x,
                y: initialRect.y,
                width: initialRect.width,
                height: initialRect.height,
            }
        }
        // Use 1/4th of the screen area centered
        const width = originalWidth / 4
        const height = originalHeight / 4
        const x = (originalWidth - width) / 2
        const y = (originalHeight - height) / 2

        return { x, y, width, height }
    })

    const [isDragging, setIsDragging] = useState(false)
    const [isResizing, setIsResizing] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [rectStart, setRectStart] = useState<AreaRect>({ x: 0, y: 0, width: 0, height: 0 })

    // Convert original coordinates to scaled display coordinates
    const displayRect = {
        x: rect.x * scale,
        y: rect.y * scale,
        width: rect.width * scale,
        height: rect.height * scale,
    }

    // Handle mouse move for dragging and resizing
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging && !isResizing) return

        const dx = (e.clientX - dragStart.x) / scale
        const dy = (e.clientY - dragStart.y) / scale

        if (isDragging) {
            let newX = rectStart.x + dx
            let newY = rectStart.y + dy

            newX = Math.max(0, Math.min(newX, originalWidth - rect.width))
            newY = Math.max(0, Math.min(newY, originalHeight - rect.height))

            setRect(prev => ({ ...prev, x: newX, y: newY }))
        } else if (isResizing) {
            let newWidth = rectStart.width + dx
            let newHeight = rectStart.height + dy

            newWidth = Math.max(MIN_SIZE, newWidth)
            newHeight = Math.max(MIN_SIZE, newHeight)

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

    return (
        <div className="absolute inset-0 z-40" style={{ cursor: isDragging ? 'grabbing' : 'default' }}>
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />

            <div
                className="absolute bg-transparent border-2 shadow-lg"
                style={{
                    left: displayRect.x,
                    top: displayRect.y,
                    width: displayRect.width,
                    height: displayRect.height,
                    borderColor: color,
                    boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.3)`,
                }}
            >
                {/* Clear the inner area */}
                <div className="absolute inset-0 bg-transparent" />

                {/* Drag handle */}
                <div
                    className="absolute inset-0 cursor-grab active:cursor-grabbing flex items-center justify-center"
                    onMouseDown={handleDragStart}
                >
                    <div className="px-3 py-1 bg-white/90 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider shadow-lg" style={{ color }}>
                        <Move className="w-3 h-3" />
                        {label}
                    </div>
                </div>

                {/* Resize handle */}
                <div
                    className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center bg-white/90 rounded-tl-lg shadow-sm"
                    onMouseDown={handleResizeStart}
                >
                    <Maximize2 className="w-3 h-3 rotate-90" style={{ color }} />
                </div>
            </div>

            {/* Controls */}
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
                    className="px-3 py-1.5 bg-surface border border-foreground/10 rounded-lg text-[13px] font-semibold text-foreground hover:bg-foreground/5 transition-all shadow-xl flex items-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Cancel
                </button>
                <button
                    onClick={() => onConfirm(rect)}
                    className="px-3 py-1.5 text-white rounded-lg text-[13px] font-bold transition-all shadow-xl flex items-center gap-2"
                    style={{ backgroundColor: color }}
                >
                    <Check className="w-4 h-4" />
                    Apply {label}
                </button>
            </div>
        </div>
    )
}
