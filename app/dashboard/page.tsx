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
import Image from "next/image";
import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState("Home");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative">
          {/* Content Area */}
          <div className="px-8 py-8 space-y-12">
            {/* Header Section */}
            <div className="flex items-center justify-between pt-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">
                  Welcome back, <span className="text-primary">{user?.email?.split("@")[0] || "User"}</span>
                </h2>
                <p className="text-foreground/50 mt-1 font-medium">Here's what's happening with your demos today.</p>
              </div>
              <button className="btn-terracotta flex items-center gap-2 px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Video className="w-5 h-5" />
                <span>Create New Demo</span>
              </button>
            </div>
            {/* Get Started Section */}
            <section>
              <h3 className="text-xl font-bold text-foreground mb-6">Get started with Nexbit</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="premium-surface rounded-2xl p-8 flex flex-col items-center text-center group">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Chrome className="w-7 h-7 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Install Extension</h4>
                  <p className="text-sm text-foreground/60 mb-8 leading-relaxed">Start recording your product demos with our browser extension.</p>
                  <button className="btn-terracotta w-full py-3 rounded-xl font-bold transition-all mt-auto">
                    Install Now
                  </button>
                </div>

                <div className="premium-surface rounded-2xl p-8 flex flex-col items-center text-center group">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Video className="w-7 h-7 text-primary/70" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Record Demo</h4>
                  <p className="text-sm text-foreground/60 mb-8 leading-relaxed">Capture interactive product walkthroughs effortlessly.</p>
                  <button className="w-full border-2 border-primary/20 text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition-all mt-auto">
                    Quick Start
                  </button>
                </div>

                <div className="premium-surface rounded-2xl p-8 flex flex-col items-center text-center group">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Share2 className="w-7 h-7 text-primary/70" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Share Demos</h4>
                  <p className="text-sm text-foreground/60 mb-8 leading-relaxed">Distribute your demos via links, embeds, or integrations.</p>
                  <button className="w-full border-2 border-primary/20 text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition-all mt-auto">
                    Share Links
                  </button>
                </div>

                <div className="premium-surface rounded-2xl p-8 flex flex-col items-center text-center group">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Plug className="w-7 h-7 text-primary/70" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Integrations</h4>
                  <p className="text-sm text-foreground/60 mb-8 leading-relaxed">Connect with your CRM, marketing, and sales tools.</p>
                  <button className="w-full border-2 border-primary/20 text-primary py-3 rounded-xl font-bold hover:bg-primary/5 transition-all mt-auto">
                    Setup CRM
                  </button>
                </div>
              </div>
            </section>

            {/* Demo Examples Section */}
            <section>
              <h3 className="text-xl font-bold text-foreground mb-6">Demo examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="premium-surface rounded-2xl p-8 flex flex-col group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Website embed</h4>
                  <p className="text-sm text-foreground/60 mb-6 leading-relaxed">Showcase your product's value, capture leads, and make a strong impression.</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">Demand gen</span>
                    <span className="px-3 py-1 bg-primary/5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider rounded-lg">Lead conversion</span>
                  </div>
                </div>

                <div className="premium-surface rounded-2xl p-8 flex flex-col group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <MousePointer className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Sales leave behinds</h4>
                  <p className="text-sm text-foreground/60 mb-6 leading-relaxed">Provide prospects with an interactive demo they can revisit anytime.</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">Close deals</span>
                    <span className="px-3 py-1 bg-primary/5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider rounded-lg">Sales velocity</span>
                  </div>
                </div>

                <div className="premium-surface rounded-2xl p-8 flex flex-col group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Server className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Sandbox environments</h4>
                  <p className="text-sm text-foreground/60 mb-6 leading-relaxed">Offer a hands-on sandbox environment to deliver stellar demo experiences.</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">Close deals</span>
                    <span className="px-3 py-1 bg-primary/5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider rounded-lg">Live demo</span>
                  </div>
                </div>

                <div className="premium-surface rounded-2xl p-8 flex flex-col group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Mobile demos</h4>
                  <p className="text-sm text-foreground/60 mb-6 leading-relaxed">Showcase your mobile experience with seamless navigation.</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">Demand gen</span>
                    <span className="px-3 py-1 bg-primary/5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider rounded-lg">Mobile experience</span>
                  </div>
                </div>

                <div className="premium-surface rounded-2xl p-8 flex flex-col group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <UserCheck className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Personalized demos</h4>
                  <p className="text-sm text-foreground/60 mb-6 leading-relaxed">Deliver tailored, up-to-date demos for a personal experience.</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">Close deals</span>
                    <span className="px-3 py-1 bg-primary/5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider rounded-lg">Sales win rate</span>
                  </div>
                </div>

                <div className="premium-surface rounded-2xl p-8 flex flex-col group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-lg text-foreground mb-3">Feature launches</h4>
                  <p className="text-sm text-foreground/60 mb-6 leading-relaxed">Generate excitement by showcasing new features instantly.</p>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    <span className="px-3 py-1 bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-wider rounded-lg">Increase adoption</span>
                    <span className="px-3 py-1 bg-primary/5 text-foreground/50 text-[10px] font-bold uppercase tracking-wider rounded-lg">Feature launch</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
