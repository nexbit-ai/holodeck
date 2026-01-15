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
  Filter,
  ArrowUpDown,
  Grid3x3,
  List,
  MoreVertical,
  FileText,
  HelpCircle,
  ChevronDown as ChevronDownIcon,
  User2,
  FolderArchive
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DemosPage() {
  const [activeNav, setActiveNav] = useState("Demos");
  const [activeTab, setActiveTab] = useState("Shared with Team");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const demos = [
    {
      id: 1,
      title: "New Demo",
      creator: "Krishna",
      date: "Jan 15",
      type: "new",
      thumbnail: null
    },
    {
      id: 2,
      title: "Localhost Demo",
      creator: "Krishna",
      date: "Jan 11",
      type: "demo",
      thumbnail: "/api/placeholder/400/300"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-surface border-r border-primary/10 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-primary/10">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-primary">Nexbit</h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            onClick={() => setActiveNav("Home")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeNav === "Home"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-primary/5"
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          <Link
            href="/demos"
            onClick={() => setActiveNav("Demos")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeNav === "Demos"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-primary/5"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Demos
          </Link>

          <Link
            href="/chats"
            onClick={() => setActiveNav("Chats")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeNav === "Chats"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-primary/5"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Chats
          </Link>

          <div>
            <button
              onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-primary/5 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Audience
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAudienceDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showAudienceDropdown && (
              <div className="ml-6 mt-1">
                <Link
                  href="/audience"
                  className="block px-3 py-2 text-sm text-foreground/70 hover:text-primary rounded-lg transition-colors"
                >
                  View all
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/insights"
            onClick={() => setActiveNav("Insights")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeNav === "Insights"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-primary/5"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Insights
          </Link>

          <div>
            <button
              onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-primary/5 rounded-lg transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSettingsDropdown ? 'rotate-180' : ''}`} />
            </button>
            {showSettingsDropdown && (
              <div className="ml-6 mt-1">
                <Link
                  href="#"
                  className="block px-3 py-2 text-sm text-foreground/70 hover:text-primary rounded-lg transition-colors"
                >
                  General
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/integrations"
            onClick={() => setActiveNav("Integrations")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeNav === "Integrations"
                ? "bg-primary text-white"
                : "text-foreground hover:bg-primary/5"
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Integrations
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-primary/10">
          <div className="flex items-center gap-3 px-3 py-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center relative">
              <User className="w-4 h-4 text-primary" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-surface"></span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Krishna</p>
              <p className="text-xs text-foreground/60">Free Plan</p>
            </div>
            <ChevronDown className="w-4 h-4 text-foreground/60" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Main Header Section */}
        <div className="bg-surface border-b border-primary/10 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Team Demos</h1>
              <HelpCircle className="w-5 h-5 text-foreground/40" />
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowCreateDropdown(!showCreateDropdown)}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Create
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {showCreateDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-primary/10 rounded-lg shadow-lg z-10">
                    <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors">
                      New Demo
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors">
                      Import Demo
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 bg-primary/5 rounded-lg p-1">
                <button className="px-3 py-1.5 text-sm font-medium text-primary bg-surface rounded-md">
                  Demos
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">
                  Screenshots
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Navigation */}
        <div className="bg-surface border-b border-primary/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab("Shared with Team")}
              className={`flex items-center gap-2 pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === "Shared with Team"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4" />
              Shared with Team
            </button>
            <button
              onClick={() => setActiveTab("Personal")}
              className={`flex items-center gap-2 pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === "Personal"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <User2 className="w-4 h-4" />
              Personal
            </button>
            <button
              onClick={() => setActiveTab("Archived")}
              className={`flex items-center gap-2 pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === "Archived"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <FolderArchive className="w-4 h-4" />
              Archived
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm hover:bg-primary/5 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm hover:bg-primary/5 transition-colors">
              <ArrowUpDown className="w-4 h-4" />
              Recently updated
            </button>
            <div className="flex items-center gap-1 border border-primary/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 py-8">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {demos.map((demo) => (
                <div
                  key={demo.id}
                  className="bg-surface rounded-lg border border-primary/10 p-4 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="relative mb-4">
                    {demo.type === "new" ? (
                      <div className="aspect-video bg-primary/5 rounded-lg flex items-center justify-center">
                        <FileText className="w-16 h-16 text-primary/40" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-background rounded-lg border border-primary/10 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                          <div className="text-center p-4">
                            <div className="text-sm font-semibold text-foreground mb-2">Reconciliation Summary</div>
                            <div className="text-xs text-foreground/70 mb-4">Reconciliation Status</div>
                            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary flex items-center justify-center mx-auto mb-2">
                              <span className="text-sm font-bold text-primary">100%</span>
                            </div>
                            <div className="text-lg font-bold text-foreground">₹0.00</div>
                          </div>
                        </div>
                      </div>
                    )}
                    <button className="absolute top-2 right-2 p-1.5 bg-surface/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-foreground/60" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{demo.title}</h3>
                    <p className="text-sm text-foreground/60">
                      {demo.creator} • {demo.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {demos.map((demo) => (
                <div
                  key={demo.id}
                  className="bg-surface rounded-lg border border-primary/10 p-4 hover:bg-primary/5 transition-colors cursor-pointer flex items-center gap-4 group"
                >
                  <div className="w-24 h-16 flex-shrink-0">
                    {demo.type === "new" ? (
                      <div className="w-full h-full bg-primary/5 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary/40" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/10"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{demo.title}</h3>
                    <p className="text-sm text-foreground/60">
                      {demo.creator} • {demo.date}
                    </p>
                  </div>
                  <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="w-4 h-4 text-foreground/60" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
