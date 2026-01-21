"use client";

import { Sidebar } from "../components/Sidebar";
import {
    Sparkles,
    Share2,
    Play,
    BarChart3,
    Clock,
    Users,
    ExternalLink,
    Copy,
    Check,
    Plus,
    X,
    FileText,
    LayoutGrid,
    ChevronDown,
    Loader2,
    Mail,
    Linkedin,
    MessageSquare,
    Globe,
    AlertCircle,
    Code
} from "lucide-react";
import { useState, useEffect } from "react";
import { ChatInterface } from "../components/ChatInterface";
import { ClickSlideDeck } from "../editor/components/ClickSlideDeck";
import { isClickRecording, ClickRecording } from "../editor/types/recording";
import {
    Group,
    Panel,
    Separator,
} from "react-resizable-panels";
import { showcaseService, Showcase } from "../services/showcaseService";
import { chatService } from "../services/chatService";
import { recordingService } from "../services/recordingService";

const DEFAULT_ORGANIZATION_ID = "demo-org";

export default function ShowcasePage() {
    const [activeTab, setActiveTab] = useState<"home" | "performance">("home");
    const [viewMode, setViewMode] = useState<"tiles" | "playground">("tiles");
    const [copied, setCopied] = useState(false);
    const [recordings, setRecordings] = useState<any[]>([]);
    const [isLoadingRecordings, setIsLoadingRecordings] = useState(false);
    const [selectedDemoContent, setSelectedDemoContent] = useState<ClickRecording | null>(null);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [showDemoList, setShowDemoList] = useState(false);
    const [primaryColor, setPrimaryColor] = useState("#6366F1");
    const [secondaryColor, setSecondaryColor] = useState("#10B981");
    const [accentColor, setAccentColor] = useState("#F59E0B");
    const [showShareModal, setShowShareModal] = useState(false);
    const [selectedShareShowcase, setSelectedShareShowcase] = useState<Showcase | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [copiedIframe, setCopiedIframe] = useState(false);
    const [showcases, setShowcases] = useState<Showcase[]>([]);
    const [isLoadingShowcases, setIsLoadingShowcases] = useState(false);
    const [isCreatingShowcase, setIsCreatingShowcase] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const [editingShowcase, setEditingShowcase] = useState<Showcase | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);

    // Form state
    const [newShowcase, setNewShowcase] = useState({
        title: "",
        demoId: "",
        ctaText: "Book Full Demo",
        ctaType: "Open Calendar"
    });

    useEffect(() => {
        const fetchRecordings = async () => {
            setIsLoadingRecordings(true);
            try {
                const data = await recordingService.getRecordings();
                setRecordings(data || []);
            } catch (error) {
                console.error('Error fetching recordings:', error);
            } finally {
                setIsLoadingRecordings(false);
            }
        };
        fetchRecordings();
    }, []);

    useEffect(() => {
        const fetchShowcases = async () => {
            setIsLoadingShowcases(true);
            setError(null);
            try {
                const data = await showcaseService.getShowcases(DEFAULT_ORGANIZATION_ID);
                setShowcases(data);
            } catch (err: any) {
                console.error('Error fetching showcases:', err);
                setError(err.message || 'Failed to load showcases');
            } finally {
                setIsLoadingShowcases(false);
            }
        };
        fetchShowcases();
    }, []);

    // Load demo content when demoId changes
    useEffect(() => {
        async function loadDemoContent() {
            if (!newShowcase.demoId) {
                setSelectedDemoContent(null);
                return;
            }

            try {
                const data = await recordingService.getRecording(newShowcase.demoId);

                if (data) {
                    // Check if it's already the recording content
                    if (isClickRecording(data)) {
                        setSelectedDemoContent(data);
                        setCurrentSlideIndex(0);
                    }
                    // Support backend format with 'events' field
                    else if (data.events && Array.isArray(data.events)) {
                        setSelectedDemoContent({
                            version: "2.0",
                            startTime: data.startTime || 0,
                            snapshots: data.events
                        });
                        setCurrentSlideIndex(0);
                    }
                    // Traditional content wrapping
                    else if (data.content) {
                        if (isClickRecording(data.content)) {
                            setSelectedDemoContent(data.content);
                            setCurrentSlideIndex(0);
                        } else if (data.content.recording && isClickRecording(data.content.recording)) {
                            setSelectedDemoContent(data.content.recording);
                            setCurrentSlideIndex(0);
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading demo content:', err);
            }
        }

        loadDemoContent();
    }, [newShowcase.demoId]);

    // Helper function to format date for display (e.g., "21 Jan 2026")
    const formatDate = (dateString: string) => {
        if (!dateString) return "Invalid Date";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid Date";
            return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return "Invalid Date";
        }
    };

    // Helper function to get full share URL
    const getShareUrl = (showcase: Showcase) => {
        if (showcase.showcaseShareLink) {
            // If it's a relative path, prepend the base URL
            if (showcase.showcaseShareLink.startsWith('/')) {
                return `${window.location.origin}${showcase.showcaseShareLink}`;
            }
            return showcase.showcaseShareLink;
        }
        return `${window.location.origin}/showcase/${showcase.id}`;
    };

    // Helper function to get iframe snippet
    const getIframeSnippet = (showcase: Showcase) => {
        const url = getShareUrl(showcase);
        return `<iframe src="${url}" width="100%" height="700" frameborder="0" allowfullscreen></iframe>`;
    };

    const handleCopyIframe = (showcase: Showcase) => {
        const snippet = getIframeSnippet(showcase);
        navigator.clipboard.writeText(snippet);
        setCopiedIframe(true);
        setTimeout(() => setCopiedIframe(false), 2000);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText("https://nexbit.ai/agent/demo-1");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopySpecificLink = (url: string, id: string) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCreateShowcase = async () => {
        if (!newShowcase.title.trim()) {
            setError("Please enter a showcase title");
            return;
        }

        setIsCreatingShowcase(true);
        setError(null);

        try {
            // Create showcase with the form data
            const showcaseData = {
                title: newShowcase.title,
                organizationId: DEFAULT_ORGANIZATION_ID,
                demoId: newShowcase.demoId || undefined,
                chatId: chatId || undefined,
                primaryColor: primaryColor,
                secondaryColor: secondaryColor,
                accentColor: accentColor,
                live: true
            };

            const createdShowcase = await showcaseService.createShowcase(showcaseData);

            // Refresh showcases list
            const updatedShowcases = await showcaseService.getShowcases(DEFAULT_ORGANIZATION_ID);
            setShowcases(updatedShowcases);

            // Reset form and return to tiles view
            setNewShowcase({
                title: "",
                demoId: "",
                ctaText: "Book Full Demo",
                ctaType: "Open Calendar"
            });
            setPrimaryColor("#6366F1");
            setSecondaryColor("#10B981");
            setAccentColor("#F59E0B");
            setChatId(null);
            setSelectedDemoContent(null);
            setEditingShowcase(null);
            setIsCreateMode(false);
            setViewMode("tiles");
        } catch (err: any) {
            console.error('Error creating showcase:', err);
            setError(err.message || 'Failed to create showcase');
        } finally {
            setIsCreatingShowcase(false);
        }
    };

    const handleShare = (type: 'email' | 'linkedin' | 'slack', showcase: Showcase) => {
        const url = getShareUrl(showcase);
        const title = encodeURIComponent(`Check out this interactive demo: ${showcase.title}`);

        switch (type) {
            case 'email':
                window.location.href = `mailto:?subject=${title}&body=I'd love for you to check out this interactive demo on Nexbit: ${url}`;
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'slack':
                // Slack doesn't have a direct share URL like LinkedIn, typically social links are used or deep links
                // For a web tool, we can copy to clipboard and notify user, or use a custom Slack app link if exists.
                // Here we'll just copy and open slack if possible, or just provide a notice.
                navigator.clipboard.writeText(url);
                window.open(`slack://open`, '_blank');
                break;
        }
    };

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar />

            <main className="flex-1 overflow-y-auto relative bg-background/50">
                {/* Header */}
                <div className="px-8 py-6 border-b border-primary/10 bg-surface">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">
                                Agentic Showcase
                            </h1>
                            <p className="text-foreground/70 mt-1">
                                Design and manage interactive experiences for your prospects.
                            </p>
                        </div>
                    </div>

                    {/* Sub Navigation */}
                    <div className="flex gap-8 mt-8">
                        <button
                            onClick={() => {
                                setActiveTab("home");
                                setViewMode("tiles");
                            }}
                            className={`pb-4 text-sm font-medium transition-all relative ${activeTab === "home" ? "text-primary" : "text-foreground/60 hover:text-foreground"
                                }`}
                        >
                            Home
                            {activeTab === "home" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("performance")}
                            className={`pb-4 text-sm font-medium transition-all relative ${activeTab === "performance" ? "text-primary" : "text-foreground/60 hover:text-foreground"
                                }`}
                        >
                            Performance
                            {activeTab === "performance" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8">
                    {activeTab === "home" ? (
                        <div className="animate-in fade-in duration-500">
                            {viewMode === "tiles" ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {/* Add New Showcase Tile */}
                                    <button
                                        onClick={() => {
                                            setNewShowcase({
                                                title: "",
                                                demoId: "",
                                                ctaText: "Book Full Demo",
                                                ctaType: "Open Calendar"
                                            });
                                            setPrimaryColor("#6366F1");
                                            setSecondaryColor("#10B981");
                                            setAccentColor("#F59E0B");
                                            setSelectedDemoContent(null);
                                            setChatId(null);
                                            setEditingShowcase(null);
                                            setIsCreateMode(true);
                                            setViewMode("playground");
                                        }}
                                        className="aspect-[4/3] bg-surface border-2 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Plus className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-foreground">Create New Showcase</p>
                                            <p className="text-xs text-foreground/50">Start a new interaction</p>
                                        </div>
                                    </button>

                                    {/* Existing Showcase Tiles */}
                                    {isLoadingShowcases ? (
                                        <div className="col-span-full flex justify-center py-12">
                                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        </div>
                                    ) : showcases.length === 0 ? (
                                        <div className="col-span-full text-center py-12">
                                            <p className="text-foreground/60">No showcases yet. Create your first one!</p>
                                        </div>
                                    ) : (
                                        showcases.map((sh) => (
                                            <div
                                                key={sh.id}
                                                className="aspect-[4/3] bg-surface border border-primary/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col"
                                            >
                                                <div
                                                    onClick={async () => {
                                                        // Load showcase data
                                                        setEditingShowcase(sh);
                                                        setIsCreateMode(false);
                                                        setNewShowcase({
                                                            title: sh.title,
                                                            demoId: sh.demoId || "",
                                                            ctaText: "Book Full Demo",
                                                            ctaType: "Open Calendar"
                                                        });
                                                        setPrimaryColor(sh.primaryColor || "#6366F1");
                                                        setSecondaryColor(sh.secondaryColor || "#10B981");
                                                        setAccentColor(sh.accentColor || "#F59E0B");
                                                        setChatId(sh.chatId);

                                                        // Load demo content if demoId exists
                                                        if (sh.demoId) {
                                                            try {
                                                                const response = await fetch(`/api/recordings?id=${encodeURIComponent(sh.demoId)}`);
                                                                const data = await response.json();
                                                                if (data.content) {
                                                                    if (isClickRecording(data.content)) {
                                                                        setSelectedDemoContent(data.content);
                                                                        setCurrentSlideIndex(0);
                                                                    } else if (data.content.recording && isClickRecording(data.content.recording)) {
                                                                        setSelectedDemoContent(data.content.recording);
                                                                        setCurrentSlideIndex(0);
                                                                    }
                                                                }
                                                            } catch (err) {
                                                                console.error('Error loading demo content:', err);
                                                            }
                                                        } else {
                                                            setSelectedDemoContent(null);
                                                        }

                                                        setViewMode("playground");
                                                    }}
                                                    className="h-1/2 bg-background/50 flex items-center justify-center relative cursor-pointer group/preview"
                                                >
                                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover/preview:scale-110 transition-transform">
                                                        <Play className="w-6 h-6 text-primary" />
                                                    </div>
                                                    {sh.live && (
                                                        <div className="absolute top-4 right-4 px-2 py-1 bg-green-500/10 text-green-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                                            Live
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 p-5 border-t border-primary/5 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-foreground truncate">{sh.title}</h4>
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            <div className="flex items-center gap-1.5 text-[10px] text-foreground/40 font-medium">
                                                                <Clock className="w-3 h-3" />
                                                                Created {formatDate(sh.createdAt)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedShareShowcase(sh);
                                                                setShowShareModal(true);
                                                            }}
                                                            className="flex-1 bg-primary/10 text-primary py-2 rounded-xl text-xs font-bold hover:bg-primary/20 transition-all flex items-center justify-center gap-1.5"
                                                        >
                                                            <Share2 className="w-3.5 h-3.5" />
                                                            Share
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveTab("performance");
                                                            }}
                                                            className="flex-1 bg-surface border border-primary/10 text-foreground/70 py-2 rounded-xl text-xs font-bold hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
                                                        >
                                                            <BarChart3 className="w-3.5 h-3.5" />
                                                            Analytics
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => {
                                                setViewMode("tiles");
                                                setEditingShowcase(null);
                                                setIsCreateMode(false);
                                                setError(null);
                                            }}
                                            className="text-sm font-medium text-primary hover:underline flex items-center gap-2"
                                        >
                                            <ChevronDown className="w-4 h-4 rotate-90" />
                                            Back to Showcase List
                                        </button>
                                        {editingShowcase && (
                                            <div className="text-sm text-foreground/60">
                                                {editingShowcase.live ? (
                                                    <span className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        Live
                                                    </span>
                                                ) : (
                                                    <span>Draft</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-[700px] relative" style={{
                                        '--showcase-primary': primaryColor,
                                        '--showcase-secondary': secondaryColor,
                                        '--showcase-accent': accentColor
                                    } as React.CSSProperties}>
                                        <Group orientation="horizontal" className="h-full border-t" style={{ borderColor: primaryColor + '20' }}>
                                            {/* Demo Player Panel */}
                                            <Panel defaultSize={60} minSize={30}>
                                                <div className="flex flex-col h-full border-r overflow-hidden" style={{ borderColor: primaryColor + '20' }}>
                                                    <div className="flex-1 flex flex-col bg-surface overflow-hidden">
                                                        {!selectedDemoContent ? (
                                                            <div className="flex-1 flex items-center justify-center">
                                                                <div className="text-center p-8">
                                                                    <div className="relative inline-block">
                                                                        <button
                                                                            onClick={() => setShowDemoList(!showDemoList)}
                                                                            className="w-16 h-16 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all active:scale-95 shadow-lg group mx-auto mb-6"
                                                                            style={{ backgroundColor: primaryColor, boxShadow: `0 10px 40px ${primaryColor}40` }}
                                                                        >
                                                                            <Plus className={`w-8 h-8 text-white transition-transform duration-300 ${showDemoList ? 'rotate-45' : ''}`} />
                                                                        </button>

                                                                        {/* Demo List Dropdown */}
                                                                        {showDemoList && (
                                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-surface border rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in zoom-in-95 duration-200" style={{ borderColor: primaryColor + '20' }}>
                                                                                <div className="px-4 py-2 border-b mb-1" style={{ borderColor: primaryColor + '10' }}>
                                                                                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">Select Demo to Add</p>
                                                                                </div>
                                                                                <div className="max-h-60 overflow-y-auto text-left">
                                                                                    {isLoadingRecordings ? (
                                                                                        <div className="px-4 py-3 flex items-center gap-2 text-sm text-foreground/50">
                                                                                            <Loader2 className="w-4 h-4 animate-spin" style={{ color: primaryColor }} />
                                                                                            Loading...
                                                                                        </div>
                                                                                    ) : recordings.length === 0 ? (
                                                                                        <div className="px-4 py-3 text-sm text-foreground/50 italic">
                                                                                            No recordings found
                                                                                        </div>
                                                                                    ) : recordings.map((rec) => (
                                                                                        <button
                                                                                            key={rec.id}
                                                                                            onClick={() => {
                                                                                                setNewShowcase({ ...newShowcase, demoId: rec.id });
                                                                                                setShowDemoList(false);
                                                                                            }}
                                                                                            className="w-full text-left px-4 py-2.5 hover:bg-primary/5 transition-colors text-sm flex items-center gap-2 group"
                                                                                        >
                                                                                            <Play className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: primaryColor }} />
                                                                                            <span className="truncate">{rec.title}</span>
                                                                                        </button>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <h3 className="font-bold text-foreground mb-1">Add Demo</h3>
                                                                    <p className="text-xs text-foreground/40 max-w-[200px] mx-auto">Click to select a recording for your showcase.</p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 overflow-hidden">
                                                                <ClickSlideDeck
                                                                    recording={selectedDemoContent}
                                                                    currentSlideIndex={currentSlideIndex}
                                                                    onSlideChange={(idx) => setCurrentSlideIndex(idx)}
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

                                            {/* Chat Panel */}
                                            <Panel defaultSize={40} minSize={30}>
                                                <div className="flex flex-col h-full bg-surface border-l overflow-hidden" style={{ borderColor: primaryColor + '20' }}>
                                                    <ChatInterface
                                                        className="h-full"
                                                        primaryColor={primaryColor}
                                                        secondaryColor={secondaryColor}
                                                        conversationId={chatId}
                                                        onConversationIdChange={(id) => setChatId(id)}
                                                    />
                                                </div>
                                            </Panel>
                                        </Group>
                                    </div>

                                    {/* Quick Settings */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4 text-left">
                                            <h4 className="font-bold text-foreground mb-1">General Info</h4>
                                            <div>
                                                <label className="text-xs text-foreground/50 block mb-2 font-semibold uppercase">Showcase Title</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-background/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    placeholder="e.g. Enterprise Demo"
                                                    value={newShowcase.title}
                                                    onChange={(e) => setNewShowcase({ ...newShowcase, title: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-sm space-y-4 text-left">
                                            <h4 className="font-bold text-foreground mb-1">Branding</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-xs text-foreground/50 block mb-2 font-semibold uppercase">Primary Color</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                className="w-full bg-background/50 border border-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                                                value={primaryColor}
                                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                            />
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: primaryColor }} />
                                                        </div>
                                                        <input
                                                            type="color"
                                                            value={primaryColor}
                                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                                            className="w-10 h-10 border-0 bg-transparent cursor-pointer p-0"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-foreground/50 block mb-2 font-semibold uppercase">Secondary Color</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                className="w-full bg-background/50 border border-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                                                value={secondaryColor}
                                                                onChange={(e) => setSecondaryColor(e.target.value)}
                                                            />
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: secondaryColor }} />
                                                        </div>
                                                        <input
                                                            type="color"
                                                            value={secondaryColor}
                                                            onChange={(e) => setSecondaryColor(e.target.value)}
                                                            className="w-10 h-10 border-0 bg-transparent cursor-pointer p-0"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-foreground/50 block mb-2 font-semibold uppercase">Accent Color</label>
                                                    <div className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <input
                                                                type="text"
                                                                className="w-full bg-background/50 border border-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                                                value={accentColor}
                                                                onChange={(e) => setAccentColor(e.target.value)}
                                                            />
                                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md shadow-sm border border-white/20" style={{ backgroundColor: accentColor }} />
                                                        </div>
                                                        <input
                                                            type="color"
                                                            value={accentColor}
                                                            onChange={(e) => setAccentColor(e.target.value)}
                                                            className="w-10 h-10 border-0 bg-transparent cursor-pointer p-0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Error Display */}
                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    {/* Action Buttons - Only show when creating a new showcase */}
                                    {isCreateMode && (
                                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-primary/10">
                                            <button
                                                onClick={() => {
                                                    setViewMode("tiles");
                                                    setError(null);
                                                    setNewShowcase({
                                                        title: "",
                                                        demoId: "",
                                                        ctaText: "Book Full Demo",
                                                        ctaType: "Open Calendar"
                                                    });
                                                    setSelectedDemoContent(null);
                                                    setChatId(null);
                                                    setEditingShowcase(null);
                                                    setIsCreateMode(false);
                                                }}
                                                className="px-8 py-3 text-sm font-semibold text-foreground/60 hover:text-foreground transition-colors"
                                                disabled={isCreatingShowcase}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleCreateShowcase}
                                                className="flex items-center gap-2 bg-primary text-white px-10 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={isCreatingShowcase || !newShowcase.title.trim()}
                                            >
                                                {isCreatingShowcase ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Creating...
                                                    </>
                                                ) : (
                                                    "Create Agentic Showcase"
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                            <Users className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground/50">Total Views</p>
                                            <p className="text-2xl font-bold">2,090</p>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[70%]" />
                                    </div>
                                </div>
                                <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground/50">Avg. Completion</p>
                                            <p className="text-2xl font-bold">56%</p>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 w-[56%]" />
                                    </div>
                                </div>
                                <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                            <Share2 className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-foreground/50">Shares this week</p>
                                            <p className="text-2xl font-bold">+12</p>
                                        </div>
                                    </div>
                                    <div className="h-1 bg-foreground/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-[40%]" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-surface rounded-2xl border border-primary/10 shadow-sm overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-primary/5">
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/60">Showcase Title</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/60">Views</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/60">Completion</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/60">Last Shared</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-foreground/60 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {isLoadingShowcases ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center">
                                                    <Loader2 className="w-6 h-6 text-primary animate-spin mx-auto" />
                                                </td>
                                            </tr>
                                        ) : showcases.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-8 text-center text-foreground/60">
                                                    No showcases found
                                                </td>
                                            </tr>
                                        ) : (
                                            showcases.map((sh) => (
                                                <tr key={sh.id} className="hover:bg-primary/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                                                                <Play className="w-4 h-4 text-primary" />
                                                            </div>
                                                            <span className="font-semibold text-foreground text-sm">{sh.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-foreground/70">-</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">{sh.live ? "Live" : "Draft"}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-foreground/70">
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {formatDate(sh.updatedAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const url = getShareUrl(sh);
                                                                    handleCopySpecificLink(url, sh.id);
                                                                }}
                                                                className="p-2 hover:bg-primary/10 rounded-lg text-foreground/60 transition-colors"
                                                                title="Copy Link"
                                                            >
                                                                <Copy className="w-4 h-4" />
                                                            </button>
                                                            {sh.showcaseShareLink && (
                                                                <button
                                                                    onClick={() => window.open(getShareUrl(sh), '_blank')}
                                                                    className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                                                    title="View Public Page"
                                                                >
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Share Modal */}
                {showShareModal && selectedShareShowcase && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
                            onClick={() => setShowShareModal(false)}
                        />

                        <div className="relative bg-surface border border-primary/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
                            <div className="px-6 py-5 border-b border-primary/5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-foreground">Share Showcase</h3>
                                    <p className="text-xs text-foreground/50">Send this experience to your prospects</p>
                                </div>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="p-2 hover:bg-primary/5 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5 text-foreground/40" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Copy Link Section */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 px-1">Experience Link</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-background/50 border border-primary/10 rounded-xl px-4 py-3 text-sm text-foreground/60 truncate font-mono">
                                            {selectedShareShowcase ? getShareUrl(selectedShareShowcase) : ''}
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (selectedShareShowcase) {
                                                    handleCopySpecificLink(getShareUrl(selectedShareShowcase), 'modal');
                                                }
                                            }}
                                            className={`px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${copiedId === 'modal' ? 'bg-green-500 text-white' : 'bg-primary text-white hover:bg-primary/90'
                                                }`}
                                        >
                                            {copiedId === 'modal' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copiedId === 'modal' ? 'Copied' : 'Copy'}
                                        </button>
                                    </div>
                                </div>

                                {/* Social Share Section */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 px-1">Direct Share</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <button
                                            onClick={() => handleShare('email', selectedShareShowcase)}
                                            className="flex flex-col items-center justify-center gap-3 p-4 bg-background/50 border border-primary/10 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Mail className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="text-xs font-semibold">Email</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('linkedin', selectedShareShowcase)}
                                            className="flex flex-col items-center justify-center gap-3 p-4 bg-background/50 border border-primary/10 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-[#0077b5]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Linkedin className="w-5 h-5 text-[#0077b5]" />
                                            </div>
                                            <span className="text-xs font-semibold">LinkedIn</span>
                                        </button>

                                        <button
                                            onClick={() => handleShare('slack', selectedShareShowcase)}
                                            className="flex flex-col items-center justify-center gap-3 p-4 bg-background/50 border border-primary/10 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                        >
                                            <div className="w-10 h-10 bg-[#4A154B]/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <MessageSquare className="w-5 h-5 text-[#4A154B]" />
                                            </div>
                                            <span className="text-xs font-semibold">Slack</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Iframe Integration Section */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 px-1 flex items-center gap-2">
                                        <Code className="w-3 h-3" />
                                        Embed Integration
                                    </label>
                                    <div className="bg-background/50 border border-primary/10 rounded-xl p-4">
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <p className="text-xs text-foreground/60 flex-1">
                                                Copy this code to embed the showcase on your website
                                            </p>
                                            <button
                                                onClick={() => selectedShareShowcase && handleCopyIframe(selectedShareShowcase)}
                                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 ${
                                                    copiedIframe 
                                                        ? 'bg-green-500 text-white' 
                                                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                                                }`}
                                            >
                                                {copiedIframe ? (
                                                    <>
                                                        <Check className="w-3 h-3" />
                                                        Copied
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3 h-3" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <pre className="text-xs text-foreground/80 bg-background/30 p-3 rounded-lg overflow-x-auto font-mono">
                                            <code>{selectedShareShowcase ? getIframeSnippet(selectedShareShowcase) : ''}</code>
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-primary/5 border-t border-primary/5">
                                <div className="flex items-center gap-3 text-primary">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Globe className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status</p>
                                        <p className="text-xs font-bold">Publicly accessible at unique URL</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
