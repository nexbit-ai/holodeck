'use client'

import { useEffect, useRef, useState } from 'react'
import { MousePointerClick, Play, Trash2, Layout, CheckCircle } from 'lucide-react'
import type { AnnotatedSnapshot } from '../store'
import { EventType } from '../types/recording'

interface SlideThumbnailProps {
    snapshot: AnnotatedSnapshot
    index: number
    isSelected: boolean
    onClick: () => void
    onDelete?: () => void
    canDelete: boolean
}

export function SlideThumbnail({
    snapshot,
    index,
    isSelected,
    onClick,
    onDelete,
    canDelete,
}: SlideThumbnailProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [containerWidth, setContainerWidth] = useState(200)

    const originalWidth = snapshot.viewportWidth || 1920
    const originalHeight = snapshot.viewportHeight || 1080

    // Calculate height based on aspect ratio
    const aspectRatio = originalHeight / originalWidth
    const thumbnailHeight = Math.round(containerWidth * aspectRatio)
    const scale = containerWidth / originalWidth

    const isStart = snapshot.type === 'start' || snapshot.type === EventType.START
    const isCover = snapshot.type === 'cover' || snapshot.type === EventType.COVER
    const isEnd = snapshot.type === 'end' || snapshot.type === EventType.END
    const isClick = snapshot.type === 'click' || snapshot.type === EventType.CLICK
    const hasAnnotation = !!snapshot.annotation?.script

    // Measure container width on mount and resize
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const width = containerRef.current.offsetWidth
                if (width > 0) {
                    setContainerWidth(width)
                }
            }
        }

        updateWidth()

        // Use ResizeObserver for dynamic updates
        const resizeObserver = new ResizeObserver(updateWidth)
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current)
        }

        return () => resizeObserver.disconnect()
    }, [])

    // Load HTML into iframe
    useEffect(() => {
        if (!iframeRef.current) return

        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document

        if (doc) {
            doc.open()
            let html = snapshot.html
            // Add base tag to resolve relative assets (fonts, etc)
            const baseTag = snapshot.url ? `<base href="${snapshot.url}">` : ''

            if (/<head[^>]*>/i.test(html)) {
                html = html.replace(/<head[^>]*>/i, `$&${baseTag}`)
            } else if (/<html[^>]*>/i.test(html)) {
                html = html.replace(/<html[^>]*>/i, `$&<head>${baseTag}</head>`)
            } else {
                html = baseTag + html
            }

            doc.write(html)
            doc.close()

            // Apply scroll position
            setTimeout(() => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.scrollTo(snapshot.scrollX, snapshot.scrollY)
                }
            }, 50)
        }
    }, [snapshot])

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (onDelete && canDelete) {
            if (confirm('Delete this slide?')) {
                onDelete()
            }
        }
    }

    return (
        <div
            ref={containerRef}
            className={`
                relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 w-full
                ${isSelected
                    ? 'border-primary shadow-lg shadow-primary/20'
                    : 'border-foreground/10 hover:border-primary/40'
                }
            `}
            onClick={onClick}
        >
            {/* Slide number badge */}
            <div className={`
                absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${isSelected ? 'bg-primary text-white' : 'bg-background/90 text-foreground'}
            `}>
                {index}
            </div>

            {/* Click indicator */}
            {isClick && (
                <div className="absolute top-2 right-2 z-10">
                    <MousePointerClick className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-foreground/50'}`} />
                </div>
            )}

            {/* Annotated badge */}
            {hasAnnotation && (
                <div className={`
                    absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded text-xs font-medium
                    ${isSelected ? 'bg-primary/80 text-white' : 'bg-green-500/20 text-green-600'}
                `}>
                    ✓
                </div>
            )}

            {/* Delete button - shown on hover */}
            {canDelete && onDelete && (
                <button
                    onClick={handleDelete}
                    className="absolute bottom-2 right-2 z-10 p-1.5 rounded bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white text-foreground/50"
                    title="Delete slide"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            )}

            {/* Thumbnail preview - responsive width */}
            <div
                className="overflow-hidden bg-gray-200 w-full"
                style={{
                    height: thumbnailHeight,
                }}
            >
                <div
                    style={{
                        width: originalWidth,
                        height: originalHeight,
                        transform: `scale(${scale})`,
                        transformOrigin: 'top left',
                        pointerEvents: 'none',
                    }}
                >
                    <iframe
                        ref={iframeRef}
                        className="border-0 bg-white"
                        style={{
                            width: originalWidth,
                            height: originalHeight,
                        }}
                        sandbox="allow-same-origin"
                        title={`Slide ${index} thumbnail`}
                    />
                </div>
            </div>

        </div>
    )
}

