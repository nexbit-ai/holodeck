'use client'

import { useCallback, useState } from 'react'
import { Upload, FileJson } from 'lucide-react'
import type { eventWithTime } from '@rrweb/types'
import { useEditorStore } from '../store'
import { parseClickEvents } from '../utils/parseEvents'

export function DropZone() {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const loadEvents = useEditorStore((state) => state.loadEvents)

    const handleFile = useCallback(async (file: File) => {
        setError(null)

        if (!file.name.endsWith('.json')) {
            setError('Please upload a JSON file')
            return
        }

        try {
            const text = await file.text()
            const data = JSON.parse(text)

            // Check if it's an array of events or a project file
            let events: eventWithTime[]
            if (Array.isArray(data)) {
                events = data
            } else if (data.events && Array.isArray(data.events)) {
                events = data.events
            } else {
                setError('Invalid recording format. Expected an array of rrweb events.')
                return
            }

            if (events.length === 0) {
                setError('The recording file is empty.')
                return
            }

            // Parse click events
            const clickEvents = parseClickEvents(events)

            // Load into store
            loadEvents(events, clickEvents)
        } catch (err) {
            console.error('Failed to parse file:', err)
            setError('Failed to parse the JSON file. Make sure it\'s a valid rrweb recording.')
        }
    }, [loadEvents])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFile(file)
        }
    }, [handleFile])

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFile(file)
        }
    }, [handleFile])

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-8">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
          relative w-full max-w-xl p-12 rounded-2xl
          border-2 border-dashed transition-all duration-300
          ${isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : 'border-primary/40 bg-surface hover:border-primary hover:bg-primary/5'
                    }
        `}
            >
                <input
                    type="file"
                    accept=".json"
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center text-center">
                    <div className={`
            w-20 h-20 mb-6 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isDragging ? 'bg-primary text-white' : 'bg-primary/10'}
          `}>
                        {isDragging ? (
                            <FileJson className="w-10 h-10" />
                        ) : (
                            <Upload className="w-10 h-10 text-primary" />
                        )}
                    </div>

                    <h2 className="text-xl font-semibold text-foreground mb-2">
                        {isDragging ? 'Drop it here!' : 'Upload Your Recording'}
                    </h2>

                    <p className="text-sm text-foreground/60 mb-4">
                        Drag & drop your <code className="px-1.5 py-0.5 bg-primary/10 rounded text-primary font-mono text-xs">recording.json</code> here
                    </p>

                    <p className="text-xs text-foreground/40">
                        or click to browse
                    </p>
                </div>

                {error && (
                    <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
