"use client";

import {
  Home,
  LayoutGrid,
  MessageCircle,
  Users,
  BarChart3,
  Settings,
  ChevronDown,
  Link as LinkIcon,
  User,
  Bell,
  FileText,
  Upload,
  Trash2,
  BookOpen,
  MessageSquare,
  Sparkles,
  Plus,
  Gamepad2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChatInterface } from "../components/ChatInterface";
import { WelcomeMessagesSection } from "../components/WelcomeMessagesSection";
import { GuidelinesSection } from "../components/GuidelinesSection";
import { ToneSection } from "../components/ToneSection";
import { KnowledgeBaseSection } from "../components/KnowledgeBaseSection";
import { Sidebar } from "../components/Sidebar";

export default function ChatsPage() {
  const [activeNav, setActiveNav] = useState("Chats");
  const [activeTab, setActiveTab] = useState<"settings" | "playground">("settings");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Chat settings state

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header with Tabs */}
        <div className="px-8 pt-6 pb-0 border-b border-primary/10 bg-surface z-10 sticky top-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Chat</h1>
              <p className="text-foreground/70">Manage your AI assistant settings and test them in the playground.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === "settings"
                ? "text-primary"
                : "text-foreground/60 hover:text-foreground"
                }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </div>
              {activeTab === "settings" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("playground")}
              className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === "playground"
                ? "text-primary"
                : "text-foreground/60 hover:text-foreground"
                }`}
            >
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Playground
              </div>
              {activeTab === "playground" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 py-6 space-y-8">
          {activeTab === "settings" ? (
            <>
              {/* Welcome Messages Section */}
              <WelcomeMessagesSection />

              {/* Tone Settings */}
              <ToneSection />

              {/* Guidelines Section */}
              <GuidelinesSection />

              {/* Knowledge Base Section */}
              <KnowledgeBaseSection />


            </>
          ) : (
            <div className="h-[calc(100vh-200px)] border border-primary/10 rounded-lg overflow-hidden shadow-sm">
              <ChatInterface className="h-full" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
