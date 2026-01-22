"use client";

import {
  Play,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ClickSlideDeck } from "../../../editor/components/ClickSlideDeck";
import { ClickRecording, isClickRecording } from "../../../editor/types/recording";
import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";
import { ChatInterface } from "../../../components/ChatInterface";
import { recordingService } from "../../../services/recordingService";

interface Showcase {
  id: string;
  title: string;
  organizationId: string;
  demoId: string | null;
  chatId: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  accentColor: string | null;
  showcaseShareLink: string | null;
  live: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PublicShowcasePage() {
  const params = useParams();
  const showcaseId = params?.id as string;

  const [showcase, setShowcase] = useState<Showcase | null>(null);
  const [isLoadingShowcase, setIsLoadingShowcase] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Demo player state
  const [demoContent, setDemoContent] = useState<ClickRecording | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  // Colors from showcase or defaults
  const primaryColor = showcase?.primaryColor || "#6366F1";
  const secondaryColor = showcase?.secondaryColor || "#10B981";
  const accentColor = showcase?.accentColor || "#F59E0B";

  // Set mounted flag on client side only
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch showcase data
  useEffect(() => {
    async function fetchShowcase() {
      if (!showcaseId) {
        setError("Showcase ID is required");
        setIsLoadingShowcase(false);
        return;
      }

      setIsLoadingShowcase(true);
      setError(null);

      try {
        const response = await fetch(`/api/view/showcases/${showcaseId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Showcase not found");
          } else {
            const errorData = await response.json().catch(() => ({}));
            setError(errorData.error || "Failed to load showcase");
          }
          setIsLoadingShowcase(false);
          return;
        }

        const data = await response.json();
        setShowcase(data);

        // Check if showcase is live
        if (!data.live) {
          setError("This showcase is not currently available");
        }
      } catch (err) {
        console.error("Error fetching showcase:", err);
        setError("Failed to load showcase. Please try again later.");
      } finally {
        setIsLoadingShowcase(false);
      }
    }

    fetchShowcase();
  }, [showcaseId]);

  // Load demo content when showcase is loaded and demoId exists
  useEffect(() => {
    async function loadDemoContent() {
      if (!showcase || !showcase.demoId) {
        setDemoContent(null);
        setIsLoadingDemo(false);
        return;
      }

      setIsLoadingDemo(true);
      try {
        // Try to fetch recording via public API endpoint first
        // If that doesn't work, try the regular endpoint (might require auth)
        let data;
        try {
          // Try public endpoint first
          const publicResponse = await fetch(`/api/v1/recordings/${showcase.demoId}?organization_id=${encodeURIComponent(showcase.organizationId)}`);
          if (publicResponse.ok) {
            data = await publicResponse.json();
          } else {
            // Fallback to recordingService (might require auth)
            data = await recordingService.getRecording(showcase.demoId, showcase.organizationId);
          }
        } catch {
          // If public endpoint fails, try recordingService
          try {
            data = await recordingService.getRecording(showcase.demoId, showcase.organizationId);
          } catch (serviceErr) {
            console.warn("Could not load demo content - it may require authentication:", serviceErr);
            // Don't throw - just show the showcase without demo
            setIsLoadingDemo(false);
            return;
          }
        }

        if (data) {
          // If the data is already the recording content
          if (isClickRecording(data)) {
            setDemoContent(data);
            setCurrentSlideIndex(0);
          }
          // Support backend format with 'events' field
          else if (data.events && Array.isArray(data.events)) {
            setDemoContent({
              version: "2.0",
              startTime: data.startTime || 0,
              snapshots: data.events
            });
            setCurrentSlideIndex(0);
          }
          // Traditional content wrapping
          else if (data.content) {
            if (isClickRecording(data.content)) {
              setDemoContent(data.content);
              setCurrentSlideIndex(0);
            } else if (data.content.recording && isClickRecording(data.content.recording)) {
              setDemoContent(data.content.recording);
              setCurrentSlideIndex(0);
            }
          }
        }
      } catch (err) {
        console.error("Error loading demo content:", err);
        // Don't set error here - just log it, as the showcase might not have a demo
        // The page will still render with the chat interface
      } finally {
        setIsLoadingDemo(false);
      }
    }

    if (showcase && showcase.live) {
      loadDemoContent();
    } else {
      setIsLoadingDemo(false);
    }
  }, [showcase]);

  const handleSlideChange = (index: number) => {
    setCurrentSlideIndex(index);
  };

  // Show loading state (only after mount to prevent hydration mismatch)
  if (!isMounted || isLoadingShowcase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-foreground/60">Loading showcase...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !showcase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Showcase Not Available</h1>
          <p className="text-sm text-foreground/60">{error || "The showcase you're looking for doesn't exist or is not available."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex" style={{
      '--showcase-primary': primaryColor,
      '--showcase-secondary': secondaryColor,
      '--showcase-accent': accentColor
    } as React.CSSProperties}>
      {/* Demo Player and Chat Interface */}
      <Group orientation="horizontal" className="min-h-screen border-t" style={{ borderColor: primaryColor + '20' }}>
        {/* Left Column - Demo Player (60%) */}
        <Panel defaultSize={60} minSize={30}>
          <div className="flex flex-col h-full border-r overflow-hidden" style={{ borderColor: primaryColor + '20' }}>
            {/* Demo Player Area */}
            <div className="flex-1 flex flex-col bg-surface overflow-hidden">
              {isLoadingDemo ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
                    <p className="text-sm text-foreground/60">Loading demo...</p>
                  </div>
                </div>
              ) : !demoContent || !demoContent.snapshots || demoContent.snapshots.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: primaryColor + '20' }}>
                      <Play className="w-10 h-10" style={{ color: primaryColor }} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{showcase.title}</h3>
                    <p className="text-sm text-foreground/60">
                      No demo content available for this showcase.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-hidden">
                  <ClickSlideDeck
                    recording={demoContent}
                    currentSlideIndex={currentSlideIndex}
                    onSlideChange={handleSlideChange}
                    primaryColor={primaryColor}
                    secondaryColor={secondaryColor}
                    accentColor={accentColor}
                  />
                </div>
              )}
            </div>
          </div>
        </Panel>

        <Separator className="w-1 hover:bg-primary/20 transition-colors cursor-col-resize" style={{ backgroundColor: primaryColor + '20' }} />

        {/* Right Column - Chatbot (40%) */}
        <Panel defaultSize={40} minSize={30}>
          <div className="flex flex-col h-full bg-surface border-l overflow-hidden" style={{ borderColor: primaryColor + '20' }}>
            <ChatInterface
              className="h-full"
              organizationId={showcase.organizationId}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              conversationId={showcase.chatId}
            />
          </div>
        </Panel>
      </Group>
    </div>
  );
}
