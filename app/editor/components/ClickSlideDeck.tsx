'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play } from 'lucide-react'
import type { ClickRecording, ZoomPan } from '../types/recording'
import { useEditorStore, type AnnotatedSnapshot } from '../store'
import { MouseCursor } from './MouseCursor'
import { ClickTooltip } from './ClickTooltip'
import { PlayerTooltip } from './PlayerTooltip'
import { ZoomPanSelector } from './ZoomPanSelector'

interface ClickSlideDeckProps {
    recording: ClickRecording
    currentSlideIndex: number
    onSlideChange: (index: number) => void
    viewOnly?: boolean // When true, uses simple non-editable PlayerTooltip
}

// Display container dimensions - will be calculated dynamically
const DEFAULT_CONTAINER_WIDTH = 900
const DEFAULT_CONTAINER_HEIGHT = 550

export function ClickSlideDeck({ recording, currentSlideIndex, onSlideChange, viewOnly = false }: ClickSlideDeckProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const outerContainerRef = useRef<HTMLDivElement>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const [showCursor, setShowCursor] = useState(false)
    const [isEditingTooltip, setIsEditingTooltip] = useState(false)
    const [containerSize, setContainerSize] = useState({ width: DEFAULT_CONTAINER_WIDTH, height: DEFAULT_CONTAINER_HEIGHT })
    const [isZoomMode, setIsZoomMode] = useState(false)
    const [isZoomed, setIsZoomed] = useState(false)

    // Get annotation functions and save state from store
    const updateAnnotation = useEditorStore((state) => state.updateAnnotation)
    const updateZoomPan = useEditorStore((state) => state.updateZoomPan)
    const isSaving = useEditorStore((state) => state.isSaving)
    const lastSaved = useEditorStore((state) => state.lastSaved)

    const snapshots = recording.snapshots
    const totalSlides = snapshots.length
    const currentSnapshot = snapshots[currentSlideIndex]

    // Get the original dimensions from current snapshot
    const originalWidth = currentSnapshot?.viewportWidth || 1920
    const originalHeight = currentSnapshot?.viewportHeight || 1080

    // Update container size based on available space AND aspect ratio
    useEffect(() => {
        const updateSize = () => {
            if (outerContainerRef.current) {
                const rect = outerContainerRef.current.getBoundingClientRect()
                // Reserve minimal space for slide dots and keyboard hint (about 60px)
                const maxAvailableHeight = Math.max(300, rect.height - 60)
                const maxAvailableWidth = Math.max(400, rect.width - 32)

                // Calculate scale to fit within available bounds while maintaining aspect ratio
                const scaleX = maxAvailableWidth / originalWidth
                const scaleY = maxAvailableHeight / originalHeight
                const bestScale = Math.min(scaleX, scaleY)

                // Set container to the ACTUAL scaled dimensions (no empty space!)
                setContainerSize({
                    width: Math.round(originalWidth * bestScale),
                    height: Math.round(originalHeight * bestScale)
                })
            }
        }

        // Initial size
        const timer = setTimeout(updateSize, 100)

        window.addEventListener('resize', updateSize)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', updateSize)
        }
    }, [currentSlideIndex, originalWidth, originalHeight]) // Recalculate when slide changes or dimensions change

    // Calculate scale factor based on container size (which is now the scaled size)
    const scale = containerSize.width / originalWidth

    // Scaled cursor position
    const scaledCursorX = cursorPosition.x * scale
    const scaledCursorY = cursorPosition.y * scale

    // Get current annotation text from embedded snapshot
    const currentSnapshotAnnotated = currentSnapshot as AnnotatedSnapshot | undefined
    const annotationText = currentSnapshotAnnotated?.annotation?.script || ''
    const currentZoomPan = currentSnapshotAnnotated?.annotation?.zoomPan

    // Calculate zoom transform for player mode
    const getZoomTransform = useCallback(() => {
        if (!currentZoomPan?.enabled || !isZoomed) {
            return { transform: 'scale(1) translate(0, 0)', transformOrigin: 'center center' }
        }

        // Calculate zoom scale based on the selection area
        const zoomScale = Math.min(
            containerSize.width / (currentZoomPan.width * scale),
            containerSize.height / (currentZoomPan.height * scale)
        )

        // Calculate center of the zoom area in scaled coordinates
        const zoomCenterX = (currentZoomPan.x + currentZoomPan.width / 2) * scale
        const zoomCenterY = (currentZoomPan.y + currentZoomPan.height / 2) * scale

        // Calculate translation to center the zoom area
        const translateX = containerSize.width / 2 - zoomCenterX
        const translateY = containerSize.height / 2 - zoomCenterY

        return {
            transform: `scale(${zoomScale}) translate(${translateX / zoomScale}px, ${translateY / zoomScale}px)`,
            transformOrigin: 'center center'
        }
    }, [currentZoomPan, isZoomed, containerSize, scale])

    // Load HTML into iframe
    useEffect(() => {
        if (!iframeRef.current || !currentSnapshot) return

        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document

        if (doc) {
            doc.open()
            doc.write(currentSnapshot.html)
            doc.close()

            // Apply scroll position
            setTimeout(() => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.scrollTo(currentSnapshot.scrollX, currentSnapshot.scrollY)
                }
            }, 50)
        }

        // Update cursor position for click slides
        if (currentSnapshot.type === 'click' && currentSnapshot.clickX !== undefined && currentSnapshot.clickY !== undefined) {
            setCursorPosition({ x: currentSnapshot.clickX, y: currentSnapshot.clickY })
            setShowCursor(true)
        } else {
            setShowCursor(false)
        }

        // Reset editing state when slide changes
        setIsEditingTooltip(false)
        setIsZoomMode(false)
        setIsZoomed(false)
    }, [currentSnapshot])

    // Trigger zoom animation for player mode
    useEffect(() => {
        if (viewOnly && currentZoomPan?.enabled) {
            // Delay zoom effect slightly for better visual
            const timer = setTimeout(() => {
                setIsZoomed(true)
            }, 400)
            return () => clearTimeout(timer)
        } else {
            setIsZoomed(false)
        }
    }, [viewOnly, currentZoomPan, currentSlideIndex])

    // Handle annotation text update
    const handleAnnotationChange = useCallback((text: string) => {
        const existingLabel = currentSnapshotAnnotated?.annotation?.label
        updateAnnotation(currentSlideIndex, {
            label: existingLabel || `Step ${currentSlideIndex + 1}`,
            script: text,
        })
    }, [currentSlideIndex, currentSnapshotAnnotated, updateAnnotation])

    // Handle zoom confirmation
    const handleZoomConfirm = useCallback((zoomPan: ZoomPan) => {
        updateZoomPan(currentSlideIndex, zoomPan)
        setIsZoomMode(false)
    }, [currentSlideIndex, updateZoomPan])

    // Handle zoom cancel
    const handleZoomCancel = useCallback(() => {
        setIsZoomMode(false)
    }, [])

    // Toggle zoom mode
    const handleZoomClick = useCallback(() => {
        setIsZoomMode(true)
    }, [])

    // Navigate to slide with animation
    const goToSlide = useCallback((index: number) => {
        if (index < 0 || index >= totalSlides) return
        if (isTransitioning) return
        if (isEditingTooltip) return // Don't navigate while editing

        setIsTransitioning(true)

        // Animate cursor to new position if it's a click slide
        const targetSnapshot = snapshots[index]
        if (targetSnapshot.type === 'click' && targetSnapshot.clickX !== undefined && targetSnapshot.clickY !== undefined) {
            setCursorPosition({ x: targetSnapshot.clickX, y: targetSnapshot.clickY })
            setShowCursor(true)
        }

        // Transition delay for cursor animation
        setTimeout(() => {
            onSlideChange(index)
            setIsTransitioning(false)
        }, 500)
    }, [totalSlides, isTransitioning, isEditingTooltip, snapshots, onSlideChange])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isTransitioning) return
            if (isEditingTooltip) return // Don't navigate while editing
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                goToSlide(currentSlideIndex - 1)
            } else if (e.key === 'ArrowRight') {
                e.preventDefault()
                goToSlide(currentSlideIndex + 1)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentSlideIndex, goToSlide, isTransitioning, isEditingTooltip])

    // Get slide label
    const getSlideLabel = (index: number) => {
        const snapshot = snapshots[index]
        if (snapshot.type === 'start') return 'Start'
        // Count how many click slides before this one
        let clickCount = 0
        for (let i = 0; i <= index; i++) {
            if (snapshots[i].type === 'click') clickCount++
        }
        return `Click ${clickCount}`
    }

    if (snapshots.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 bg-surface rounded-xl">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-primary/50" />
                </div>
                <p className="text-foreground/60 text-center">
                    No snapshots in this recording
                </p>
            </div>
        )
    }

    return (
        <div
            ref={outerContainerRef}
            className="flex flex-col items-center justify-start h-full w-full gap-2 p-2"
        >
            {/* Slide Display */}
            <div className="relative bg-surface rounded-xl shadow-lg overflow-hidden flex-1 flex items-center justify-center w-full max-w-full">
                {/* Slide number badge */}
                <div className="absolute top-3 left-3 z-20 px-3 py-1.5 bg-background/90 backdrop-blur-sm rounded-full border border-foreground/10">
                    <span className="text-sm font-medium text-foreground">
                        {getSlideLabel(currentSlideIndex)} ({currentSlideIndex + 1} of {totalSlides})
                    </span>
                </div>

                {/* Viewport info badge */}
                <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-background/70 backdrop-blur-sm rounded text-xs text-foreground/50">
                    {originalWidth}×{originalHeight} ({Math.round(scale * 100)}%)
                </div>

                {/* Scaled iframe container with cursor overlay */}
                <div
                    ref={containerRef}
                    className="relative overflow-hidden bg-gray-100 mx-auto"
                    style={{
                        width: containerSize.width,
                        height: containerSize.height,
                        maxWidth: '100%',
                        maxHeight: '100%'
                    }}
                >
                    {/* Zoom container wrapper */}
                    <div
                        className="relative w-full h-full"
                        style={{
                            ...getZoomTransform(),
                            transition: isZoomed ? 'transform 0.8s ease-in-out' : 'transform 0.4s ease-out',
                        }}
                    >
                        {/* Scaled iframe wrapper */}
                        <div
                            style={{
                                width: originalWidth,
                                height: originalHeight,
                                transform: `scale(${scale})`,
                                transformOrigin: 'top left',
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
                                title="Recording snapshot"
                            />
                        </div>
                    </div>

                    {/* Mouse cursor overlay (positioned in scaled coordinates) */}
                    {showCursor && (
                        <MouseCursor
                            x={scaledCursorX}
                            y={scaledCursorY}
                            animate={isTransitioning}
                        />
                    )}

                    {/* Annotation tooltip (only for click slides) */}
                    {currentSnapshot?.type === 'click' && showCursor && (
                        viewOnly ? (
                            <PlayerTooltip
                                x={scaledCursorX}
                                y={scaledCursorY}
                                text={annotationText}
                                containerWidth={containerSize.width}
                                containerHeight={containerSize.height}
                                onPrevious={() => goToSlide(currentSlideIndex - 1)}
                                onNext={() => goToSlide(currentSlideIndex + 1)}
                                canGoPrevious={currentSlideIndex > 0}
                                canGoNext={currentSlideIndex < totalSlides - 1}
                                isTransitioning={isTransitioning}
                            />
                        ) : (
                            <ClickTooltip
                                x={scaledCursorX}
                                y={scaledCursorY}
                                text={annotationText}
                                isEditing={isEditingTooltip}
                                onTextChange={handleAnnotationChange}
                                onStartEdit={() => setIsEditingTooltip(true)}
                                onFinishEdit={() => setIsEditingTooltip(false)}
                                containerWidth={containerSize.width}
                                containerHeight={containerSize.height}
                                onPrevious={() => goToSlide(currentSlideIndex - 1)}
                                onNext={() => goToSlide(currentSlideIndex + 1)}
                                canGoPrevious={currentSlideIndex > 0}
                                canGoNext={currentSlideIndex < totalSlides - 1}
                                isTransitioning={isTransitioning}
                                hasZoom={!!currentZoomPan?.enabled}
                                onZoomClick={handleZoomClick}
                            />
                        )
                    )}

                    {/* Zoom Pan Selector (only in editor mode when zoom mode is active) */}
                    {!viewOnly && isZoomMode && currentSnapshot?.type === 'click' && currentSnapshot.clickX !== undefined && currentSnapshot.clickY !== undefined && (
                        <ZoomPanSelector
                            containerWidth={containerSize.width}
                            containerHeight={containerSize.height}
                            originalWidth={originalWidth}
                            originalHeight={originalHeight}
                            scale={scale}
                            clickX={currentSnapshot.clickX}
                            clickY={currentSnapshot.clickY}
                            initialZoomPan={currentZoomPan}
                            onConfirm={handleZoomConfirm}
                            onCancel={handleZoomCancel}
                        />
                    )}
                </div>
            </div>

            {/* Slide dots indicator */}
            {snapshots.length > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    {snapshots.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            disabled={isTransitioning || isEditingTooltip}
                            className={`
                                w-2.5 h-2.5 rounded-full transition-all duration-200
                                ${index === currentSlideIndex
                                    ? 'bg-primary scale-125'
                                    : 'bg-foreground/20 hover:bg-foreground/40'
                                }
                                ${isTransitioning || isEditingTooltip ? 'cursor-not-allowed' : ''}
                            `}
                            title={getSlideLabel(index)}
                        />
                    ))}
                </div>
            )}

            {/* Keyboard hint */}
            <p className="text-xs text-foreground/40 mt-2">
                Use <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-foreground/60 font-mono">←</kbd> and <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-foreground/60 font-mono">→</kbd> to navigate
                {!viewOnly && isEditingTooltip && <span className="ml-2 text-primary">(finish editing first)</span>}
            </p>
        </div>
    )
}
