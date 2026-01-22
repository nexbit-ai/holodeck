'use client'

import { useState } from 'react'
import {
    MousePointer2,
    Square,
    PlayCircle,
    ChevronDown,
    ZoomIn,
    Sparkles,
    Wand2,
    Loader2
} from 'lucide-react'
import { useEditorStore } from '../store'

interface EditorToolbarProps {
    onZoomClick: () => void
    isZoomActive: boolean
    canZoom: boolean
    onHotspotClick: () => void
    isHotspotActive: boolean
    canAddHotspot: boolean
    onBlurClick: () => void
    isBlurActive: boolean
    onCropClick: () => void
    isCropActive: boolean
}

export function EditorToolbar({
    onZoomClick, isZoomActive, canZoom,
    onHotspotClick, isHotspotActive, canAddHotspot,
    onBlurClick, isBlurActive,
    onCropClick, isCropActive
}: EditorToolbarProps) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)

    // Store actions
    const isAnalyzing = useEditorStore((state) => state.isAnalyzing)
    const analyzeDemo = useEditorStore((state) => state.analyzeDemo)

    const menuItems = [
        { id: 'ai', label: 'AI Generate', icon: Wand2, action: analyzeDemo, primary: true },
        { id: 'hotspot', label: 'Hotspot', icon: MousePointer2 },
        { id: 'blur', label: 'Blur and Crop', icon: Square, hasDropdown: true },
        { id: 'animation', label: 'Animation', icon: PlayCircle, hasDropdown: true },
    ]

    return (
        <div className="w-full bg-surface border-b border-foreground/10 py-2 px-6 flex justify-center items-center gap-2 shadow-sm sticky top-0 z-40 backdrop-blur-md bg-opacity-90">
            {menuItems.map((item) => {
                const Icon = item.icon
                const isHovered = hoveredItem === item.id
                const isActive = (item.id === 'animation' && isZoomActive) ||
                    (item.id === 'hotspot' && isHotspotActive) ||
                    (item.id === 'blur' && (isBlurActive || isCropActive)) ||
                    (item.id === 'ai' && isAnalyzing)

                return (
                    <div
                        key={item.id}
                        className="relative h-full flex items-center"
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <button
                            onClick={() => {
                                if (item.id === 'ai') {
                                    analyzeDemo()
                                } else if (item.id === 'hotspot' && canAddHotspot) {
                                    onHotspotClick()
                                }
                            }}
                            disabled={(item.id === 'hotspot' && !canAddHotspot) || (item.id === 'ai' && isAnalyzing)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200
                                ${item.primary && !isActive && !isHovered ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90' : ''}
                                ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : isHovered
                                        ? item.primary ? 'bg-primary/90 text-white shadow-xl' : 'bg-foreground/5 text-foreground'
                                        : item.primary ? '' : 'text-foreground/60'
                                }
                                ${((item.id === 'hotspot' && !canAddHotspot) || (item.id === 'ai' && isAnalyzing)) ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}
                            `}
                        >
                            {item.id === 'ai' && isAnalyzing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Icon className={`w-4 h-4 ${isActive || item.primary ? '' : (isHovered ? 'text-foreground' : 'text-foreground/40')}`} />
                            )}
                            {item.id === 'ai' && isAnalyzing ? 'Analyzing...' : item.label}
                            {item.hasDropdown && (
                                <ChevronDown
                                    className={`w-3.5 h-3.5 opacity-40 transition-transform duration-200 ${isHovered ? 'rotate-180 opacity-100' : ''}`}
                                />
                            )}
                        </button>

                        {/* Dropdown for Animation */}
                        {item.id === 'animation' && (isHovered || isActive) && isHovered && (
                            <div className="absolute top-[85%] left-1/2 -translate-x-1/2 pt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-surface border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] backdrop-blur-xl bg-opacity-95">
                                    <div className="px-4 py-3 border-b border-foreground/5 bg-foreground/[0.02]">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider">Animation Presets</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (canZoom) onZoomClick()
                                            setHoveredItem(null)
                                        }}
                                        disabled={!canZoom}
                                        className={`
                                            w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left
                                            ${canZoom ? 'hover:bg-primary/5 text-foreground' : 'opacity-30 cursor-not-allowed'}
                                        `}
                                    >
                                        <div className={`
                                            p-2 rounded-lg 
                                            ${canZoom ? 'bg-primary/10 text-primary' : 'bg-foreground/10 text-foreground/40'}
                                        `}>
                                            <ZoomIn className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">Zoom and Pan</span>
                                            <span className="text-[10px] text-foreground/40">Smooth transition to click point</span>
                                        </div>
                                        {(isActive && isZoomActive) && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </button>

                                    <div className="p-2 pt-0">
                                        <div className="h-[1px] bg-foreground/5 mx-2 my-1" />
                                        <p className="px-3 py-1.5 text-[10px] text-foreground/30 italic">
                                            More animations coming soon...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Dropdown for Blur and Crop */}
                        {item.id === 'blur' && (isHovered || isActive) && isHovered && (
                            <div className="absolute top-[85%] left-1/2 -translate-x-1/2 pt-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-surface border border-foreground/10 rounded-2xl shadow-2xl overflow-hidden min-w-[240px] backdrop-blur-xl bg-opacity-95">
                                    <div className="px-4 py-3 border-b border-foreground/5 bg-foreground/[0.02]">
                                        <div className="flex items-center gap-2">
                                            <Square className="w-3.5 h-3.5 text-primary" />
                                            <span className="text-[11px] font-bold text-foreground/40 uppercase tracking-wider">Redaction & Framing</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            onBlurClick()
                                            setHoveredItem(null)
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left hover:bg-primary/5 text-foreground"
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Square className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">Blur / Redact</span>
                                            <span className="text-[10px] text-foreground/40">Hide sensitive information</span>
                                        </div>
                                        {isBlurActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </button>

                                    <div className="h-[1px] bg-foreground/5 mx-4" />

                                    <button
                                        onClick={() => {
                                            onCropClick()
                                            setHoveredItem(null)
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all text-left hover:bg-primary/5 text-foreground"
                                    >
                                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                            <Square className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">Crop Slide</span>
                                            <span className="text-[10px] text-foreground/40">Resize the visible area</span>
                                        </div>
                                        {isCropActive && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
