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
  Search,
  Bell,
  Sparkles,
  Filter,
  Calendar,
  Info,
  ArrowUp,
  ArrowRight,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

export default function InsightsPage() {
  const [activeNav, setActiveNav] = useState("Insights");
  const [activeTab, setActiveTab] = useState("Agent Analytics");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<{ name: string; views: number } | null>(null);

  // Country view data - mapping ISO country codes to view counts
  const countryViews: Record<string, number> = {
    US: 11600, // USA - highest
    IN: 11600, // India - highest
    CA: 4000,  // Canada
    BR: 3500,  // Brazil
    GB: 2800,  // UK
    FR: 2800,  // France
    DE: 2800,  // Germany
    ES: 2200,  // Spain
    IT: 2200,  // Italy
    CN: 3000,  // China
    JP: 2500,  // Japan
    AU: 2000,  // Australia
    MX: 1500,  // Mexico
    RU: 2000,  // Russia
    KR: 1800,  // South Korea
    AR: 1200,  // Argentina
    ZA: 1000,  // South Africa
    NL: 1800,  // Netherlands
    SE: 1500,  // Sweden
    NO: 1200,  // Norway
    DK: 1200,  // Denmark
    PL: 1500,  // Poland
    TR: 1800,  // Turkey
    SA: 1500,  // Saudi Arabia
    AE: 1200,  // UAE
    SG: 2000,  // Singapore
    MY: 1500,  // Malaysia
    TH: 1200,  // Thailand
    ID: 1800,  // Indonesia
    PH: 1500,  // Philippines
    VN: 1200,  // Vietnam
    NZ: 1000,  // New Zealand
  };

  const maxViews = 11600;
  const minViews = 1;

  // Get color opacity based on views
  const getCountryColor = (views: number) => {
    if (!views || views === 0) return { fill: "#f5f5f5", opacity: 1 };
    const opacity = 0.1 + ((views - minViews) / (maxViews - minViews)) * 0.85;
    return { fill: "#b05a36", opacity: Math.min(opacity, 0.95) };
  };

  const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  // Agent Analytics Data
  const agentChartData = [
    { views: 45, viewers: 38 },
    { views: 52, viewers: 45 },
    { views: 48, viewers: 42 },
    { views: 61, viewers: 55 },
    { views: 55, viewers: 48 },
    { views: 72, viewers: 65 },
    { views: 68, viewers: 62 },
    { views: 85, viewers: 78 },
    { views: 92, viewers: 85 },
    { views: 88, viewers: 82 },
    { views: 105, viewers: 98 },
    { views: 125, viewers: 115 },
    { views: 145, viewers: 135 },
    { views: 165, viewers: 155 },
    { views: 180, viewers: 170 },
    { views: 195, viewers: 185 },
  ];

  const agentMostViewed = [
    {
      showcase: "SaaS Platform Feature Tour",
      person: "Emma Thompson",
      views: 338,
      viewsChange: "+19%",
      uniqueViewers: 292,
      viewersChange: "+19%",
      completionRate: "1.39%"
    },
    {
      showcase: "Marketing Automation Workflow",
      person: "David Rodriguez",
      views: 336,
      viewsChange: "+71%",
      uniqueViewers: 258,
      viewersChange: "+73%",
      completionRate: "5%"
    },
    {
      showcase: "Customer Support Portal",
      person: "Priya Singh",
      views: 261,
      viewsChange: "+129%",
      uniqueViewers: 239,
      viewersChange: "+132%",
      completionRate: "0.4%"
    },
    {
      showcase: "Project Management Tools",
      person: "Liam O'Connor",
      views: 120,
      viewsChange: "+15%",
      uniqueViewers: 104,
      viewersChange: "+18%",
      completionRate: "0%"
    }
  ];

  const agentOsData = [
    { name: "Windows", views: 17600, percentage: 44 },
    { name: "Mac", views: 16400, percentage: 41 },
    { name: "Android", views: 3200, percentage: 8 },
    { name: "iOS", views: 2800, percentage: 6 },
    { name: "Linux", views: 1200, percentage: 1 }
  ];

  const agentBrowserData = [
    { name: "Chrome", views: 30400, percentage: 76 },
    { name: "Edge", views: 3600, percentage: 9 },
    { name: "Mobile Chrome", views: 3200, percentage: 8 },
    { name: "Mobile Safari", views: 2400, percentage: 6 },
    { name: "Safari", views: 2000, percentage: 1 }
  ];

  // AI Demos Data
  const aiDemosChartData = [
    { views: 28, viewers: 24 },
    { views: 35, viewers: 30 },
    { views: 42, viewers: 38 },
    { views: 38, viewers: 35 },
    { views: 55, viewers: 50 },
    { views: 62, viewers: 58 },
    { views: 75, viewers: 70 },
    { views: 88, viewers: 82 },
    { views: 95, viewers: 90 },
    { views: 110, viewers: 105 },
    { views: 125, viewers: 118 },
    { views: 140, viewers: 132 },
    { views: 155, viewers: 148 },
    { views: 170, viewers: 162 },
    { views: 185, viewers: 178 },
    { views: 200, viewers: 192 },
  ];

  const aiDemosMostViewed = [
    {
      showcase: "AI-Powered Sales Assistant",
      person: "Sarah Chen",
      views: 542,
      viewsChange: "+45%",
      uniqueViewers: 485,
      viewersChange: "+48%",
      completionRate: "12.5%"
    },
    {
      showcase: "Smart Product Recommendations",
      person: "Michael Park",
      views: 428,
      viewsChange: "+62%",
      uniqueViewers: 392,
      viewersChange: "+65%",
      completionRate: "8.3%"
    },
    {
      showcase: "Automated Demo Generation",
      person: "Lisa Anderson",
      views: 389,
      viewsChange: "+38%",
      uniqueViewers: 356,
      viewersChange: "+41%",
      completionRate: "15.2%"
    },
    {
      showcase: "Intelligent Lead Scoring",
      person: "James Wilson",
      views: 312,
      viewsChange: "+28%",
      uniqueViewers: 289,
      viewersChange: "+31%",
      completionRate: "9.8%"
    }
  ];

  const aiDemosOsData = [
    { name: "Mac", views: 22400, percentage: 56 },
    { name: "Windows", views: 12800, percentage: 32 },
    { name: "iOS", views: 3200, percentage: 8 },
    { name: "Android", views: 1200, percentage: 3 },
    { name: "Linux", views: 400, percentage: 1 }
  ];

  const aiDemosBrowserData = [
    { name: "Chrome", views: 28000, percentage: 70 },
    { name: "Safari", views: 8000, percentage: 20 },
    { name: "Mobile Safari", views: 2400, percentage: 6 },
    { name: "Edge", views: 1200, percentage: 3 },
    { name: "Mobile Chrome", views: 400, percentage: 1 }
  ];

  // Chatbot Logs Data
  const chatbotLogs = [
    {
      id: 1,
      input: "Yes, I would love that",
      output: "Cool! Book a quick catch-up: https://calendly.com/kp-nexbit/30min",
      demoId: "DEMO-001",
      created: "Dec 29, 4:45 PM"
    },
    {
      id: 2,
      input: "No, I have few questions before that",
      output: "Hey Human! Just let me know your questions, and I'll do my best to answer them.",
      demoId: "DEMO-002",
      created: "Dec 29, 3:22 PM"
    },
    {
      id: 3,
      input: "what all integrations do you support?",
      output: "Hey, sure thing! Here are some of my integrations: **CRM Integration** - Connect with Salesforce, HubSpot, and more. **Email Integration** - Sync with Gmail, Outlook. **Calendar Integration** - Works with Google Calendar, Outlook Calendar. **Slack Integration** - Get notifications and updates in Slack. **API Integration** - Custom integrations via our API. Would you like me to help you set up any of these?",
      demoId: "DEMO-003",
      created: "Dec 28, 2:15 PM"
    },
    {
      id: 4,
      input: "Tell me more about Lattice",
      output: "I don't have that specific detail, but I'd be happy to connect you with someone who can help! Would you like me to schedule a call?",
      demoId: "DEMO-001",
      created: "Dec 27, 11:30 AM"
    },
    {
      id: 5,
      input: "Hey Nex, what can you do?",
      output: "Hey there! I'm Nex, your AI assistant. I can help you with: answering questions, scheduling meetings, providing product information, connecting you with the right people, and much more! What would you like to know?",
      demoId: "DEMO-004",
      created: "Dec 26, 5:10 PM"
    },
    {
      id: 6,
      input: "How do I get started?",
      output: "Great question! Getting started is easy. First, you'll want to set up your profile and preferences. Then, you can start asking me questions or I can help you schedule a demo. Would you like me to walk you through it?",
      demoId: "DEMO-002",
      created: "Dec 25, 9:20 AM"
    },
    {
      id: 7,
      input: "What's your pricing?",
      output: "I'd be happy to discuss pricing options with you! We have several plans available. Would you like me to connect you with our sales team for detailed pricing information?",
      demoId: "DEMO-005",
      created: "Dec 24, 1:45 PM"
    },
    {
      id: 8,
      input: "Can you help me with a technical issue?",
      output: "Of course! I can help troubleshoot technical issues. Can you describe what problem you're experiencing? I'll do my best to help or connect you with our technical support team.",
      demoId: "DEMO-003",
      created: "Dec 23, 10:15 AM"
    },
    {
      id: 9,
      input: "Show me a demo",
      output: "Absolutely! I'd love to show you a demo. You can book a personalized demo session here: https://calendly.com/kp-nexbit/30min. Or I can answer any specific questions you have right now!",
      demoId: "DEMO-001",
      created: "Dec 22, 4:30 PM"
    },
    {
      id: 10,
      input: "What makes you different from other chatbots?",
      output: "Great question! What sets me apart is my ability to understand context, provide personalized responses, and seamlessly integrate with your existing tools. I'm designed to be more conversational and helpful, not just answer FAQs. Want to see it in action?",
      demoId: "DEMO-004",
      created: "Dec 21, 2:00 PM"
    },
    {
      id: 11,
      input: "Do you support multiple languages?",
      output: "Yes! I can communicate in multiple languages. Currently, I support English, Spanish, French, German, and several others. Which language would you like to use?",
      demoId: "DEMO-006",
      created: "Dec 20, 11:20 AM"
    },
    {
      id: 12,
      input: "How secure is my data?",
      output: "Security is our top priority. We use enterprise-grade encryption, comply with GDPR and SOC 2 standards, and never share your data with third parties. Your conversations are private and secure. Would you like more details about our security practices?",
      demoId: "DEMO-002",
      created: "Dec 19, 12:05 PM"
    },
    {
      id: 13,
      input: "Can I customize your responses?",
      output: "Absolutely! You can customize my tone, style, and even add custom guidelines. Check out the Chat Settings page to configure how I respond. I can be professional, friendly, casual, technical, or supportive - whatever fits your needs!",
      demoId: "DEMO-005",
      created: "Dec 18, 3:40 PM"
    }
  ];

  // Metrics Data
  const metricsData = [
    {
      title: "Unique visitors",
      value: "1,247",
      change: "+12.5%",
      comparison: "1,108 last period",
      chartData: [0.3, 0.5, 0.7]
    },
    {
      title: "Engaged visitors",
      value: "892",
      change: "+8.3%",
      comparison: "824 last period",
      chartData: [0.4, 0.5, 0.6]
    },
    {
      title: "CTA clicks",
      value: "234",
      change: "+15.2%",
      comparison: "203 last period",
      chartData: [0.2, 0.3, 0.4]
    },
    {
      title: "Time spent per session",
      value: "2m 34s",
      change: "+5.1%",
      comparison: "2m 27s last period",
      chartData: [0.35, 0.4, 0.45]
    },
    {
      title: "Click-through rate",
      value: "18.7%",
      change: "+2.3%",
      comparison: "18.3% last period",
      chartData: [0.15, 0.17, 0.19]
    },
    {
      title: "Steps viewed",
      value: "3,456",
      change: "+22.1%",
      comparison: "2,833 last period",
      chartData: [0.25, 0.4, 0.55]
    }
  ];

  const metricChartDates = ["Jan 10", "Jan 12", "Jan 14"];

  // Get current tab data
  const chartData = activeTab === "AI Demos" ? aiDemosChartData : agentChartData;
  const mostViewed = activeTab === "AI Demos" ? aiDemosMostViewed : agentMostViewed;
  const osData = activeTab === "AI Demos" ? aiDemosOsData : agentOsData;
  const browserData = activeTab === "AI Demos" ? aiDemosBrowserData : agentBrowserData;
  
  const maxValue = 200;
  const chartHeight = 200;
  const maxOsViews = activeTab === "AI Demos" ? 25000 : 20000;
  const maxBrowserViews = activeTab === "AI Demos" ? 30000 : 40000;
  
  const totalViews = activeTab === "AI Demos" ? "2.8K" : "1.4K";
  const totalViewers = activeTab === "AI Demos" ? "2.5K" : "1.2K";
  const viewsChange = activeTab === "AI Demos" ? "32.15%" : "18.59%";
  const viewersChange = activeTab === "AI Demos" ? "35.20%" : "27.40%";
  const sectionTitle = activeTab === "AI Demos" ? "AI Demo Views" : "Showcase Views";

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
        {/* Secondary Navigation */}
        <div className="bg-surface border-b border-primary/10 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab("AI Demos")}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === "AI Demos"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              AI Demos
            </button>
            <button
              onClick={() => setActiveTab("Agent Analytics")}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === "Agent Analytics"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Agent Analytics
            </button>
            <button
              onClick={() => setActiveTab("Logs")}
              className={`pb-2 px-1 text-sm font-medium transition-colors ${
                activeTab === "Logs"
                  ? "text-foreground border-b-2 border-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              Logs
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm hover:bg-primary/5 transition-colors">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-primary/10 rounded-lg text-sm hover:bg-primary/5 transition-colors">
              <Calendar className="w-4 h-4" />
              12/17/25 - 1/15/26
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 py-8 space-y-8">
          {/* Logs Tab Content */}
          {activeTab === "Logs" && (
            <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">Input</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">Output</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">DemoID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chatbotLogs.map((log) => (
                      <tr key={log.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                        <td className="py-4 px-4 text-sm text-foreground">
                          {log.input}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-foreground/60 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-foreground">{log.output}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-foreground">
                          {log.demoId}
                        </td>
                        <td className="py-4 px-4 text-sm text-foreground">
                          {log.created}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Views Section */}
          {activeTab !== "Logs" && (
            <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
            <h2 className="text-xl font-bold text-foreground mb-6">{sectionTitle}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm text-foreground/70">Total Views</h3>
                  <HelpCircle className="w-4 h-4 text-foreground/40" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">{totalViews}</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{viewsChange}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm text-foreground/70">Total Viewers</h3>
                  <HelpCircle className="w-4 h-4 text-foreground/40" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">{totalViewers}</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{viewersChange}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-sm text-foreground/70">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-foreground/70">Viewers</span>
              </div>
            </div>

            {/* Line Chart */}
            <div className="relative h-[200px]">
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Y-axis grid lines */}
                {[0, 50, 100, 150, 200].map((value) => (
                  <g key={value}>
                    <line
                      x1="0"
                      y1={200 - (value / maxValue) * chartHeight}
                      x2="800"
                      y2={200 - (value / maxValue) * chartHeight}
                      stroke="#e5e5e5"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y={200 - (value / maxValue) * chartHeight + 4}
                      fill="#666"
                      fontSize="10"
                      textAnchor="start"
                    >
                      {value}
                    </text>
                  </g>
                ))}
                
                {/* Views line */}
                <polyline
                  points={chartData.map((d, i) => `${(i / (chartData.length - 1)) * 800},${200 - (d.views / maxValue) * chartHeight}`).join(' ')}
                  fill="none"
                  stroke="#b05a36"
                  strokeWidth="2"
                />
                
                {/* Viewers line */}
                <polyline
                  points={chartData.map((d, i) => `${(i / (chartData.length - 1)) * 800},${200 - (d.viewers / maxValue) * chartHeight}`).join(' ')}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />
                
                {/* Views area fill */}
                <polygon
                  points={`0,200 ${chartData.map((d, i) => `${(i / (chartData.length - 1)) * 800},${200 - (d.views / maxValue) * chartHeight}`).join(' ')} 800,200`}
                  fill="#b05a36"
                  fillOpacity="0.1"
                />
                
                {/* Viewers area fill */}
                <polygon
                  points={`0,200 ${chartData.map((d, i) => `${(i / (chartData.length - 1)) * 800},${200 - (d.viewers / maxValue) * chartHeight}`).join(' ')} 800,200`}
                  fill="#22c55e"
                  fillOpacity="0.1"
                />
              </svg>
            </div>
          </section>
          )}

          {/* Metrics Cards Section */}
          {activeTab !== "Logs" && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metricsData.map((metric, index) => (
                <div key={index} className="bg-surface rounded-lg p-4 shadow-sm border border-primary/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">{metric.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      metric.change.startsWith('+') 
                        ? 'bg-green-500/20 text-green-600' 
                        : 'bg-foreground/10 text-foreground/70'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-foreground mb-1">{metric.value}</div>
                    <div className="text-xs text-foreground/60">{metric.comparison}</div>
                  </div>
                  
                  {/* Mini Line Chart */}
                  <div className="relative h-12 mt-3">
                    <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                      {/* X-axis labels */}
                      {metricChartDates.map((date, i) => {
                        const xPos = metricChartDates.length === 1 
                          ? 100 
                          : (i / Math.max(1, metricChartDates.length - 1)) * 200;
                        return (
                          <text
                            key={i}
                            x={xPos}
                            y="46"
                            fill="#999"
                            fontSize="8"
                            textAnchor="middle"
                          >
                            {date}
                          </text>
                        );
                      })}
                      
                      {/* Chart line */}
                      <polyline
                        points={metric.chartData.map((d, i) => {
                          const xPos = metric.chartData.length === 1 
                            ? 100 
                            : (i / Math.max(1, metric.chartData.length - 1)) * 200;
                          const yPos = 48 - (d * 48);
                          return `${xPos},${yPos}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Area fill */}
                      <polygon
                        points={`0,48 ${metric.chartData.map((d, i) => {
                          const xPos = metric.chartData.length === 1 
                            ? 100 
                            : (i / Math.max(1, metric.chartData.length - 1)) * 200;
                          const yPos = 48 - (d * 48);
                          return `${xPos},${yPos}`;
                        }).join(' ')} 200,48`}
                        fill="#3b82f6"
                        fillOpacity="0.1"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Most Viewed Section */}
          {activeTab !== "Logs" && (
            <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Most Viewed</h2>
              <button className="flex items-center gap-2 text-sm text-primary hover:underline">
                View all
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">SHOWCASE</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">VIEWS</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">UNIQUE VIEWERS</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-foreground/70">COMPLETION RATE</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {mostViewed.map((item, index) => (
                    <tr key={index} className="border-b border-primary/5 hover:bg-primary/5 transition-colors cursor-pointer">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-foreground">{item.showcase}</p>
                          <p className="text-sm text-foreground/60">{item.person}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{item.views}</span>
                          <div className="flex items-center gap-1 text-green-600">
                            <ArrowUp className="w-3 h-3" />
                            <span className="text-xs">{item.viewsChange}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{item.uniqueViewers}</span>
                          <div className="flex items-center gap-1 text-green-600">
                            <ArrowUp className="w-3 h-3" />
                            <span className="text-xs">{item.viewersChange}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-foreground">{item.completionRate}</span>
                      </td>
                      <td className="py-4 px-4">
                        <ArrowRight className="w-4 h-4 text-foreground/40" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          )}

          {/* Device & Location Section */}
          {activeTab !== "Logs" && (
            <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
            <h2 className="text-xl font-bold text-foreground mb-6">Device & Location</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Viewers by OS */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Viewers by OS</h3>
                <div className="space-y-4">
                  {osData.map((os, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{os.name}</span>
                        <span className="text-sm font-medium text-foreground">{os.percentage}%</span>
                      </div>
                      <div className="w-full bg-primary/5 rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${(os.views / maxOsViews) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-foreground/60 mt-1 block">{os.views.toLocaleString()} Views</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Viewers by Browser */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-4">Viewers by Browser</h3>
                <div className="space-y-4">
                  {browserData.map((browser, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-foreground">{browser.name}</span>
                        <span className="text-sm font-medium text-foreground">{browser.percentage}%</span>
                      </div>
                      <div className="w-full bg-primary/5 rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${(browser.views / maxBrowserViews) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-foreground/60 mt-1 block">{browser.views.toLocaleString()} Views</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Viewers by Country Map */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Viewers by Country</h3>
              <div className="bg-surface rounded-lg border border-primary/10 p-4 min-h-[500px] relative">
                {/* Tooltip */}
                {tooltipContent && (
                  <div 
                    className="absolute z-10 bg-foreground text-surface px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none"
                    style={{ 
                      left: '50%', 
                      top: '20px',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <div className="font-semibold">{tooltipContent.name}</div>
                    <div className="text-xs mt-1">{tooltipContent.views.toLocaleString()} views</div>
                  </div>
                )}
                
                <ComposableMap
                  projectionConfig={{
                    scale: 147,
                    center: [0, 20]
                  }}
                  className="w-full h-full"
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const countryCode = geo.properties.ISO_A2 || "";
                        const countryName = (geo.properties.NAME || geo.properties.NAME_LONG || "Unknown") as string;
                        const views = countryCode ? (countryViews[countryCode] || 0) : 0;
                        const colorData = getCountryColor(views);
                        const isSelected = selectedCountry === countryCode;
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={colorData.fill}
                            fillOpacity={colorData.opacity}
                            stroke={isSelected ? "#8a4630" : "#d0d0d0"}
                            strokeWidth={isSelected ? 2 : 0.5}
                            style={{
                              default: {
                                outline: "none",
                                cursor: "pointer",
                                transition: "all 0.2s ease"
                              },
                              hover: {
                                fill: "#b05a36",
                                fillOpacity: Math.min(colorData.opacity + 0.1, 1),
                                stroke: "#8a4630",
                                strokeWidth: 1.5,
                                outline: "none"
                              },
                              pressed: {
                                fill: "#8a4630",
                                fillOpacity: 0.8,
                                stroke: "#8a4630",
                                strokeWidth: 2,
                                outline: "none"
                              }
                            }}
                            onClick={() => {
                              if (countryCode) {
                                setSelectedCountry(countryCode === selectedCountry ? null : countryCode);
                                if (views > 0) {
                                  setTooltipContent({ name: countryName, views });
                                  setTimeout(() => setTooltipContent(null), 3000);
                                }
                              }
                            }}
                            onMouseEnter={() => {
                              if (views > 0 && countryCode) {
                                setTooltipContent({ name: countryName, views });
                              }
                            }}
                            onMouseLeave={() => {
                              if (!selectedCountry) {
                                setTooltipContent(null);
                              }
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ComposableMap>
                
                {/* Legend - Top Right */}
                <div className="absolute top-4 right-4 bg-surface/95 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-primary/10">
                  <div className="text-sm font-semibold text-foreground mb-2">Views</div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-20 h-3 bg-gradient-to-r from-primary/10 to-primary rounded" />
                  </div>
                  <div className="flex justify-between text-xs text-foreground/70">
                    <span>1</span>
                    <span>11.6K</span>
                  </div>
                  {selectedCountry && (
                    <div className="mt-3 pt-3 border-t border-primary/10 text-xs text-foreground/70">
                      Click a country to select
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
          )}
        </div>
      </main>
    </div>
  );
}
