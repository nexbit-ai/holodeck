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
import Image from "next/image";
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";

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
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Header */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-foreground">Leads</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-tight">Work in Progress</span>
            </div>
          </div>
          <p className="text-foreground/70 flex items-center gap-2">
            List of all the leads that interacted with your content.
            <span className="text-xs text-foreground/40 italic flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-foreground/20"></span>
              Dummy data for preview
            </span>
          </p>
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
