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
  Link2,
  Tag,
  Zap,
  MessageSquare,
  Hexagon,
  Bell
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function IntegrationsPage() {
  const [activeNav, setActiveNav] = useState("Integrations");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  const integrations = [
    {
      name: "Slack",
      description: "Send notification on leads captured to your Slack channel.",
      icon: <MessageSquare className="w-6 h-6" style={{ color: '#4A154B' }} />,
      category: "general"
    }
  ];

  const starterIntegrations = [
    {
      name: "Hubspot",
      description: "Create new leads and send demo analytics data as custom contact properties.",
      icon: <Hexagon className="w-6 h-6" style={{ color: '#FF7A59' }} />
    },
    {
      name: "Zapier",
      description: "Send leads captured through Holodeck to 5000+ apps using Zapier.",
      icon: <Zap className="w-6 h-6" style={{ color: '#FF4A00' }} />
    },
    {
      name: "Google Analytics",
      description: "Send demo analytics as custom events to your Google Analytics account.",
      icon: <BarChart3 className="w-6 h-6" style={{ color: '#F4B400' }} />
    },
    {
      name: "Google Tag Manager",
      description: "Send demo analytics as custom events to your Google Tag Manager account.",
      icon: <Tag className="w-6 h-6" style={{ color: '#4285F4' }} />
    },
    {
      name: "Webhook",
      description: "Receive real-time demo events to your system",
      icon: <Link2 className="w-6 h-6" style={{ color: '#EF4444' }} />
    }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-surface border-r border-primary/10 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-primary/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/assets/logo.jpg"
              alt="Nexbit Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <h1 className="text-2xl font-bold text-primary">Nexbit</h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            onClick={() => setActiveNav("Home")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${activeNav === "Home"
              ? "bg-primary text-white"
              : "text-foreground hover:bg-primary/5"
              }`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>

          <Link
            href="#"
            onClick={() => setActiveNav("Demos")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${activeNav === "Demos"
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
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${activeNav === "Chats"
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
            href="#"
            onClick={() => setActiveNav("Insights")}
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${activeNav === "Insights"
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
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${activeNav === "Integrations"
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
        {/* Header */}
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Integrations</h1>
          <p className="text-foreground/70">Oversee integrations within your workspace and customize their permissions.</p>
        </div>

        {/* Content Area */}
        <div className="px-8 py-8 space-y-8">
          {/* General Integrations Section */}
          <section>
            <div className="space-y-4">
              <div className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      {integrations[0].icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">Slack</h3>
                      <p className="text-sm text-foreground/70 mb-4">
                        Send notification on leads captured to your Slack channel.
                      </p>
                      <div className="flex items-center gap-4">
                        <a href="#" className="text-sm text-primary hover:underline">
                          Learn more
                        </a>
                        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                          <Link2 className="w-4 h-4" />
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Starter Plan Integrations Section */}
          <section>
            <div className="space-y-4">
              {starterIntegrations.map((integration, index) => (
                <div key={index} className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        {integration.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{integration.name}</h3>
                        <p className="text-sm text-foreground/70 mb-4">
                          {integration.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <a href="#" className="text-sm text-primary hover:underline">
                            Learn more
                          </a>
                          <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                            <Link2 className="w-4 h-4" />
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
