'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play } from 'lucide-react'
import type { ClickRecording, ZoomPan } from '../types/recording'
import { EventType } from '../types/recording'
import { useEditorStore, type AnnotatedSnapshot } from '../store'
import { MouseCursor } from './MouseCursor'
import { ClickTooltip } from './ClickTooltip'
import { PlayerTooltip } from './PlayerTooltip'
import { ZoomPanSelector } from './ZoomPanSelector'
import { CoverSlide } from './CoverSlide'
import { EndSlide } from './EndSlide'
import { AreaSelector } from './AreaSelector'
import { Trash2 } from 'lucide-react'

interface ClickSlideDeckProps {
    recording: ClickRecording
    currentSlideIndex: number
    onSlideChange: (index: number) => void
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    viewOnly?: boolean // When true, uses simple non-editable PlayerTooltip
}

// Display container dimensions - will be calculated dynamically
const DEFAULT_CONTAINER_WIDTH = 900
const DEFAULT_CONTAINER_HEIGHT = 550

export function ClickSlideDeck({ recording, currentSlideIndex, onSlideChange, primaryColor = '#b05a36', secondaryColor = '#b05a36', accentColor = '#b05a36', viewOnly = false }: ClickSlideDeckProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const outerContainerRef = useRef<HTMLDivElement>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const [showCursor, setShowCursor] = useState(false)
    const [isEditingTooltip, setIsEditingTooltip] = useState<string | boolean>(false)
    const [containerSize, setContainerSize] = useState({ width: DEFAULT_CONTAINER_WIDTH, height: DEFAULT_CONTAINER_HEIGHT })
    const [isZoomed, setIsZoomed] = useState(false)

    // Get annotation functions and save state from store
    const updateAnnotation = useEditorStore((state) => state.updateAnnotation)
    const updateZoomPan = useEditorStore((state) => state.updateZoomPan)
    const updateCoverMetadata = useEditorStore((state) => state.updateCoverMetadata)
    const updateEndMetadata = useEditorStore((state) => state.updateEndMetadata)
    const isSaving = useEditorStore((state) => state.isSaving)
    const lastSaved = useEditorStore((state) => state.lastSaved)
    const isZoomMode = useEditorStore((state) => state.isZoomMode)
    const setZoomMode = useEditorStore((state) => state.setZoomMode)
    const isHotspotMode = useEditorStore((state) => state.isHotspotMode)
    const setHotspotMode = useEditorStore((state) => state.setHotspotMode)
    const addHotspot = useEditorStore((state) => state.addHotspot)
    const updateHotspot = useEditorStore((state) => state.updateHotspot)
    const deleteHotspot = useEditorStore((state) => state.deleteHotspot)
    const isBlurMode = useEditorStore((state) => state.isBlurMode)
    const setBlurMode = useEditorStore((state) => state.setBlurMode)
    const isCropMode = useEditorStore((state) => state.isCropMode)
    const setCropMode = useEditorStore((state) => state.setCropMode)
    const addBlurRegion = useEditorStore((state) => state.addBlurRegion)
    const deleteBlurRegion = useEditorStore((state) => state.deleteBlurRegion)
    const updateCrop = useEditorStore((state) => state.updateCrop)
    const deletePrimaryClick = useEditorStore((state) => state.deletePrimaryClick)

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
                // Use full available height and stretch by 20%
                const availableHeight = Math.max(400, rect.height * 1.2)
                const availableWidth = Math.max(600, rect.width - 20)

                const scaleX = availableWidth / originalWidth
                const scaleY = availableHeight / originalHeight
                const bestScale = Math.min(scaleX, scaleY)

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
    const currentHotspots = currentSnapshotAnnotated?.annotation?.hotspots || []
    const currentBlurs = currentSnapshotAnnotated?.annotation?.blurRegions || []
    const currentCrop = currentSnapshotAnnotated?.annotation?.crop

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

            let html = currentSnapshot.html
            // Inject base tag and styles into head to fix asset resolution and hiding scrollbars
            const baseTag = currentSnapshot.url ? `<base href="${currentSnapshot.url}">` : ''
            const styleTag = `<style>::-webkit-scrollbar { display: none; } noscript { display: none !important; } body { overflow: hidden !important; -ms-overflow-style: none; scrollbar-width: none; }</style>`
            const injection = baseTag + styleTag

            // Use regex to insert after <head> or <html>
            if (/<head[^>]*>/i.test(html)) {
                html = html.replace(/<head[^>]*>/i, `$&${injection}`)
            } else if (/<html[^>]*>/i.test(html)) {
                html = html.replace(/<html[^>]*>/i, `$&<head>${injection}</head>`)
            } else {
                html = injection + html
            }

            doc.write(html)
            doc.close()

            // Apply scroll position
            setTimeout(() => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.scrollTo(currentSnapshot.scrollX, currentSnapshot.scrollY)
                }
            }, 50)
        }

        // Update cursor position for click slides
        const isClickSlide = currentSnapshot.type === 'click' || currentSnapshot.type === EventType.CLICK
        if (isClickSlide && currentSnapshot.clickX !== undefined && currentSnapshot.clickY !== undefined) {
            setCursorPosition({ x: currentSnapshot.clickX, y: currentSnapshot.clickY })
            setShowCursor(true)
        } else {
            setShowCursor(false)
        }

        // Reset editing state when slide changes
        setIsEditingTooltip(false)
        setZoomMode(false)
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
        setZoomMode(false)
    }, [currentSlideIndex, updateZoomPan, setZoomMode])

    const handleZoomCancel = useCallback(() => {
        setZoomMode(false)
    }, [setZoomMode])

    const handleBlurConfirm = useCallback((rect: { x: number, y: number, width: number, height: number }) => {
        addBlurRegion(currentSlideIndex, {
            id: Math.random().toString(36).substr(2, 9),
            ...rect,
        })
        setBlurMode(false)
    }, [currentSlideIndex, addBlurRegion, setBlurMode])

    const handleBlurCancel = useCallback(() => {
        setBlurMode(false)
    }, [setBlurMode])

    const handleCropConfirm = useCallback((rect: { x: number, y: number, width: number, height: number }) => {
        updateCrop(currentSlideIndex, rect)
        setCropMode(false)
    }, [currentSlideIndex, updateCrop, setCropMode])

    const handleCropCancel = useCallback(() => {
        setCropMode(false)
    }, [setCropMode])

    // Handle container click (for adding hotspots)
    const handleContainerClick = (e: React.MouseEvent) => {
        if (!isHotspotMode || !containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const clickX = (e.clientX - rect.left) / scale
        const clickY = (e.clientY - rect.top) / scale

        addHotspot(currentSlideIndex, {
            id: Math.random().toString(36).substr(2, 9),
            x: Math.round(clickX),
            y: Math.round(clickY),
            text: '',
        })
    }

    // Navigate to slide with animation
    const goToSlide = useCallback((index: number) => {
        if (index < 0 || index >= totalSlides) return
        if (isTransitioning) return
        if (isEditingTooltip) return // Don't navigate while editing

        setIsTransitioning(true)

        // Animate cursor to new position if it's a click slide
        const targetSnapshot = snapshots[index]
        const isTargetClick = targetSnapshot.type === 'click' || targetSnapshot.type === EventType.CLICK
        if (isTargetClick && targetSnapshot.clickX !== undefined && targetSnapshot.clickY !== undefined) {
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
        if (snapshot.type === 'cover' || snapshot.type === EventType.COVER) return 'Cover'
        if (snapshot.type === 'end' || snapshot.type === EventType.END) return 'End'
        if (snapshot.type === 'start' || snapshot.type === EventType.START) return 'Start'
        // Count how many click slides before this one
        let clickCount = 0
        for (let i = 0; i <= index; i++) {
            if (snapshots[i].type === 'click' || snapshots[i].type === EventType.CLICK) clickCount++
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
            className="relative flex flex-col items-center justify-center h-full w-full"
        >
            {/* Slide Display */}
            <div className="relative bg-surface rounded-xl shadow-lg overflow-hidden flex-1 flex items-center justify-center w-full max-w-full">
                <div
                    ref={containerRef}
                    className={`relative overflow-hidden rounded-lg mx-auto ${isHotspotMode ? 'cursor-crosshair' : ''} shadow-lg`}
                    style={{
                        width: (currentCrop?.width || originalWidth) * scale,
                        height: (currentCrop?.height || originalHeight) * scale,
                    }}
                    onClick={handleContainerClick}
                >
                    {(currentSnapshot?.type === 'cover' || currentSnapshot?.type === EventType.COVER) ? (
                        <div className="w-full h-full" style={{ pointerEvents: isHotspotMode ? 'none' : 'auto' }}>
                            <CoverSlide
                                snapshot={currentSnapshot}
                                nextSnapshot={snapshots[currentSlideIndex + 1]}
                                onStart={() => goToSlide(currentSlideIndex + 1)}
                                viewOnly={viewOnly}
                                onUpdateMetadata={(metadata) => updateCoverMetadata(currentSlideIndex, metadata)}
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                accentColor={accentColor}
                                scale={scale}
                            />
                        </div>
                    ) : (currentSnapshot?.type === 'end' || currentSnapshot?.type === EventType.END) ? (
                        <div className="w-full h-full" style={{ pointerEvents: isHotspotMode ? 'none' : 'auto' }}>
                            <EndSlide
                                snapshot={currentSnapshot}
                                onUpdateMetadata={(metadata) => updateEndMetadata(currentSlideIndex, metadata)}
                                viewOnly={viewOnly}
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                accentColor={accentColor}
                                scale={scale}
                            />
                        </div>
                    ) : (
                        /* Scaled iframe container with cursor overlay */
                        <div className="w-full h-full">
                            {/* Zoom container wrapper */}
                            <div
                                className="relative w-full h-full"
                                style={{
                                    ...getZoomTransform(),
                                    transition: isZoomed ? 'transform 0.8s ease-in-out' : 'transform 0.4s ease-out',
                                    pointerEvents: isHotspotMode ? 'none' : 'auto',
                                }}
                            >
                                {/* Scaled iframe wrapper */}
                                <div
                                    style={{
                                        width: originalWidth,
                                        height: originalHeight,
                                        overflow: 'hidden',
                                        transform: `scale(${scale}) translate(${- (currentCrop?.x || 0)}px, ${- (currentCrop?.y || 0)}px)`,
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
                            {(currentSnapshot?.type === 'click' || currentSnapshot?.type === EventType.CLICK) && showCursor && (
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
                                        scale={scale}
                                    />
                                ) : (
                                    <ClickTooltip
                                        x={scaledCursorX}
                                        y={scaledCursorY}
                                        text={annotationText}
                                        isEditing={isEditingTooltip === true}
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
                                        primaryColor={primaryColor}
                                        secondaryColor={secondaryColor}
                                        accentColor={accentColor}
                                        onDelete={() => deletePrimaryClick(currentSlideIndex)}
                                        scale={scale}
                                    />
                                )
                            )}
                        </div>
                    )}

                    {/* Additional Hotspots (rendered for all slide types) */}
                    {currentHotspots.map((hotspot) => (
                        viewOnly ? (
                            <PlayerTooltip
                                key={hotspot.id}
                                x={hotspot.x * scale}
                                y={hotspot.y * scale}
                                text={hotspot.text}
                                containerWidth={containerSize.width}
                                containerHeight={containerSize.height}
                                onPrevious={() => goToSlide(currentSlideIndex - 1)}
                                onNext={() => goToSlide(currentSlideIndex + 1)}
                                canGoPrevious={currentSlideIndex > 0}
                                canGoNext={currentSlideIndex < totalSlides - 1}
                                isTransitioning={isTransitioning}
                                scale={scale}
                            />
                        ) : (
                            <ClickTooltip
                                key={hotspot.id}
                                x={hotspot.x * scale}
                                y={hotspot.y * scale}
                                text={hotspot.text}
                                isEditing={isEditingTooltip === hotspot.id}
                                onTextChange={(text) => updateHotspot(currentSlideIndex, hotspot.id, text)}
                                onStartEdit={() => setIsEditingTooltip(hotspot.id)}
                                onFinishEdit={() => setIsEditingTooltip(false)}
                                containerWidth={containerSize.width}
                                containerHeight={containerSize.height}
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                accentColor={accentColor}
                                onDelete={() => deleteHotspot(currentSlideIndex, hotspot.id)}
                                scale={scale}
                            />
                        )
                    ))}

                    {/* Blur Regions */}
                    {currentBlurs.map((blur) => (
                        <div
                            key={blur.id}
                            className="absolute z-20 overflow-hidden group"
                            style={{
                                left: blur.x * scale,
                                top: blur.y * scale,
                                width: blur.width * scale,
                                height: blur.height * scale,
                                backdropFilter: 'blur(12px)',
                                background: 'rgba(0, 0, 0, 0.4)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                        >
                            {!viewOnly && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteBlurRegion(currentSlideIndex, blur.id)
                                    }}
                                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Area Selectors */}
                    {!viewOnly && isBlurMode && (
                        <AreaSelector
                            containerWidth={containerSize.width}
                            containerHeight={containerSize.height}
                            originalWidth={originalWidth}
                            originalHeight={originalHeight}
                            scale={scale}
                            onConfirm={handleBlurConfirm}
                            onCancel={handleBlurCancel}
                            label="Blur Area"
                            color="#ef4444"
                        />
                    )}

                    {!viewOnly && isCropMode && (
                        <AreaSelector
                            containerWidth={containerSize.width}
                            containerHeight={containerSize.height}
                            originalWidth={originalWidth}
                            originalHeight={originalHeight}
                            scale={scale}
                            initialRect={currentCrop}
                            onConfirm={handleCropConfirm}
                            onCancel={handleCropCancel}
                            label="Crop Area"
                            color="#3b82f6"
                        />
                    )}

                    {/* Zoom Pan Selector (only in editor mode when zoom mode is active) */}
                    {!viewOnly && isZoomMode && (currentSnapshot?.type !== 'cover' && currentSnapshot?.type !== EventType.COVER && currentSnapshot?.type !== 'end' && currentSnapshot?.type !== EventType.END) && (
                        (currentSnapshot?.clickX !== undefined && currentSnapshot?.clickY !== undefined) ||
                        (currentHotspots && currentHotspots.length > 0)
                    ) && (
                            <ZoomPanSelector
                                containerWidth={containerSize.width}
                                containerHeight={containerSize.height}
                                originalWidth={originalWidth}
                                originalHeight={originalHeight}
                                scale={scale}
                                clickX={currentSnapshot?.clickX ?? (currentHotspots.length > 0 ? currentHotspots[0].x : undefined)}
                                clickY={currentSnapshot?.clickY ?? (currentHotspots.length > 0 ? currentHotspots[0].y : undefined)}
                                initialZoomPan={currentZoomPan}
                                onConfirm={handleZoomConfirm}
                                onCancel={handleZoomCancel}
                            />
                        )}
                </div>
            </div>

            {/* Slide dots indicator - positioned absolutely */}
            {snapshots.length > 1 && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-2 rounded-full">
                    {snapshots.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            disabled={isTransitioning || !!isEditingTooltip}
                            className={`
                                w-2.5 h-2.5 rounded-full transition-all duration-200
                                ${index === currentSlideIndex
                                    ? 'bg-primary scale-125'
                                    : 'bg-foreground/20 hover:bg-foreground/40'
                                }
                                ${isTransitioning || !!isEditingTooltip ? 'cursor-not-allowed' : ''}
                            `}
                            title={getSlideLabel(index)}
                        />
                    ))}
                </div>
            )}

            {/* Keyboard hint - positioned absolutely */}
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 text-xs text-foreground/40 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                Use <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-foreground/60 font-mono">←</kbd> and <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-foreground/60 font-mono">→</kbd> to navigate
                {!viewOnly && !!isEditingTooltip && <span className="ml-2 text-primary">(finish editing first)</span>}
            </p>
        </div>
    )
}
