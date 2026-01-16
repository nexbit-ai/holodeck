'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'

interface DemoThumbnailProps {
    html: string
    viewportWidth: number
    viewportHeight: number
}

export function DemoThumbnail({
    html,
    viewportWidth,
    viewportHeight,
}: DemoThumbnailProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isLoaded, setIsLoaded] = useState(false)
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

    // Measure container size
    useEffect(() => {
        if (!containerRef.current) return

        const updateSize = () => {
            if (containerRef.current) {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                })
            }
        }

        updateSize()
        const resizeObserver = new ResizeObserver(updateSize)
        resizeObserver.observe(containerRef.current)

        return () => resizeObserver.disconnect()
    }, [])

    // Calculate scale to fill container (cover, not contain)
    const scale = containerSize.width > 0
        ? containerSize.width / viewportWidth
        : 0.1

    useEffect(() => {
        if (!iframeRef.current || !html) return

        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document

        if (doc) {
            doc.open()
            doc.write(html)
            doc.close()
            setIsLoaded(true)
        }
    }, [html])

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden bg-gray-100"
        >
            {/* Loading placeholder */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/5">
                    <FileText className="w-12 h-12 text-primary/40 animate-pulse" />
                </div>
            )}

            {/* Scaled iframe - scales to fill width */}
            <div
                style={{
                    width: viewportWidth,
                    height: viewportHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                }}
            >
                <iframe
                    ref={iframeRef}
                    className="border-0 bg-white pointer-events-none"
                    style={{
                        width: viewportWidth,
                        height: viewportHeight,
                    }}
                    sandbox="allow-same-origin"
                    title="Demo preview"
                />
            </div>
        </div>
    )
}

// Wrapper component that shows fallback icon when no thumbnail is available
interface DemoThumbnailWrapperProps {
    thumbnail?: {
        html: string
        viewportWidth: number
        viewportHeight: number
    }
}

export function DemoThumbnailWrapper({ thumbnail }: DemoThumbnailWrapperProps) {
    if (!thumbnail) {
        return (
            <div className="w-full aspect-video bg-primary/5 rounded-lg flex items-center justify-center">
                <FileText className="w-16 h-16 text-primary/40" />
            </div>
        )
    }

    return (
        <div className="w-full aspect-video rounded-lg overflow-hidden">
            <DemoThumbnail
                html={thumbnail.html}
                viewportWidth={thumbnail.viewportWidth}
                viewportHeight={thumbnail.viewportHeight}
            />
        </div>
    )
}

