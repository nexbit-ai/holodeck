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
}

export function ChatInterface({
    organizationId = DEFAULT_ORGANIZATION_ID,
    className = "",
    showHeader = true,
    primaryColor = "#6366F1",
    secondaryColor = "#10B981"
}: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    // Add a loading state for the initial welcome message to prevent flash
    const [isInitializing, setIsInitializing] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch welcome message on mount
    useEffect(() => {
        const initChat = async () => {
            try {
                const welcomeMsg = await welcomeService.getDefaultWelcomeMessage(organizationId);
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
    }, [organizationId]);

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
            const response = await chatService.sendMessage(userInput, organizationId, conversationId);

            if (response.conversation_id && response.conversation_id !== conversationId) {
                setConversationId(response.conversation_id);
            }

            const nexMessage: Message = {
                id: response.message_id,
                text: response.response,
                sender: "nex",
                timestamp: new Date()
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

    return (
        <div className={`flex flex-col h-full bg-surface overflow-hidden ${className}`}>
            {/* Chat Header */}
            {showHeader && (
                <div className="bg-surface border-b px-4 py-4 flex items-center justify-between flex-shrink-0" style={{ borderColor: primaryColor + '20' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">Nex AI Assistant</h2>
                            <p className="text-xs text-foreground/60">Always here to help</p>
                        </div>
                    </div>
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-primary/10 transition-colors flex items-center gap-1" style={{ backgroundColor: primaryColor + '10', color: primaryColor }}>
                        Book Full Demo
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
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
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold" style={{ color: secondaryColor }}>Nex</span>
                                </div>
                            )}
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            {message.button && (
                                <div className="mt-3">
                                    <button
                                        onClick={message.button.action}
                                        className="w-full px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {message.button.text}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <span className="text-xs opacity-70 mt-1 block">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
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
            <div className="border-t p-4 flex-shrink-0" style={{ borderColor: primaryColor + '20' }}>
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask about pricing, integrations, features..."
                        className="flex-1 px-4 py-2 bg-background border rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2"
                        style={{ borderColor: primaryColor + '20', '--tw-ring-color': primaryColor + '40' } as React.CSSProperties}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="p-2 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
                <p className="text-xs text-foreground/40 mt-2 text-center">
                    Nex can help you explore demos and answer questions
                </p>
            </div>
        </div>
    );
}
