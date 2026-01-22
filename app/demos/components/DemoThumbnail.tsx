'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { FileText } from 'lucide-react'

interface DemoThumbnailProps {
    html?: string
    snapshot?: any // RRWeb snapshot
    viewportWidth?: number
    viewportHeight?: number
}

/**
 * Optimized RRWeb node to HTML converter with memoization potential
 * This function remains recursive but we'll use useMemo in the component.
 */
function rrwebNodeToHtml(node: any): string {
    if (!node) return ''

    // NodeType.Text
    if (node.type === 3) {
        return node.textContent || ''
    }

    // NodeType.Element
    if (node.type === 2) {
        const tagName = node.tagName
        const attributes = node.attributes || {}
        const attrString = Object.entries(attributes)
            .map(([key, value]) => {
                if (key === 'src' || key === 'href') {
                    return `${key}="${value}"`
                }
                if (typeof value === 'string') {
                    return `${key}="${value.replace(/"/g, '&quot;')}"`
                }
                return `${key}="${value}"`
            })
            .join(' ')

        const children = (node.childNodes || [])
            .map((child: any) => rrwebNodeToHtml(child))
            .join('')

        const selfClosing = ['img', 'br', 'hr', 'input', 'link', 'meta'].includes(tagName.toLowerCase())
        if (selfClosing) {
            return `<${tagName} ${attrString} />`
        }

        return `<${tagName} ${attrString}>${children}</${tagName}>`
    }

    // NodeType.Document
    if (node.type === 0 || node.type === 1) {
        return (node.childNodes || [])
            .map((child: any) => rrwebNodeToHtml(child))
            .join('')
    }

    return ''
}

export function DemoThumbnail({
    html,
    snapshot,
    viewportWidth = 1920,
    viewportHeight = 1080,
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

    // Memoize the HTML content generation
    const memoizedContent = useMemo(() => {
        if (html) return html
        if (snapshot && snapshot.data && snapshot.data.node) {
            return rrwebNodeToHtml(snapshot.data.node)
        }
        return ''
    }, [html, snapshot])

    // Calculate scale to fill container
    const scale = containerSize.width > 0
        ? containerSize.width / viewportWidth
        : 0.1

    useEffect(() => {
        if (!iframeRef.current || !memoizedContent) return

        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document

        if (doc) {
            doc.open()
            // Inject basic styles
            const styledContent = `
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; background: white; }
                    img { max-width: 100%; height: auto; }
                </style>
                ${memoizedContent}
            `
            doc.write(styledContent)
            doc.close()
            setIsLoaded(true)
        }
    }, [memoizedContent])

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden bg-gray-50 relative"
        >
            {/* Loading placeholder */}
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-primary/5 z-10">
                    <FileText className="w-12 h-12 text-primary/40 animate-pulse" />
                </div>
            )}

            {/* Scaled iframe */}
            <div
                style={{
                    width: viewportWidth,
                    height: viewportHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.2s ease-in-out'
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

// Wrapper component with Intersection Observer for lazy loading
interface DemoThumbnailWrapperProps {
    thumbnail?: any
}

export function DemoThumbnailWrapper({ thumbnail }: DemoThumbnailWrapperProps) {
    const [isVisible, setIsVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.disconnect()
                }
            },
            {
                rootMargin: '200px', // Start loading before it's actually in view
                threshold: 0.01
            }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    if (!thumbnail) {
        return (
            <div className="w-full aspect-video bg-primary/5 rounded-lg flex items-center justify-center">
                <FileText className="w-16 h-16 text-primary/40" />
            </div>
        )
    }

    return (
        <div ref={containerRef} className="w-full aspect-video rounded-lg overflow-hidden bg-gray-50">
            {isVisible ? (
                <>
                    {/* Handle old format */}
                    {thumbnail.html && (
                        <DemoThumbnail
                            html={thumbnail.html}
                            viewportWidth={thumbnail.viewportWidth || 1920}
                            viewportHeight={thumbnail.viewportHeight || 1080}
                        />
                    )}

                    {/* Handle new backend format */}
                    {thumbnail.data && thumbnail.data.snapshot && (
                        <DemoThumbnail
                            snapshot={thumbnail.data.snapshot}
                            viewportWidth={1920}
                            viewportHeight={1080}
                        />
                    )}

                    {/* Fallback when thumbnail exists but format unknown */}
                    {!thumbnail.html && !(thumbnail.data && thumbnail.data.snapshot) && (
                        <div className="w-full h-full flex items-center justify-center">
                            <FileText className="w-16 h-16 text-primary/40" />
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-12 h-12 text-primary/20 animate-pulse" />
                </div>
            )}
        </div>
    )
}

