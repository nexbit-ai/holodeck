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
import { API_BASE_URL } from "../../../utils/config";

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
  const [viewerId, setViewerId] = useState<string | null>(null);

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

  // Generate or retrieve a stable anonymous viewer/session ID for this showcase
  useEffect(() => {
    if (!showcaseId) return;
    if (typeof window === "undefined") return;

    const key = `nexbit_viewer_id_${showcaseId}`;
    let existing = window.localStorage.getItem(key);
    if (!existing) {
      // Prefer crypto.randomUUID when available
      const newId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `viewer_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
      window.localStorage.setItem(key, newId);
      existing = newId;
    }
    setViewerId(existing);
  }, [showcaseId]);

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
        // Try to fetch recording via dedicated public showcase demo endpoint first
        // If that doesn't work, fall back to the regular endpoint (might require auth)
        let data;
        try {
          // Public backend endpoint: resolves organization from showcaseId server-side
          const publicResponse = await fetch(`${API_BASE_URL}/public/showcases/${showcaseId}/demo`);
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

  // Track a "view" event for this public showcase, including the anonymous viewerId
  useEffect(() => {
    async function trackView() {
      if (!showcase || !showcase.live || !viewerId) return;
      try {
        await fetch(`${API_BASE_URL}/public/showcases/${showcaseId}/track`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_type: "view",
            metadata: {
              viewer_id: viewerId,
            },
          }),
        });
      } catch (err) {
        console.error("Error tracking showcase view:", err);
      }
    }

    trackView();
  }, [showcaseId, showcase, viewerId]);

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
    <div className="h-[100dvh] w-full bg-background flex flex-col overflow-hidden" style={{
      '--showcase-primary': primaryColor,
      '--showcase-secondary': secondaryColor,
      '--showcase-accent': accentColor
    } as React.CSSProperties}>
      {/* Header for Public View */}
      <div className="px-8 py-4 bg-background/80 backdrop-blur-md border-b border-primary/10 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-primary fill-current" />
          </div>
          <h1 className="font-bold text-foreground tracking-tight">{showcase.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg">
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Nexbit Interactive Demo</span>
          </div>
        </div>
      </div>

      {/* Demo Player and Chat Interface */}
      <div className="flex-1 flex overflow-hidden">
        <Group orientation="horizontal" className="w-full h-full">
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
                      viewOnly={true}
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
                publicView={true}
                viewerId={viewerId}
                showcaseId={showcaseId}
              />
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
