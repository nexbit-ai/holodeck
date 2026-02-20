"use client";

import { useState } from "react";
import { X, Puzzle, Pin, ExternalLink, Chrome } from "lucide-react";
import Image from "next/image";

interface NewDemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function NewDemoModal({ isOpen, onClose }: NewDemoModalProps) {
    const [showTroubleshooting, setShowTroubleshooting] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
            <div
                className="bg-surface premium-surface border-none rounded-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-primary/10 bg-surface">
                    <h2 className="text-2xl font-bold text-foreground">Create New Demo</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-primary/10 rounded-full transition-colors duration-200 text-foreground/60 hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {/* Main Action - Install Extension */}
                    <div className="flex flex-col items-center mb-10">
                        <p className="text-foreground/70 text-center mb-6 max-w-md">
                            To create a demo, you'll need the Nexbit Demo Builder Chrome extension. It allows you to capture your screen and automatically generates a guide.
                        </p>

                        <a
                            href="https://chromewebstore.google.com/detail/mnjgjmfmfeoaeajgbbnnadomdfnjehkc"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-terracotta group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg"
                        >
                            <Chrome className="w-6 h-6" />
                            <span>Install Chrome Extension</span>
                            <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                        </a>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-lg font-semibold text-foreground border-b border-primary/10 pb-2">
                            How to record a demo
                        </h3>

                        <div className="grid gap-6">
                            {/* Step 1 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground mb-1">Open the website</h4>
                                    <p className="text-sm text-foreground/60">
                                        Navigate to the website or application you want to record.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground mb-1">Start recording</h4>
                                    <div className="flex items-center gap-2 text-sm text-foreground/60 flex-wrap">
                                        <span>Click the extension icon</span>
                                        <div className="inline-flex items-center justify-center w-6 h-6 bg-surface border border-primary/10 rounded shadow-sm">
                                            <Image
                                                src="/extension-icon.png"
                                                alt="Extension Icon"
                                                width={16}
                                                height={16}
                                                className="object-contain" // Use object-contain to be safe
                                            />
                                        </div>
                                        <span>in your browser toolbar, then click "Start Recording".</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground mb-1">Capture your flow</h4>
                                    <p className="text-sm text-foreground/60">
                                        Perform actions as you normally would. The extension will automatically capture clicks and typing.
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    4
                                </div>
                                <div>
                                    <h4 className="font-medium text-foreground mb-1">Finish recording</h4>
                                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                                        <span>Click the stop button</span>
                                        <div className="w-4 h-4 rounded-full border border-red-500 flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        </div>
                                        <span>to end the session. Your demo will be ready instantly.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Troubleshooting Accordion */}
                    <div className="mt-10 border border-primary/10 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                            className="w-full flex items-center justify-between px-6 py-4 bg-primary/5 hover:bg-primary/10 transition-colors text-left group"
                        >
                            <span className="font-bold text-primary group-hover:translate-x-1 transition-transform inline-block">Can't find the extension icon?</span>
                            <div className={`transform transition-transform duration-300 ${showTroubleshooting ? 'rotate-180' : ''}`}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </button>

                        {showTroubleshooting && (
                            <div className="p-6 bg-surface">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Puzzle className="w-5 h-5 text-foreground/60" />
                                        <p className="text-sm text-foreground/80">
                                            1. Click the <span className="font-bold">puzzle piece icon</span> in the top right of your Chrome toolbar.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Pin className="w-5 h-5 text-foreground/60" />
                                        <p className="text-sm text-foreground/80">
                                            2. Find "Nexbit Demo Builder" in the list and click the <span className="font-bold">pin icon</span> to make it always visible.
                                        </p>
                                    </div>

                                    {/* Visual Aid Placeholder - CSS representation of the puzzle menu */}
                                    <div className="mt-4 p-4 bg-background rounded-lg border border-primary/10 max-w-sm mx-auto">
                                        <div className="flex items-center justify-between p-2 border-b border-primary/5 mb-2">
                                            <span className="text-xs font-semibold text-foreground/60">Extensions</span>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded hover:bg-primary/5">
                                            <div className="flex items-center gap-2">
                                                <Image src="/extension-icon.png" width={16} height={16} alt="icon" />
                                                <span className="text-xs text-foreground font-medium">Nexbit Demo Builder</span>
                                            </div>
                                            <Pin className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                                        </div>
                                    </div>

                                    <p className="text-xs text-foreground/40 mt-4">
                                        If you still don't see it, try reloading the page or downloading it again.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
