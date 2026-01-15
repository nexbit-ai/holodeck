'use client'

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import type { eventWithTime } from '@rrweb/types'

// Import rrweb-player CSS
import 'rrweb-player/dist/style.css'

export interface PlayerHandle {
    seekTo: (timestamp: number) => void
    play: () => void
    pause: () => void
}

interface PlayerProps {
    events: eventWithTime[]
}

export const Player = forwardRef<PlayerHandle, PlayerProps>(function Player(
    { events },
    ref
) {
    const containerRef = useRef<HTMLDivElement>(null)
    const playerRef = useRef<any>(null)

    useImperativeHandle(ref, () => ({
        seekTo: (timestamp: number) => {
            if (playerRef.current) {
                const baseTime = events[0]?.timestamp || 0
                const offset = timestamp - baseTime
                playerRef.current.goto(offset, false)
            }
        },
        play: () => {
            if (playerRef.current) {
                playerRef.current.play()
            }
        },
        pause: () => {
            if (playerRef.current) {
                playerRef.current.pause()
            }
        },
    }))

    useEffect(() => {
        if (!containerRef.current || events.length === 0) return

        // Dynamically import rrweb-player (client-side only)
        const initPlayer = async () => {
            const rrwebPlayer = (await import('rrweb-player')).default

            // Clear any existing player
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
            }

            // Create new player
            playerRef.current = new rrwebPlayer({
                target: containerRef.current!,
                props: {
                    events,
                    showController: true,
                    autoPlay: false,
                    width: 800,
                    height: 500,
                    speedOption: [1, 2, 4, 8],
                },
            })
        }

        initPlayer()

        return () => {
            if (playerRef.current) {
                playerRef.current = null
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
            }
        }
    }, [events])

    return (
        <div className="flex items-center justify-center p-4 bg-surface rounded-xl shadow-lg">
            <div
                ref={containerRef}
                className="rr-player-wrapper"
                style={{
                    '--primary': '#b05a36',
                } as React.CSSProperties}
            />
        </div>
    )
})
