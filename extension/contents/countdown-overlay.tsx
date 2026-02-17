import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useEffect, useState } from "react"

export const config: PlasmoCSConfig = {
    matches: ["<all_urls>"],
    run_at: "document_idle"
}

// Inject styles into the shadow DOM
export const getStyle: PlasmoGetStyle = () => {
    const style = document.createElement("style")
    style.textContent = `
        @keyframes countdownPulse {
            0% {
                transform: scale(0.5);
                opacity: 0;
            }
            50% {
                transform: scale(1.1);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }

        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: scale(1);
            }
            to {
                opacity: 0;
                transform: scale(0.8);
            }
        }

        @keyframes slideDown {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @keyframes overlayFadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }

        .countdown-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            animation: overlayFadeIn 0.3s ease-out;
        }

        .recording-pill {
            position: absolute;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: #b05a36;
            color: white;
            padding: 8px 20px;
            border-radius: 24px;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 12px rgba(176, 90, 54, 0.4);
            animation: slideDown 0.4s ease-out;
        }

        .countdown-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 32px;
        }

        .countdown-number {
            font-size: 160px;
            font-weight: 700;
            color: white;
            text-shadow: 0 4px 24px rgba(0, 0, 0, 0.3);
            line-height: 1;
            animation: countdownPulse 0.6s ease-out;
        }

        .countdown-number.fade-out {
            animation: fadeOut 0.3s ease-in forwards;
        }

        .cancel-button {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            transition: all 0.2s ease;
        }

        .cancel-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        .cancel-button:active {
            transform: scale(0.95);
        }

        .cancel-button svg {
            width: 28px;
            height: 28px;
            color: #333;
        }

        .starting-text {
            font-size: 18px;
            color: rgba(255, 255, 255, 0.8);
            margin-top: -16px;
            font-weight: 500;
        }
    `
    return style
}

function CountdownOverlay() {
    const [isVisible, setIsVisible] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const [isFadingOut, setIsFadingOut] = useState(false)

    useEffect(() => {
        const handleMessage = (
            message: any,
            _sender: chrome.runtime.MessageSender,
            sendResponse: (response?: any) => void
        ) => {
            if (message.type === "SHOW_COUNTDOWN") {
                setIsVisible(true)
                setCountdown(3)
                setIsFadingOut(false)
                sendResponse({ success: true })
                return true
            }

            if (message.type === "HIDE_COUNTDOWN") {
                setIsVisible(false)
                sendResponse({ success: true })
                return true
            }

            return false
        }

        chrome.runtime.onMessage.addListener(handleMessage)
        return () => chrome.runtime.onMessage.removeListener(handleMessage)
    }, [])

    // Countdown timer logic
    useEffect(() => {
        if (!isVisible) return

        const timer = setInterval(() => {
            setIsFadingOut(true)

            setTimeout(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        // Countdown complete - hide overlay first, then trigger recording
                        clearInterval(timer)
                        setIsVisible(false)

                        // Dispatch after React has unmounted the overlay so it's not in the captured snapshot
                        requestAnimationFrame(() => {
                            window.dispatchEvent(new CustomEvent("nexbit-countdown-complete"))
                        })

                        return 0
                    }
                    setIsFadingOut(false)
                    return prev - 1
                })
            }, 300)
        }, 1000)

        return () => clearInterval(timer)
    }, [isVisible])

    const handleCancel = () => {
        setIsVisible(false)
        // Dispatch custom event for cancellation
        window.dispatchEvent(new CustomEvent("nexbit-countdown-cancelled"))
    }

    if (!isVisible) return null

    return (
        <div className="countdown-overlay" data-nexbit-recording-overlay>
            <div className="recording-pill">Recording area</div>

            <div className="countdown-container">
                <div
                    key={countdown}
                    className={`countdown-number ${isFadingOut ? "fade-out" : ""}`}
                >
                    {countdown}
                </div>

                <button className="cancel-button" onClick={handleCancel} title="Cancel recording">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export default CountdownOverlay
