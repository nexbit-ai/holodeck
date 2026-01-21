'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Play, Image as ImageIcon } from 'lucide-react'
import type { ClickSnapshot } from '../types/recording'

interface EndSlideProps {
    snapshot: ClickSnapshot
    onUpdateMetadata?: (metadata: { title?: string, logo?: string, description?: string, ctaLink?: string }) => void
    viewOnly?: boolean
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
}

export function EndSlide({
    snapshot,
    onUpdateMetadata,
    viewOnly = false,
    primaryColor = '#6366F1',
    secondaryColor = '#10B981',
    accentColor = '#F59E0B'
}: EndSlideProps) {
    const [title, setTitle] = useState(snapshot.title || 'Enjoyed the guided demo?')
    const [description, setDescription] = useState(snapshot.description || 'See more features on our website')
    const [ctaLink, setCtaLink] = useState(snapshot.ctaLink || 'https://nexbit.ai')
    const [logo, setLogo] = useState(snapshot.logo || '')

    useEffect(() => {
        setTitle(snapshot.title || 'Enjoyed the guided demo?')
        setDescription(snapshot.description || 'See more features on our website')
        setCtaLink(snapshot.ctaLink || 'https://nexbit.ai')
        setLogo(snapshot.logo || '')
    }, [snapshot])

    const handleBlur = () => {
        if (!viewOnly && onUpdateMetadata) {
            onUpdateMetadata({ title, description, ctaLink })
        }
    }

    const handleCtaClick = () => {
        if (ctaLink) {
            window.open(ctaLink.startsWith('http') ? ctaLink : `https://${ctaLink}`, '_blank')
        }
    }

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-[#0f172a] text-white overflow-hidden rounded-xl leading-relaxed font-sans">
            {/* Background Effects */}
            <div
                className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] blur-[150px] rounded-full animate-pulse opacity-20"
                style={{ backgroundColor: primaryColor }}
            />
            <div
                className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full opacity-10"
                style={{ backgroundColor: secondaryColor }}
            />

            <div className="relative z-10 w-full max-w-4xl px-8 flex flex-col items-center text-center gap-10">
                {/* Logo Area */}
                <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center p-5 shadow-2xl relative group">
                    <div
                        className="absolute inset-0 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
                        style={{ backgroundColor: primaryColor }}
                    />
                    {logo ? (
                        <img src={logo} alt="Logo" className="w-full h-full object-contain relative z-10" />
                    ) : (
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg relative z-10"
                            style={{ backgroundColor: primaryColor }}
                        >
                            <span className="text-white font-bold text-3xl">N</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-6 w-full">
                    {viewOnly ? (
                        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                            {title}
                        </h2>
                    ) : (
                        <textarea
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleBlur}
                            className="w-full bg-transparent text-5xl md:text-6xl font-extrabold tracking-tight text-center leading-tight border-none focus:ring-0 focus:outline-none resize-none p-0 overflow-hidden text-white/90 font-inherit"
                            rows={2}
                        />
                    )}

                    {viewOnly ? (
                        <p className="text-xl md:text-2xl text-white/60 font-medium">
                            {description}
                        </p>
                    ) : (
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onBlur={handleBlur}
                            className="w-full bg-transparent text-xl md:text-2xl text-center text-white/50 border-none focus:ring-0 focus:outline-none p-0 font-inherit"
                        />
                    )}
                </div>

                {/* CTA Link Editor (only in editor mode) */}
                {!viewOnly && (
                    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                        <ExternalLink className="w-4 h-4 text-white/40" />
                        <input
                            type="text"
                            value={ctaLink}
                            onChange={(e) => setCtaLink(e.target.value)}
                            onBlur={handleBlur}
                            className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-white/80 w-64"
                            placeholder="Website URL (e.g. nexbit.ai)"
                        />
                    </div>
                )}

                {/* Main Action Button */}
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={handleCtaClick}
                        className="group relative inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 font-extrabold text-xl rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,255,255,0.3)]"
                    >
                        <ExternalLink className="w-6 h-6 stroke-[3px]" />
                        Visit Website
                        <div
                            className="absolute inset-0 rounded-2xl blur-xl -z-10 opacity-0 group-hover:opacity-40 transition-opacity"
                            style={{ backgroundColor: primaryColor }}
                        />
                    </button>

                    {viewOnly && (
                        <p className="text-sm text-white/30 font-medium">
                            Guided demo by Holodeck
                        </p>
                    )}
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:40px_40px]" />
        </div>
    )
}
