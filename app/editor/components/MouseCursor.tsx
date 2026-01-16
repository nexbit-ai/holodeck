'use client'

import { useEffect, useState } from 'react'

interface MouseCursorProps {
    x: number
    y: number
    animate?: boolean
}

export function MouseCursor({ x, y, animate = true }: MouseCursorProps) {
    const [position, setPosition] = useState({ x, y })

    useEffect(() => {
        setPosition({ x, y })
    }, [x, y])

    return (
        <div
            className="absolute pointer-events-none z-50 transition-all"
            style={{
                left: position.x,
                top: position.y,
                transitionDuration: animate ? '500ms' : '0ms',
                transitionTimingFunction: 'ease-out',
            }}
        >
            {/* Cursor icon */}
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-lg"
                style={{ transform: 'translate(-2px, -2px)' }}
            >
                <path
                    d="M5.5 3.21V20.79L11.04 15.25H18.5L5.5 3.21Z"
                    fill="white"
                    stroke="#000"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Click ripple effect */}
            <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-primary/30 animate-ping" />
        </div>
    )
}
