'use client'

import { useState } from 'react'
import { MessageCircle, X, Check } from 'lucide-react'

interface ClickTooltipProps {
    x: number
    y: number
    text: string
    isEditing: boolean
    onTextChange: (text: string) => void
    onStartEdit: () => void
    onFinishEdit: () => void
    containerWidth: number
    containerHeight: number
}

export function ClickTooltip({
    x,
    y,
    text,
    isEditing,
    onTextChange,
    onStartEdit,
    onFinishEdit,
    containerWidth,
    containerHeight,
}: ClickTooltipProps) {
    const [localText, setLocalText] = useState(text)

    // Position the tooltip - try to keep it in bounds
    const tooltipWidth = 280
    const tooltipHeight = 120
    const padding = 16
    const cursorOffset = 30

    // Default position: to the right and below cursor
    let tooltipX = x + cursorOffset
    let tooltipY = y + cursorOffset

    // Adjust if going off right edge
    if (tooltipX + tooltipWidth > containerWidth - padding) {
        tooltipX = x - tooltipWidth - cursorOffset
    }

    // Adjust if going off bottom edge
    if (tooltipY + tooltipHeight > containerHeight - padding) {
        tooltipY = y - tooltipHeight - cursorOffset
    }

    // Ensure minimum position
    tooltipX = Math.max(padding, tooltipX)
    tooltipY = Math.max(padding, tooltipY)

    const handleSave = () => {
        onTextChange(localText)
        onFinishEdit()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setLocalText(text)
            onFinishEdit()
        } else if (e.key === 'Enter' && e.metaKey) {
            handleSave()
        }
    }

    const displayText = text || 'Click to add description...'

    return (
        <div
            className="absolute z-30 transition-all duration-300 ease-out"
            style={{
                left: tooltipX,
                top: tooltipY,
                width: tooltipWidth,
            }}
        >
            {/* Tooltip card */}
            <div className="bg-surface border-2 border-primary rounded-xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="px-3 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">Step Description</span>
                    </div>
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="p-1 rounded hover:bg-primary/20 text-primary transition-colors"
                        >
                            <Check className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onStartEdit}
                            className="text-xs text-primary/70 hover:text-primary transition-colors"
                        >
                            Edit
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-3">
                    {isEditing ? (
                        <textarea
                            value={localText}
                            onChange={(e) => setLocalText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe what happens when you click here..."
                            className="w-full h-16 text-sm bg-background border border-foreground/10 rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none"
                            autoFocus
                        />
                    ) : (
                        <p
                            className={`text-sm leading-relaxed ${text ? 'text-foreground' : 'text-foreground/40 italic'}`}
                            onClick={onStartEdit}
                        >
                            {displayText}
                        </p>
                    )}
                </div>

                {/* Footer hint */}
                {isEditing && (
                    <div className="px-3 pb-2">
                        <p className="text-xs text-foreground/40">
                            Press <kbd className="px-1 py-0.5 bg-foreground/10 rounded font-mono">⌘ Enter</kbd> to save
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
