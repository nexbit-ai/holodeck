"use client";

import {
  Play,
  Loader2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ClickSlideDeck } from "../editor/components/ClickSlideDeck";
import { ClickRecording } from "../editor/types/recording";
import { isClickRecording } from "../editor/types/recording";
import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";
import { chatService } from "../services/chatService";
import { ChatInterface } from "../components/ChatInterface";

const ORGANIZATION_ID = "demo-org";

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
  const [conversationId, setConversationId] = useState<string | null>(null);

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
      id: Date.now(), // Temporary ID until backend confirms (or just keep it local)
      text: userInput,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(userInput, ORGANIZATION_ID, conversationId);

      // Update conversation ID if it's new
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
    <div className="min-h-screen bg-background flex">
      {/* Left Column - Demo Player (60%) */}
      <Group orientation="horizontal" className="min-h-screen border-t border-primary/10">
        {/* Left Column - Demo Player (60%) */}
        <Panel defaultSize={60} minSize={30}>
          <div className="flex flex-col h-full border-r border-primary/10 overflow-hidden">
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
        </Panel>

        <Separator className="w-1 bg-primary/10 hover:bg-primary/20 transition-colors cursor-col-resize" />

        {/* Right Column - Chatbot (40%) */}
        <Panel defaultSize={40} minSize={30}>
          <div className="flex flex-col h-full bg-surface border-l border-primary/10 overflow-hidden">
            <ChatInterface className="h-full" />
          </div>
        </Panel>
      </Group>
    </div>
  );
}
