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
  Search,
  Filter,
  Laptop
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AudiencePage() {
  const [activeNav, setActiveNav] = useState("Audience");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy leads data
  const leads = [
    {
      id: 1,
      leadName: "Sarah Chen",
      email: "sarah.chen@techcorp.com",
      intentLevel: "High",
      content: "Product Demo - SaaS Platform",
      date: "Jan 15, 2025",
      source: "Website Embed"
    },
    {
      id: 2,
      leadName: "Michael Rodriguez",
      email: "m.rodriguez@startup.io",
      intentLevel: "Medium",
      content: "Marketing Automation Workflow",
      date: "Jan 14, 2025",
      source: "Sales Leave Behind"
    },
    {
      id: 3,
      leadName: "Emma Thompson",
      email: "emma.thompson@enterprise.com",
      intentLevel: "High",
      content: "Customer Support Portal Demo",
      date: "Jan 14, 2025",
      source: "Direct Link"
    },
    {
      id: 4,
      leadName: "David Park",
      email: "david.park@innovate.co",
      intentLevel: "Low",
      content: "Mobile Demo Experience",
      date: "Jan 13, 2025",
      source: "Email Campaign"
    },
    {
      id: 5,
      leadName: "Priya Singh",
      email: "priya.singh@globaltech.net",
      intentLevel: "High",
      content: "SaaS Platform Feature Tour",
      date: "Jan 13, 2025",
      source: "Website Embed"
    },
    {
      id: 6,
      leadName: "James Wilson",
      email: "j.wilson@business.com",
      intentLevel: "Medium",
      content: "Project Management Tools",
      date: "Jan 12, 2025",
      source: "Social Media"
    },
    {
      id: 7,
      leadName: "Lisa Anderson",
      email: "lisa.anderson@company.com",
      intentLevel: "High",
      content: "AI-Powered Sales Assistant",
      date: "Jan 12, 2025",
      source: "Sales Leave Behind"
    },
    {
      id: 8,
      leadName: "Robert Kim",
      email: "r.kim@techstartup.io",
      intentLevel: "Low",
      content: "Personalized Demo Experience",
      date: "Jan 11, 2025",
      source: "Direct Link"
    }
  ];

  const getIntentLevelColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-green-100 text-green-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "Low":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lead.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                  className="block px-3 py-2 text-sm text-foreground/70 hover:text-primary rounded-lg transition-colors bg-primary/5 text-primary"
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
        {/* Header */}
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads</h1>
          <p className="text-foreground/70">List of all the leads that interacted with your content.</p>
        </div>

        {/* Search and Filters */}
        <div className="px-8 py-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input
              type="text"
              placeholder="Search by email, name or account"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface border border-primary/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm hover:bg-primary/5 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Content Area */}
        <div className="px-8 py-6">
          {filteredLeads.length === 0 ? (
            <div className="bg-surface rounded-lg border border-primary/10 p-16 flex flex-col items-center justify-center min-h-[500px]">
              <div className="w-32 h-32 bg-primary/5 rounded-lg flex items-center justify-center mb-6">
                <Laptop className="w-16 h-16 text-primary/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No session records</h3>
              <p className="text-sm text-foreground/60 text-center">
                Once your content start getting traction, we will show the data on this page.
              </p>
            </div>
          ) : (
            <div className="bg-surface rounded-lg border border-primary/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/10 bg-primary/5">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Lead name</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Intent level</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Content</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Date</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-foreground">{lead.leadName}</p>
                            <p className="text-sm text-foreground/60">{lead.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getIntentLevelColor(lead.intentLevel)}`}>
                            {lead.intentLevel}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-foreground">{lead.content}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-foreground">{lead.date}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-foreground">{lead.source}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
