'use client'

import { useRef, useEffect, useState } from 'react'
import { Play, Image as ImageIcon, Upload } from 'lucide-react'
import type { ClickSnapshot } from '../types/recording'

interface CoverSlideProps {
    snapshot: ClickSnapshot
    nextSnapshot?: ClickSnapshot
    onStart: () => void
    viewOnly?: boolean
    onUpdateMetadata?: (metadata: { title?: string, logo?: string, description?: string }) => void
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    scale?: number
}

export function CoverSlide({
    snapshot,
    nextSnapshot,
    onStart,
    viewOnly = false,
    onUpdateMetadata,
    primaryColor = '#6366F1',
    secondaryColor = '#10B981',
    accentColor = '#F59E0B',
    scale = 1
}: CoverSlideProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [title, setTitle] = useState(snapshot.title || 'Welcome to the Demo')
    const [logo, setLogo] = useState(snapshot.logo || '')

    // Use a fixed reference size for scaling
    const originalWidth = 1440
    const originalHeight = 810 // 16:9 aspect ratio

    // Update local state when snapshot changes
    useEffect(() => {
        setTitle(snapshot.title || 'Welcome to the Demo')
        setLogo(snapshot.logo || '')
    }, [snapshot])

    // Load glimpse HTML into iframe
    useEffect(() => {
        if (!iframeRef.current || !nextSnapshot) return

        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document

        if (doc) {
            doc.open()
            let html = nextSnapshot.html
            const baseTag = nextSnapshot.url ? `<base href="${nextSnapshot.url}">` : ''
            const styleTag = `<style>
                ::-webkit-scrollbar { display: none; }
                body { 
                    overflow: hidden !important; 
                    -ms-overflow-style: none; 
                    scrollbar-width: none; 
                    zoom: 0.5;
                }
            </style>`

            if (/<head[^>]*>/i.test(html)) {
                html = html.replace(/<head[^>]*>/i, `$&${baseTag}${styleTag}`)
            } else {
                html = baseTag + styleTag + html
            }

            doc.write(html)
            doc.close()

            setTimeout(() => {
                if (iframe.contentWindow) {
                    iframe.contentWindow.scrollTo(nextSnapshot.scrollX, nextSnapshot.scrollY)
                }
            }, 50)
        }
    }, [nextSnapshot])

    const handleTitleBlur = () => {
        if (!viewOnly && onUpdateMetadata) {
            onUpdateMetadata({ title })
        }
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-[#0f172a] text-white overflow-hidden rounded-xl leading-relaxed">
            {/* Scaling Wrapper */}
            <div
                style={{
                    width: originalWidth,
                    height: originalHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: 'center center',
                    flexShrink: 0
                }}
                className="relative flex items-center justify-center"
            >
                {/* Animated Background Gradients */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full animate-pulse opacity-20"
                    style={{ backgroundColor: primaryColor }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full opacity-10"
                    style={{ backgroundColor: secondaryColor }}
                />

                <div className="relative z-10 w-full max-w-[1400px] px-12 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
                    {/* Left Content */}
                    <div className="flex flex-col gap-8">
                        {/* Logo Area */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center p-3 shadow-2xl">
                                {logo ? (
                                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <span className="text-white font-bold text-xl">N</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-4">
                            {(() => {
                                const len = title.length
                                const fontSizeClass =
                                    len > 80 ? 'text-2xl' :
                                        len > 60 ? 'text-3xl' :
                                            len > 40 ? 'text-4xl' :
                                                len > 20 ? 'text-5xl' :
                                                    'text-6xl'

                                return viewOnly ? (
                                    <h1 className={`${fontSizeClass} font-extrabold tracking-tight leading-tight transition-all duration-200`}>
                                        {title}
                                    </h1>
                                ) : (
                                    <textarea
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        onBlur={handleTitleBlur}
                                        className={`w-full bg-transparent ${fontSizeClass} font-extrabold tracking-tight leading-tight border-none focus:ring-0 focus:outline-none resize-none p-0 overflow-hidden font-inherit transition-all duration-200`}
                                        rows={3}
                                    />
                                )
                            })()}
                            <div
                                className="h-1.5 w-24 rounded-full"
                                style={{ backgroundColor: primaryColor }}
                            />
                        </div>

                        {/* Start Button */}
                        <button
                            onClick={onStart}
                            className="group relative self-start inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-xl"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Get Started
                            <div
                                className="absolute inset-0 rounded-2xl blur-lg -z-10 opacity-0 group-hover:opacity-40 transition-opacity"
                                style={{ backgroundColor: primaryColor }}
                            />
                        </button>
                    </div>

                    {/* Right Content - Glimpse Preview */}
                    <div className="relative h-full flex items-center justify-center">
                        <div className="relative w-full transform lg:rotate-[-2deg] transition-transform hover:rotate-0 duration-700">
                            {/* Shadow & Glow */}
                            <div
                                className="absolute -inset-8 blur-[100px] opacity-20"
                                style={{ backgroundColor: primaryColor }}
                            />

                            {/* Container */}
                            <div className="relative aspect-video w-full rounded-2xl border border-white/10 bg-slate-800/50 backdrop-blur-xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                                <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 flex items-center px-4 gap-2 border-b border-white/10 z-30">
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                                </div>

                                <div className="w-full h-full pt-8 scale-[1.01]">
                                    {nextSnapshot ? (
                                        <iframe
                                            ref={iframeRef}
                                            className="w-[143%] h-[143%] border-0 origin-top-left scale-[0.7]"
                                            sandbox="allow-same-origin"
                                            title="Glimpse"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
                                            <ImageIcon className="w-12 h-12 text-white/10" />
                                        </div>
                                    )}
                                </div>

                                {/* Overlay to prevent interaction in preview */}
                                <div className="absolute inset-0 z-20" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
