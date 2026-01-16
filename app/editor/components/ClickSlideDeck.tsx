'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play } from 'lucide-react'
import type { ClickRecording } from '../types/recording'
import { useEditorStore, type AnnotatedSnapshot } from '../store'
import { MouseCursor } from './MouseCursor'
import { ClickTooltip } from './ClickTooltip'

interface ClickSlideDeckProps {
    recording: ClickRecording
    currentSlideIndex: number
    onSlideChange: (index: number) => void
}

// Display container dimensions
const CONTAINER_WIDTH = 900
const CONTAINER_HEIGHT = 550

export function ClickSlideDeck({ recording, currentSlideIndex, onSlideChange }: ClickSlideDeckProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
    const [showCursor, setShowCursor] = useState(false)
    const [isEditingTooltip, setIsEditingTooltip] = useState(false)

    // Get annotation functions and save state from store
    const updateAnnotation = useEditorStore((state) => state.updateAnnotation)
    const isSaving = useEditorStore((state) => state.isSaving)
    const lastSaved = useEditorStore((state) => state.lastSaved)

    const snapshots = recording.snapshots
    const totalSlides = snapshots.length
    const currentSnapshot = snapshots[currentSlideIndex]

    // Calculate scale factor based on recorded viewport vs container
    const originalWidth = currentSnapshot?.viewportWidth || 1920
    const originalHeight = currentSnapshot?.viewportHeight || 1080

    // Calculate scale to fit container while maintaining aspect ratio
    const scaleX = CONTAINER_WIDTH / originalWidth
    const scaleY = CONTAINER_HEIGHT / originalHeight
    const scale = Math.min(scaleX, scaleY)

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
        <div className="flex flex-col items-center justify-center h-full gap-4">
            {/* Slide Display */}
            <div className="relative bg-surface rounded-xl shadow-lg overflow-hidden">
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
                    className="relative overflow-hidden bg-gray-100"
                    style={{
                        width: CONTAINER_WIDTH,
                        height: CONTAINER_HEIGHT
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
                        <ClickTooltip
                            x={scaledCursorX}
                            y={scaledCursorY}
                            text={annotationText}
                            isEditing={isEditingTooltip}
                            onTextChange={handleAnnotationChange}
                            onStartEdit={() => setIsEditingTooltip(true)}
                            onFinishEdit={() => setIsEditingTooltip(false)}
                            containerWidth={CONTAINER_WIDTH}
                            containerHeight={CONTAINER_HEIGHT}
                        />
                    )}
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => goToSlide(currentSlideIndex - 1)}
                    disabled={currentSlideIndex === 0 || isTransitioning || isEditingTooltip}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                        transition-all duration-200
                        ${currentSlideIndex === 0 || isTransitioning || isEditingTooltip
                            ? 'bg-foreground/5 text-foreground/30 cursor-not-allowed'
                            : 'bg-surface border border-foreground/10 text-foreground hover:bg-primary/5 hover:border-primary/30'
                        }
                    `}
                >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                </button>

                {/* Slide dots */}
                <div className="flex items-center gap-2">
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

                <button
                    onClick={() => goToSlide(currentSlideIndex + 1)}
                    disabled={currentSlideIndex === totalSlides - 1 || isTransitioning || isEditingTooltip}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                        transition-all duration-200
                        ${currentSlideIndex === totalSlides - 1 || isTransitioning || isEditingTooltip
                            ? 'bg-foreground/5 text-foreground/30 cursor-not-allowed'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-md'
                        }
                    `}
                >
                    Next
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>

            {/* Keyboard hint */}
            <p className="text-xs text-foreground/40">
                Use <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-foreground/60 font-mono">←</kbd> and <kbd className="px-1.5 py-0.5 bg-foreground/10 rounded text-foreground/60 font-mono">→</kbd> to navigate
                {isEditingTooltip && <span className="ml-2 text-primary">(finish editing first)</span>}
            </p>
        </div>
    )
}
