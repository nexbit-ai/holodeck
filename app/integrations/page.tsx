"use client";

import {
  Link2,
  Tag,
  Zap,
  MessageSquare,
  BarChart3,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { HubSpotIntegrationCard } from "../components/HubSpotIntegrationCard";

interface Integration {
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  isSpecial?: boolean; // For HubSpot which has its own component
}

export default function IntegrationsPage() {
  const integrations: Integration[] = [
    {
      name: "HubSpot",
      description: "Collect, send and sync engagement and lead data from Nexbit to HubSpot.",
      category: "CRM",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#FF7A59" />
          <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="#FF7A59" />
        </svg>
      ),
      color: "#FF7A59",
      isSpecial: true
    },
    {
      name: "Slack",
      description: "Send notification on leads captured to your Slack channel.",
      category: "Communication",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52z" fill="#4A154B" />
          <path d="M6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z" fill="#4A154B" />
          <path d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834z" fill="#36C5F0" />
          <path d="M8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z" fill="#36C5F0" />
          <path d="M18.956 8.834a2.528 2.528 0 0 1 2.521-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.523 2.521h-2.521V8.834z" fill="#2EB67D" />
          <path d="M17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z" fill="#2EB67D" />
          <path d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.521A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.523v-2.521h2.52z" fill="#ECB22E" />
          <path d="M15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#ECB22E" />
        </svg>
      ),
      color: "#4A154B"
    },
    {
      name: "Zapier",
      description: "Send leads captured through Nexbit to 5000+ apps using Zapier.",
      category: "Automation",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" fill="#FF4A00" />
          <path d="M8 8l4 4 4-4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 16l4-4 4 4" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: "#FF4A00"
    },
    {
      name: "Google Analytics",
      description: "Send demo analytics as custom events to your Google Analytics account.",
      category: "Analytics",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      ),
      color: "#F4B400"
    },
    {
      name: "Google Tag Manager",
      description: "Send demo analytics as custom events to your Google Tag Manager account.",
      category: "Analytics",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4285F4" />
          <path d="M2 17L12 22L22 17V12L12 17L2 12V17Z" fill="#4285F4" />
          <circle cx="12" cy="12" r="2" fill="#34A853" />
        </svg>
      ),
      color: "#4285F4"
    },
    {
      name: "Webhook",
      description: "Receive real-time demo events to your system.",
      category: "Automation",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" fill="#EF4444" />
          <path d="M8 8h8v8H8z" fill="white" opacity="0.2" />
          <path d="M10 10h4v4h-4z" fill="white" />
          <circle cx="12" cy="12" r="1.5" fill="#EF4444" />
        </svg>
      ),
      color: "#EF4444"
    }
  ];

  const renderIntegrationCard = (integration: Integration, index: number) => {
    if (integration.isSpecial && integration.name === "HubSpot") {
      return <HubSpotIntegrationCard key={integration.name} className="h-full" />;
    }

    return (
      <div
        key={integration.name}
        className="bg-surface rounded-2xl p-6 shadow-sm border border-primary/5 hover:shadow-lg hover:border-primary/10 transition-all flex flex-col h-full"
      >
        {/* Logo and Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            {integration.icon}
          </div>
          <div className="flex-1 flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">{integration.name}</h3>
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-semibold hover:bg-primary/90 transition-colors text-sm">
              <Link2 className="w-4 h-4" />
              Connect
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground/70 mb-4 flex-1">
          {integration.description}
        </p>

        {/* Footer */}
        <div className="flex items-center pt-4 border-t border-primary/5">
          <span className="text-xs font-medium text-foreground/50 bg-primary/5 px-3 py-1 rounded-full">
            {integration.category}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <div className="px-8 py-6 border-b border-primary/10 bg-surface">
          <h1 className="text-3xl font-bold text-foreground mb-2">Integrations</h1>
          <p className="text-foreground/70">Connect your favorite tools and automate your workflow.</p>
        </div>

        {/* Content Area - Grid Layout */}
        <div className="px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration, index) => renderIntegrationCard(integration, index))}
          </div>
        </div>
      </main>
    </div>
  );
}
