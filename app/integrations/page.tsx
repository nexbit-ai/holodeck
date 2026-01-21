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
import { Sidebar } from "../components/Sidebar";
import { HubSpotIntegrationCard } from "../components/HubSpotIntegrationCard";

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
      description: "Send leads captured through Nexbit to 5000+ apps using Zapier.",
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
      <Sidebar />

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
              {/* HubSpot Special Card */}
              <HubSpotIntegrationCard />

              {starterIntegrations.filter(i => i.name !== "Hubspot").map((integration, index) => (
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
