'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Video, Image as ImageIcon, ChevronDown } from 'lucide-react'

interface AddStepMenuProps {
    insertIndex: number // Where to insert the new step
    lastUrl: string // URL from last snapshot for "record more"
    onRecordMore: (url: string) => void
    onAddImage?: () => void // Placeholder for future
}

export function AddStepMenu({ insertIndex, lastUrl, onRecordMore, onAddImage }: AddStepMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    const handleRecordMore = () => {
        setIsOpen(false)
        onRecordMore(lastUrl)
    }

    const handleAddImage = () => {
        setIsOpen(false)
        if (onAddImage) {
            onAddImage()
        }
    }

    return (
        <div ref={menuRef} className="relative w-full">
            {/* Add Step Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-center gap-1.5 py-1.5 px-3
                    text-xs font-medium rounded-md transition-all duration-200
                    ${isOpen
                        ? 'bg-primary text-white'
                        : 'bg-foreground/5 text-foreground/50 hover:bg-primary/10 hover:text-primary'
                    }
                `}
            >
                <Plus className="w-3.5 h-3.5" />
                Add Step
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-surface border border-foreground/10 rounded-lg shadow-lg overflow-hidden">
                    <button
                        onClick={handleRecordMore}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/10 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Video className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">Record More Steps</p>
                            <p className="text-xs text-foreground/50">Continue recording from last URL</p>
                        </div>
                    </button>

                    <div className="border-t border-foreground/5" />

                    <button
                        onClick={handleAddImage}
                        disabled
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left opacity-50 cursor-not-allowed"
                    >
                        <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-foreground/40" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground/60">Add Image</p>
                            <p className="text-xs text-foreground/40">Coming soon</p>
                        </div>
                    </button>
                </div>
            )}
        </div>
    )
}
