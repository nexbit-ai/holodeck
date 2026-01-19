'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play } from 'lucide-react'
import type { ClickRecording } from '../types/recording'
import { useEditorStore, type AnnotatedSnapshot } from '../store'
import { MouseCursor } from './MouseCursor'
import { ClickTooltip } from './ClickTooltip'
import { PlayerTooltip } from './PlayerTooltip'

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

export function ClickSlideDeck({ recording, currentSlideIndex, onSlideChange, primaryColor = '#6366F1', secondaryColor = '#10B981', accentColor = '#F59E0B', viewOnly = false }: ClickSlideDeckProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const outerContainerRef = useRef<HTMLDivElement>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const [showCursor, setShowCursor] = useState(false)
    const [isEditingTooltip, setIsEditingTooltip] = useState(false)
    const [containerSize, setContainerSize] = useState({ width: DEFAULT_CONTAINER_WIDTH, height: DEFAULT_CONTAINER_HEIGHT })

    // Get annotation functions and save state from store
    const updateAnnotation = useEditorStore((state) => state.updateAnnotation)
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
                // Use full available height and stretch by 20%
                const availableHeight = Math.max(400, rect.height * 1.2)
                const availableWidth = Math.max(600, rect.width - 20)
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

    // Load HTML into iframe
    useEffect(() => {
        if (!iframeRef.current || !currentSnapshot) return

        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document

        if (doc) {
            doc.open()
            // Inject style to hide scrollbars and noscript tags in the recorded content
            doc.write(`<style>::-webkit-scrollbar { display: none; } noscript { display: none !important; } body { overflow: hidden !important; -ms-overflow-style: none; scrollbar-width: none; }</style>` + currentSnapshot.html)
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
    }, [currentSnapshot])

    // Handle annotation text update
    const handleAnnotationChange = useCallback((text: string) => {
        const existingLabel = currentSnapshotAnnotated?.annotation?.label
        updateAnnotation(currentSlideIndex, {
            label: existingLabel || `Step ${currentSlideIndex + 1}`,
            script: text,
        })
    }, [currentSlideIndex, currentSnapshotAnnotated, updateAnnotation])

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
            className="relative flex flex-col items-center justify-center h-full w-full"
        >
            {/* Slide Display */}
            <div className="relative bg-surface rounded-xl shadow-lg overflow-hidden flex-1 flex items-center justify-center w-full max-w-full">

                {/* Scaled iframe container with cursor overlay */}
                <div
                    ref={containerRef}
                    className="relative overflow-hidden rounded-lg mx-auto"
                    style={{
                        width: originalWidth * scale,
                        height: originalHeight * scale,
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
                                overflow: 'hidden'
                            }}
                            sandbox="allow-same-origin"
                            scrolling="no"
                            title="Recording snapshot"
                        />
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
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                accentColor={accentColor}
                            />
                        )
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

            {/* Keyboard hint - positioned absolutely */}
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 text-xs text-foreground/40 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                Use <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-foreground/60 font-mono">←</kbd> and <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-foreground/60 font-mono">→</kbd> to navigate
                {!viewOnly && isEditingTooltip && <span className="ml-2 text-primary">(finish editing first)</span>}
            </p>
        </div>
    )
}
