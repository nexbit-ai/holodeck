'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText } from 'lucide-react'

interface DemoThumbnailProps {
    html?: string
    snapshot?: any // RRWeb snapshot
    viewportWidth?: number
    viewportHeight?: number
}

// Simple RRWeb node to HTML converter
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
                    // Prepend proxy or absolute URL if needed, but for thumbnail we keep it simple
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

    // Calculate scale to fill container (cover, not contain)
    const scale = containerSize.width > 0
        ? containerSize.width / viewportWidth
        : 0.1

    useEffect(() => {
        if (!iframeRef.current) return

        let content = html || ''
        if (!content && snapshot && snapshot.data && snapshot.data.node) {
            content = rrwebNodeToHtml(snapshot.data.node)
        }

        if (!content) return

        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document

        if (doc) {
            doc.open()
            // Inject basic styles to ensure thumbnail looks okay
            const styledContent = `
                <style>
                    body { margin: 0; padding: 0; overflow: hidden; }
                    img { max-width: 100%; height: auto; }
                </style>
                ${content}
            `
            doc.write(styledContent)
            doc.close()
            setIsLoaded(true)
        }
    }, [html, snapshot])

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
    thumbnail?: any
}

export function DemoThumbnailWrapper({ thumbnail }: DemoThumbnailWrapperProps) {
    if (!thumbnail) {
        return (
            <div className="w-full aspect-video bg-primary/5 rounded-lg flex items-center justify-center">
                <FileText className="w-16 h-16 text-primary/40" />
            </div>
        )
    }

    // Handle old format
    if (thumbnail.html) {
        return (
            <div className="w-full aspect-video rounded-lg overflow-hidden">
                <DemoThumbnail
                    html={thumbnail.html}
                    viewportWidth={thumbnail.viewportWidth || 1920}
                    viewportHeight={thumbnail.viewportHeight || 1080}
                />
            </div>
        )
    }

    // Handle new backend format
    if (thumbnail.data && thumbnail.data.snapshot) {
        return (
            <div className="w-full aspect-video rounded-lg overflow-hidden">
                <DemoThumbnail
                    snapshot={thumbnail.data.snapshot}
                    viewportWidth={1920} // Default for thumbnails
                    viewportHeight={1080}
                />
            </div>
        )
    }

    // Fallback
    return (
        <div className="w-full aspect-video bg-primary/5 rounded-lg flex items-center justify-center">
            <FileText className="w-16 h-16 text-primary/40" />
        </div>
    )
}

