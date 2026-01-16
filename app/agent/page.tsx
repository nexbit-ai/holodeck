"use client";

import { 
  Play,
  Mic,
  Send,
  Sparkles,
  ArrowRight,
  Loader2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ClickSlideDeck } from "../editor/components/ClickSlideDeck";
import type { ClickRecording } from "../editor/types/recording";
import { isClickRecording } from "../editor/types/recording";

interface Message {
  id: number;
  text: string;
  sender: "user" | "nex";
  timestamp: Date;
  button?: {
    text: string;
    action: () => void;
  };
}

interface Recording {
  id: string;
  filename: string;
  title: string;
  date: string;
  size: number;
  creator: string;
  thumbnail?: {
    html: string;
    viewportWidth: number;
    viewportHeight: number;
  };
}


export default function AgentPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hey! I'm Nex. I'm here to help you explore AdoptAI - The Next-Gen Agentification Platform for the Enterprise. \n Want to learn more or jump straight into demos?",
      sender: "nex",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForBookingResponse, setWaitingForBookingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Demo player state
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedDemo, setSelectedDemo] = useState<Recording | null>(null);
  const [demoContent, setDemoContent] = useState<ClickRecording | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch available demos
  useEffect(() => {
    async function fetchDemos() {
      try {
        const response = await fetch('/api/recordings');
        const data = await response.json();
        if (data.recordings && data.recordings.length > 0) {
          setRecordings(data.recordings);
          // Select the first demo by default
          setSelectedDemo(data.recordings[0]);
        }
      } catch (err) {
        console.error('Error fetching demos:', err);
      }
    }
    fetchDemos();
  }, []);


  // Load demo content when a demo is selected
  useEffect(() => {
    async function loadDemoContent() {
      if (!selectedDemo) return;

      setIsLoadingDemo(true);
      try {
        const response = await fetch(`/api/recordings?id=${encodeURIComponent(selectedDemo.id)}`);
        const data = await response.json();

        if (data.content) {
          // Check if it's a click recording
          if (isClickRecording(data.content)) {
            setDemoContent(data.content);
            setCurrentSlideIndex(0);
          } else if (data.content.recording && isClickRecording(data.content.recording)) {
            setDemoContent(data.content.recording);
            setCurrentSlideIndex(0);
          }
        }
      } catch (err) {
        console.error('Error loading demo content:', err);
      } finally {
        setIsLoadingDemo(false);
      }
    }

    loadDemoContent();
  }, [selectedDemo]);

  const handleSlideChange = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    const userMessage: Message = {
      id: messages.length + 1,
      text: userInput,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Check if waiting for booking response
    if (waitingForBookingResponse) {
      const lowerInput = userInput.toLowerCase();
      if (lowerInput === "yes" || lowerInput === "y" || lowerInput.includes("yes")) {
        setTimeout(() => {
          const bookingMessage: Message = {
            id: messages.length + 2,
            text: "Great! Let's get you scheduled for a full demo with our team.",
            sender: "nex",
            timestamp: new Date(),
            button: {
              text: "Book a Demo",
              action: () => {
                // Handle booking action - could open a modal or redirect
                window.open("https://calendly.com/kp-nexbit/30min", "_blank");
              }
            }
          };
          setMessages(prev => [...prev, bookingMessage]);
          setWaitingForBookingResponse(false);
          setIsTyping(false);
        }, 1000);
        return;
      } else {
        setTimeout(() => {
          const nexMessage: Message = {
            id: messages.length + 2,
            text: "No problem! Feel free to ask if you change your mind or have any questions.",
            sender: "nex",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nexMessage]);
          setWaitingForBookingResponse(false);
          setIsTyping(false);
        }, 1000);
        return;
      }
    }

    // Simulate AI response
    setTimeout(() => {
      let responseText = "";
      let shouldAskForBooking = false;
      const lowerInput = userInput.toLowerCase();

      if (lowerInput.includes("demo") || lowerInput.includes("watch")) {
        if (lowerInput.includes("ai") || lowerInput.includes("agent")) {
          responseText = "Showing demo of AI agents.";
        } else {
          responseText = "Cool, which demo do you want to watch first?";
        }
      } else if (lowerInput.includes("pricing") || lowerInput.includes("price")) {
        responseText = "I can show you our pricing plans. Would you like to see the demo for Pricing & Plans?";
      } else if (lowerInput.includes("integration") || lowerInput.includes("integrate")) {
        responseText = "Our integration demo shows how Lattice connects with your favorite tools. Want to watch it?";
      } else if (lowerInput.includes("analytics") || lowerInput.includes("data")) {
        responseText = "The Analytics demo showcases our powerful reporting features. Should I start it?";
      } else {
        responseText = "here you go";
        shouldAskForBooking = true;
      }

      const nexMessage: Message = {
        id: messages.length + 2,
        text: responseText,
        sender: "nex",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, nexMessage]);
      
      // If "here you go" was sent, ask about booking
      if (shouldAskForBooking) {
        setTimeout(() => {
          const bookingQuestion: Message = {
            id: messages.length + 3,
            text: "Do you want to book a full demo with team?",
            sender: "nex",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, bookingQuestion]);
          setWaitingForBookingResponse(true);
          setIsTyping(false);
        }, 1500);
      } else {
        setIsTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Column - Demo Player (60%) */}
      <div className="w-[60%] flex flex-col border-r border-primary/10 overflow-hidden h-screen">
        {/* Demo Player Area */}
        <div className="flex-1 flex flex-col bg-surface overflow-hidden">
          {isLoadingDemo ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-sm text-foreground/60">Loading demo...</p>
              </div>
            </div>
          ) : !demoContent || !demoContent.snapshots || demoContent.snapshots.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Demo Player</h3>
                <p className="text-sm text-foreground/60">
                  {recordings.length === 0 
                    ? "No demos available. Create a demo first." 
                    : "Select a demo to play"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <ClickSlideDeck
                recording={demoContent}
                currentSlideIndex={currentSlideIndex}
                onSlideChange={handleSlideChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Chatbot (40%) */}
      <div className="w-[40%] flex flex-col bg-surface border-l border-primary/10 h-screen overflow-hidden">
        {/* Chat Header */}
        <div className="bg-surface border-b border-primary/10 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Nex AI Demo Assistant</h2>
              <p className="text-xs text-foreground/60">Always here to help</p>
            </div>
          </div>
          <button className="px-3 py-1.5 bg-primary/5 text-primary rounded-lg text-xs font-medium hover:bg-primary/10 transition-colors flex items-center gap-1">
            Book Full Demo
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === "user"
                    ? "bg-primary text-white"
                    : "bg-background border border-primary/10 text-foreground"
                }`}
              >
                {message.sender === "nex" && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary">Nex</span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                {message.button && (
                  <div className="mt-3">
                    <button
                      onClick={message.button.action}
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
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
              <div className="bg-background border border-primary/10 rounded-lg px-4 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-primary/10 p-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button className="p-2 text-foreground/60 hover:text-foreground hover:bg-primary/5 rounded-lg transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about pricing, integrations, features..."
              className="flex-1 px-4 py-2 bg-background border border-primary/10 rounded-lg text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-foreground/40 mt-2 text-center">
            Nex can help you explore demos and answer questions
          </p>
        </div>
      </div>
    </div>
  );
}
