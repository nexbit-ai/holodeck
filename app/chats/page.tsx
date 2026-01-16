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
  AlertCircle,
  CheckCircle2,
  Plus,
  X
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function ChatsPage() {
  const [activeNav, setActiveNav] = useState("Chats");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);

  // Chat settings state
  const [tone, setTone] = useState("professional");
  const [guidelines, setGuidelines] = useState<Array<{ id: number; text: string }>>([]);
  const [showAddGuideline, setShowAddGuideline] = useState(false);
  const [newGuideline, setNewGuideline] = useState("");

  // Documents state
  const [documents, setDocuments] = useState([
    { id: 1, name: "Product Documentation.pdf", size: "2.4 MB", uploaded: "Jan 10, 2025", status: "processed" },
    { id: 2, name: "API Reference Guide.md", size: "856 KB", uploaded: "Jan 12, 2025", status: "processing" },
    { id: 3, name: "User Guide.docx", size: "1.2 MB", uploaded: "Jan 14, 2025", status: "processed" }
  ]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const tones = [
    { value: "professional", label: "Professional", description: "Formal and business-appropriate" },
    { value: "friendly", label: "Friendly", description: "Warm and approachable" },
    { value: "casual", label: "Casual", description: "Relaxed and conversational" },
    { value: "technical", label: "Technical", description: "Detailed and precise" },
    { value: "supportive", label: "Supportive", description: "Empathetic and helpful" }
  ];

  const handleDeleteDocument = (id: number) => {
    setDocuments(documents.filter(doc => doc.id !== id));
  };

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
            href="/demos"
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
            href="/insights"
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Chat Settings</h1>
          <p className="text-foreground/70">Configure your chatbot's behavior, tone, and knowledge base.</p>
        </div>

        {/* Content Area */}
        <div className="px-8 py-6 space-y-8">
          {/* Tone Settings */}
          <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Chatbot Tone</h2>
            </div>
            <p className="text-sm text-foreground/70 mb-4">Select the tone and style for your chatbot's responses.</p>
            <div className="flex flex-wrap gap-2">
              {tones.map((toneOption) => (
                <button
                  key={toneOption.value}
                  onClick={() => setTone(toneOption.value)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${tone === toneOption.value
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-foreground"
                    }`}
                >
                  {toneOption.label}
                </button>
              ))}
            </div>
          </section>

          {/* Guidelines Section */}
          <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                Fine tune your agent
              </h2>
              <button className="px-4 py-2 border border-primary/20 bg-primary/5 text-primary rounded-lg text-sm font-medium hover:bg-primary/10 transition-colors">
                Learn more
              </button>
            </div>

            {guidelines.length === 0 ? (
              <div className="bg-background border border-primary/10 rounded-lg p-12 min-h-[400px] flex flex-col items-center justify-center">
                {/* Cloud Graphics */}
                <div className="relative mb-8">
                  <div className="w-32 h-32 bg-primary/5 rounded-full absolute -top-4 -left-4"></div>
                  <div className="w-24 h-24 bg-primary/10 rounded-full absolute top-0 left-0"></div>
                  <div className="w-20 h-20 bg-primary/5 rounded-full absolute top-4 left-8"></div>
                  <div className="w-28 h-28 bg-primary/10 rounded-full absolute -top-2 left-12"></div>
                  <div className="w-16 h-16 bg-primary/5 rounded-full absolute top-6 left-20"></div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">Start by adding a guideline</h3>
                <p className="text-sm text-foreground/70 mb-1">Any guideline you create will be shown here</p>
                <p className="text-sm text-foreground/60 mb-6">Start creating by clicking on Add new</p>

                <button
                  onClick={() => setShowAddGuideline(true)}
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add new
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {guidelines.map((guideline) => (
                  <div
                    key={guideline.id}
                    className="bg-background border border-primary/10 rounded-lg p-4 flex items-start justify-between group"
                  >
                    <p className="text-sm text-foreground flex-1">{guideline.text}</p>
                    <button
                      onClick={() => setGuidelines(guidelines.filter(g => g.id !== guideline.id))}
                      className="p-1.5 text-foreground/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setShowAddGuideline(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-primary/20 text-primary px-6 py-4 rounded-lg font-medium hover:bg-primary/5 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add new guideline
                </button>
              </div>
            )}
          </section>

          {/* Add Guideline Modal */}
          {showAddGuideline && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-surface rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-foreground">Add New Guideline</h3>
                  <button
                    onClick={() => {
                      setShowAddGuideline(false);
                      setNewGuideline("");
                    }}
                    className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground/60" />
                  </button>
                </div>
                <textarea
                  value={newGuideline}
                  onChange={(e) => setNewGuideline(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-background border border-primary/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-4"
                  placeholder="Enter your guideline or instruction..."
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAddGuideline(false);
                      setNewGuideline("");
                    }}
                    className="px-4 py-2 border border-primary/10 text-foreground rounded-lg font-medium hover:bg-primary/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (newGuideline.trim()) {
                        setGuidelines([...guidelines, { id: Date.now(), text: newGuideline.trim() }]);
                        setNewGuideline("");
                        setShowAddGuideline(false);
                      }
                    }}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Add Guideline
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Knowledge Base / Documents */}
          <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Knowledge Base</h2>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Document
              </button>
            </div>
            <p className="text-sm text-foreground/70 mb-4">
              Upload documents that your chatbot can reference when answering questions. Supported formats: PDF, DOCX, MD, TXT.
            </p>

            {documents.length === 0 ? (
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-12 text-center">
                <FileText className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                <p className="text-foreground/60 mb-2">No documents uploaded yet</p>
                <p className="text-sm text-foreground/40">Upload documents to enhance your chatbot's knowledge base</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-background border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{doc.name}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-foreground/60">{doc.size}</span>
                          <span className="text-xs text-foreground/60">•</span>
                          <span className="text-xs text-foreground/60">Uploaded {doc.uploaded}</span>
                          <span className="text-xs text-foreground/60">•</span>
                          <span className={`text-xs flex items-center gap-1 ${doc.status === "processed" ? "text-green-600" : "text-primary"
                            }`}>
                            {doc.status === "processed" ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                Processed
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3" />
                                Processing...
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="p-2 text-foreground/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pb-8">
            <button className="px-6 py-2 border border-primary/10 text-foreground rounded-lg font-medium hover:bg-primary/5 transition-colors">
              Reset to Defaults
            </button>
            <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Save All Changes
            </button>
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground">Upload Document</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-foreground/60" />
                </button>
              </div>
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center mb-4">
                <Upload className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                <p className="text-sm text-foreground mb-2">Drag and drop your file here</p>
                <p className="text-xs text-foreground/60 mb-4">or</p>
                <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
                  Browse Files
                </button>
                <p className="text-xs text-foreground/60 mt-4">Supported: PDF, DOCX, MD, TXT (Max 10MB)</p>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-primary/10 text-foreground rounded-lg font-medium hover:bg-primary/5 transition-colors"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Upload
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
