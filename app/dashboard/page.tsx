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
  Chrome,
  Video,
  Share2,
  Plug,
  Code,
  MousePointer,
  Server,
  Smartphone,
  UserCheck,
  Sparkles,
  Bell
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("Home");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

    return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-surface border-r border-primary/10 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-primary/10">
          <h1 className="text-2xl font-bold text-primary">Nexbit</h1>
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
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
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
        {/* Content Area */}
        <div className="px-8 py-8 space-y-12">
          {/* Header Section */}
          <div className="flex items-center justify-between pt-4">
            <h2 className="text-2xl font-bold text-foreground">Welcome, Krishna</h2>
            <button className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
              <Video className="w-4 h-4" />
              + Create demo
            </button>
          </div>
          {/* Get Started Section */}
          <section>
            <h3 className="text-xl font-bold text-foreground mb-6">Get started with Nexbit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Chrome className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Install Chrome Extension</h4>
                <p className="text-sm text-foreground/70 mb-4">Start recording your product demos with our browser extension.</p>
                <button className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Install Extension
                </button>
              </div>

              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <Video className="w-6 h-6 text-primary/70" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Record your Demo</h4>
                <p className="text-sm text-foreground/70 mb-4">Capture interactive product walkthroughs effortlessly.</p>
                <button className="w-full border border-primary text-primary py-2 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                  Record Demo
                </button>
              </div>

              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-primary/70" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Share your Demo</h4>
                <p className="text-sm text-foreground/70 mb-4">Distribute your demos via links, embeds, or integrations.</p>
                <button className="w-full border border-primary text-primary py-2 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                  Share Demo
                </button>
              </div>

              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-4">
                  <Plug className="w-6 h-6 text-primary/70" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Integrate with tool stack</h4>
                <p className="text-sm text-foreground/70 mb-4">Connect with your CRM, marketing, and sales tools.</p>
                <button className="w-full border border-primary text-primary py-2 px-4 rounded-lg font-medium hover:bg-primary/5 transition-colors">
                  Integrate
                </button>
              </div>
            </div>
          </section>

          {/* Demo Examples Section */}
          <section>
            <h3 className="text-xl font-bold text-foreground mb-6">Demo examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Code className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Website embed (mid-step lead form)</h4>
                <p className="text-sm text-foreground/70 mb-4">Showcase your product's value, capture leads, and make a strong impression.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">Demand gen</span>
                  <span className="px-2 py-1 bg-primary/5 text-foreground/70 text-xs rounded-md">Lead conversion</span>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MousePointer className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Sales leave behinds</h4>
                <p className="text-sm text-foreground/70 mb-4">Provide prospects with an interactive demo they can revisit anytime.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-md font-medium">Close deals</span>
                  <span className="px-2 py-1 bg-primary/5 text-foreground/70 text-xs rounded-md">Sales velocity</span>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Server className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Sandbox (AE, partner live sales)</h4>
                <p className="text-sm text-foreground/70 mb-4">Offer a hands-on sandbox environment to deliver stellar demo experiences.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-md font-medium">Close deals</span>
                  <span className="px-2 py-1 bg-primary/5 text-foreground/70 text-xs rounded-md">Live demo</span>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Mobile demo</h4>
                <p className="text-sm text-foreground/70 mb-4">Showcase your mobile experience with seamless navigation.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md font-medium">Demand gen</span>
                  <span className="px-2 py-1 bg-primary/5 text-foreground/70 text-xs rounded-md">Mobile experience</span>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Personalized demos</h4>
                <p className="text-sm text-foreground/70 mb-4">Deliver tailored, up-to-date demos for a more relevant and personal experience.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-md font-medium">Close deals</span>
                  <span className="px-2 py-1 bg-primary/5 text-foreground/70 text-xs rounded-md">Sales win rate</span>
                </div>
              </div>

              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Product feature launch with Figma</h4>
                <p className="text-sm text-foreground/70 mb-4">Generate excitement by showcasing new features even before they're built.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-primary/15 text-primary text-xs rounded-md font-medium">Increase adoption</span>
                  <span className="px-2 py-1 bg-primary/5 text-foreground/70 text-xs rounded-md">Feature launch</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
    );
}
