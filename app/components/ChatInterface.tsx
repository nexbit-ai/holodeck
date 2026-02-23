"use client";

import {
    Mic,
    Send,
    Sparkles,
    ArrowRight,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { chatService } from "../services/chatService";
import { welcomeService } from "../services/welcomeService";
import { chatLogsService, ChatMessage, Conversation } from "../services/chatLogsService";

const DEFAULT_ORGANIZATION_ID = "demo-org";

interface Message {
    id: string | number;
    text: string;
    sender: "user" | "nex";
    timestamp: Date;
    button?: {
        text: string;
        action: () => void;
    };
}

interface ChatInterfaceProps {
    organizationId?: string;
    className?: string;
    showHeader?: boolean;
    primaryColor?: string;
    secondaryColor?: string;
    conversationId?: string | null;
    onConversationIdChange?: (conversationId: string) => void;
    /** When true (e.g. public showcase page), skip auth-required API calls to avoid 401 redirect */
    publicView?: boolean;
    /** Showcase ID for public-view chat; used with public chat endpoint */
    showcaseId?: string;
}

export function ChatInterface({
    organizationId = DEFAULT_ORGANIZATION_ID,
    className = "",
    showHeader = true,
    primaryColor = "#6366F1",
    secondaryColor = "#10B981",
    conversationId: initialConversationId = null,
    onConversationIdChange,
    publicView = false,
    showcaseId,
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId);
    // Add a loading state for the initial welcome message to prevent flash
    const [isInitializing, setIsInitializing] = useState(true);
    // Track if component is mounted to prevent hydration mismatches
    const [isMounted, setIsMounted] = useState(false);
    // Track whether we've attempted to load existing history from the backend
    const [historyChecked, setHistoryChecked] = useState(false);
    // Track clear-chat action
    const [isClearing, setIsClearing] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    const handleBookDemoClick = () => {
        // Open Calendly booking link in a new tab (keeps CTA styling/theme in UI).
        if (typeof window !== "undefined") {
            window.open("https://calendly.com/raj-highrev/new-meeting", "_blank", "noopener,noreferrer");
        }
    };

    // Set mounted flag on client side only
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // On mount, try to hydrate the chat from the latest existing conversation
    // Skip when publicView (showcase) or when we have initialConversationId - avoid auth-required calls for unauthenticated viewers
    useEffect(() => {
        const loadLatestConversation = async () => {
            try {
                if (publicView) {
                    // Public showcase: don't call any auth-required API; show welcome fallback only
                    setHistoryChecked(true);
                    return;
                }
                if (initialConversationId) {
                    // Public showcase with a specific chat - load that conversation's messages if we can (may 401 when unauthenticated)
                    try {
                        const msgs: ChatMessage[] = await chatLogsService.getMessages(initialConversationId, organizationId);
                        if (msgs && msgs.length > 0) {
                            const mappedMessages: Message[] = msgs.map((m) => ({
                                id: m.id,
                                text: m.content,
                                sender: m.role === "user" ? "user" : "nex",
                                timestamp: new Date(m.created_at),
                            }));
                            setMessages(mappedMessages);
                        }
                    } catch {
                        // Unauthenticated (e.g. public view) - leave messages empty; welcome fallback will show
                    }
                    setHistoryChecked(true);
                    return;
                }

                const conversations: Conversation[] = await chatLogsService.getConversations(organizationId);
                if (conversations && conversations.length > 0) {
                    const latest = conversations[0]; // backend returns most recent first
                    setConversationId(latest.id);
                    if (onConversationIdChange) {
                        onConversationIdChange(latest.id);
                    }

                    const msgs: ChatMessage[] = await chatLogsService.getMessages(latest.id, organizationId);
                    if (msgs && msgs.length > 0) {
                        const mappedMessages: Message[] = msgs.map((m) => ({
                            id: m.id,
                            text: m.content,
                            sender: m.role === "user" ? "user" : "nex",
                            timestamp: new Date(m.created_at),
                        }));
                        setMessages(mappedMessages);
                    }
                }
            } catch (error) {
                console.error("Failed to load existing chat history for playground:", error);
            } finally {
                setHistoryChecked(true);
            }
        };

        loadLatestConversation();
    }, [organizationId, initialConversationId, publicView]);

    // Sync conversationId when prop changes
    useEffect(() => {
        if (initialConversationId !== null && initialConversationId !== conversationId) {
            setConversationId(initialConversationId);
        }
    }, [initialConversationId]);

    // Fetch welcome message on mount (only if no existing history)
    useEffect(() => {
        // Wait until we've checked for existing history so we don't overwrite it
        if (!historyChecked) return;

        const initChat = async () => {
            try {
                let welcomeMsg;
                if (publicView && showcaseId) {
                    // Public showcase: fetch welcome message via public endpoint (org resolved from showcaseId)
                    welcomeMsg = await welcomeService.getPublicDefaultWelcomeForShowcase(showcaseId);
                } else {
                    // Authenticated/portal: use org-scoped welcome API
                    welcomeMsg = await welcomeService.getDefaultWelcomeMessage(organizationId);
                }
                setMessages([
                    {
                        id: "welcome",
                        text: welcomeMsg.message,
                        sender: "nex",
                        timestamp: new Date()
                    }
                ]);
            } catch (error) {
                console.warn("Failed to fetch welcome message, using fallback:", error);
                // Fallback to hardcoded message if API fails or no message exists
                setMessages([
                    {
                        id: 1,
                        text: "Hey! I'm Nex. I'm here to help you explore AdoptAI - The Next-Gen Agentification Platform for the Enterprise. \n Want to learn more or jump straight into demos?",
                        sender: "nex",
                        timestamp: new Date()
                    }
                ]);
            } finally {
                setIsInitializing(false);
            }
        };

        if (messages.length === 0) {
            initChat();
        } else {
            setIsInitializing(false);
        }
    }, [organizationId, historyChecked, messages.length, publicView, showcaseId]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userInput = inputValue.trim();
        const userMessage: Message = {
            id: Date.now(),
            text: userInput,
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue("");
        setIsTyping(true);

        try {
            let response;
            if (publicView && showcaseId) {
                // Public showcase chat: use dedicated public endpoint (no auth)
                response = await chatService.sendPublicShowcaseMessage(showcaseId, userInput, conversationId);
            } else {
                // Authenticated/portal chat: use regular chat endpoint
                response = await chatService.sendMessage(userInput, organizationId, conversationId);
            }

            if (response.conversation_id && response.conversation_id !== conversationId) {
                setConversationId(response.conversation_id);
                if (onConversationIdChange) {
                    onConversationIdChange(response.conversation_id);
                }
            }

            const nexMessage: Message = {
                id: response.message_id,
                text: response.response,
                sender: "nex",
                timestamp: new Date(),
                button: response.cta?.type === "BOOK_DEMO"
                    ? {
                        text: "Book a demo",
                        action: handleBookDemoClick,
                    }
                    : undefined,
            };

            setMessages(prev => [...prev, nexMessage]);
        } catch (error) {
            console.error("Failed to send message:", error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: "Sorry, I encountered an error. Please try again later.",
                sender: "nex",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChatClick = () => {
        // Nothing to clear
        if (!conversationId && messages.length === 0) {
            return;
        }
        setShowClearModal(true);
    };

    const handleConfirmClearChat = async () => {
        if (isClearing) return;

        setIsClearing(true);
        try {
            // Delete all conversations for this organization so the playground starts fresh
            const conversations: Conversation[] = await chatLogsService.getConversations(organizationId);
            await Promise.all(
                conversations.map((conv) =>
                    chatLogsService
                        .deleteConversation(conv.id, organizationId)
                        .catch((error) => {
                            console.error("Failed to delete conversation during clear chat:", error);
                        })
                )
            );
        } catch (error) {
            console.error("Failed to clear chat conversation:", error);
        } finally {
            // Reset local state; welcome message hook will reinitialize
            setConversationId(null);
            setMessages([]);
            setIsInitializing(true);
            setIsClearing(false);
            setShowClearModal(false);
        }
    };

    const handleCancelClearChat = () => {
        if (isClearing) return;
        setShowClearModal(false);
    };

    return (
        <div className={`flex flex-col h-full bg-surface overflow-hidden ${className}`}>
            {/* Chat Header */}
            {showHeader && (
                <div className="bg-surface border-b px-6 py-5 flex items-center justify-between flex-shrink-0" style={{ borderColor: primaryColor + '10' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: primaryColor }}>
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-foreground text-lg tracking-tight">Nex AI Assistant</h2>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <p className="text-xs text-foreground/50 font-medium">Always online</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleClearChatClick}
                            disabled={isClearing}
                            className="px-4 py-2 rounded-xl text-xs font-bold border border-primary/10 text-foreground/60 hover:text-primary hover:bg-primary/5 transition-all disabled:opacity-50"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleBookDemoClick}
                            className="btn-terracotta px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                            Book Full Demo
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${message.sender === "user"
                                ? "text-white"
                                : "text-foreground"
                                }`}
                            style={message.sender === "user"
                                ? { backgroundColor: primaryColor }
                                : { backgroundColor: secondaryColor + '15', border: `1px solid ${secondaryColor}30` }
                            }
                        >
                            {message.sender === "nex" && (
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center">
                                        <Sparkles className="w-3 h-3 text-primary" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Nex Assistant</span>
                                </div>
                            )}
                            <p className="text-sm leading-relaxed">{message.text}</p>
                            {message.button && (
                                <div className="mt-4">
                                    <button
                                        onClick={message.button.action}
                                        className="btn-terracotta w-full px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-md"
                                    >
                                        {message.button.text}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <div className="flex items-center justify-end mt-2 opacity-40">
                                <span className="text-[9px] font-medium tracking-wide uppercase" suppressHydrationWarning>
                                    {isMounted ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="rounded-lg px-4 py-2" style={{ backgroundColor: secondaryColor + '15', border: `1px solid ${secondaryColor}30` }}>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: secondaryColor, animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: secondaryColor, animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: secondaryColor, animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Initializing indicator (optional, but nice) */}
                {isInitializing && messages.length === 0 && (
                    <div className="flex justify-start">
                        <div className="rounded-lg px-4 py-2" style={{ backgroundColor: secondaryColor + '15', border: `1px solid ${secondaryColor}30` }}>
                            <span className="text-xs text-foreground/50">Initializing...</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-background/50 border-t border-primary/10 flex-shrink-0">
                <div className="relative group">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about pricing, integrations..."
                        className="w-full pl-5 pr-14 py-4 bg-surface border border-primary/10 rounded-2xl text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all shadow-sm premium-surface"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 btn-terracotta rounded-xl transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed group-hover:scale-105 active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-[10px] text-foreground/30 mt-3 text-center uppercase font-bold tracking-widest">
                    Nexbit AI Engine
                </p>
            </div>

            {/* Clear Chat Modal */}
            {showClearModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-surface rounded-xl shadow-xl border border-primary/10 max-w-sm w-full mx-4 p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Clear chat?</h3>
                        <p className="text-sm text-foreground/70 mb-4">
                            This will delete the current conversation history for this playground chat. You won&apos;t be able to see these messages again.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCancelClearChat}
                                disabled={isClearing}
                                className="px-4 py-2 text-sm rounded-lg border border-primary/10 text-foreground hover:bg-primary/5 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmClearChat}
                                disabled={isClearing}
                                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {isClearing ? "Clearing..." : "Clear chat"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
