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
  FolderArchive,
  Loader2,
  RefreshCw,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Share2,
  Copy,
  Mail,
  MessageSquare,
  Check
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DemoThumbnailWrapper } from "./components/DemoThumbnail";
import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "../components/Sidebar";

interface Recording {
  id: string;
  filename: string;
  title: string;
  date: string;
  size: number;
  creator: string;
  thumbnail?: {
    html: string;
    viewportWidth: number;
    viewportHeight: number;
  };
}

export default function DemosPage() {
  const [activeNav, setActiveNav] = useState("Demos");
  const [activeTab, setActiveTab] = useState("Shared with Team");
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Dynamic recordings state
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // File upload state
  const [showImportModal, setShowImportModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [demoToDelete, setDemoToDelete] = useState<Recording | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Share state
  const [showShareModal, setShowShareModal] = useState(false);
  const [demoToShare, setDemoToShare] = useState<Recording | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const fetchRecordings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/recordings');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setRecordings(data.recordings || []);
      }
    } catch (err) {
      setError('Failed to load recordings');
      console.error('Error fetching recordings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const handleDeleteClick = (recording: Recording, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDemoToDelete(recording);
    setShowDeleteConfirm(true);
    setOpenMenuId(null);
  };

  const handleShareClick = (recording: Recording, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDemoToShare(recording);
    setShowShareModal(true);
    setOpenMenuId(null);
    setLinkCopied(false);
  };

  const getShareLink = (recording: Recording) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/editor/${encodeURIComponent(recording.id)}`;
  };

  const handleCopyLink = async () => {
    if (!demoToShare) return;
    const link = getShareLink(demoToShare);
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShareEmail = () => {
    if (!demoToShare) return;
    const link = getShareLink(demoToShare);
    const subject = encodeURIComponent(`Check out this demo: ${demoToShare.title}`);
    const body = encodeURIComponent(`I wanted to share this demo with you:\n\n${demoToShare.title}\n\nView it here: ${link}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareSlack = () => {
    if (!demoToShare) return;
    const link = getShareLink(demoToShare);
    const text = encodeURIComponent(`Check out this demo: ${demoToShare.title}`);
    window.open(`https://slack.com/share?url=${encodeURIComponent(link)}&text=${text}`, '_blank');
  };

  const handleConfirmDelete = async () => {
    if (!demoToDelete) return;

    setIsDeleting(true);
    try {
      console.log('Deleting demo with ID:', demoToDelete.id);
      const encodedId = encodeURIComponent(demoToDelete.id);
      console.log('Encoded ID:', encodedId);
      const response = await fetch(`/api/recordings/${encodedId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete demo');
      }

      // Refresh the recordings list
      await fetchRecordings();
      setShowDeleteConfirm(false);
      setDemoToDelete(null);
    } catch (err) {
      console.error('Error deleting demo:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete demo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportClick = () => {
    setShowImportModal(true);
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type (expecting JSON files)
    if (!file.name.endsWith('.json')) {
      setUploadError('Please select a valid JSON file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Validate JSON structure first
      const fileContent = await file.text();
      const demoData = JSON.parse(fileContent);

      // Basic validation - check if it's a valid JSON object
      if (typeof demoData !== 'object' || demoData === null) {
        throw new Error('Invalid demo file format. File must contain a valid JSON object.');
      }

      // Upload to API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/recordings/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import demo');
      }

      const result = await response.json();
      setUploadSuccess(true);

      // Refresh recordings list after a short delay
      setTimeout(() => {
        fetchRecordings();
        setShowImportModal(false);
        setUploadSuccess(false);
        // Reset file input
        if (event.target) {
          event.target.value = '';
        }
      }, 1500);

    } catch (err) {
      console.error('Error importing demo:', err);
      if (err instanceof SyntaxError) {
        setUploadError('Invalid JSON file format. Please check the file and try again.');
      } else {
        setUploadError(err instanceof Error ? err.message : 'Failed to import demo file');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) {
      setUploadError('No file dropped');
      return;
    }

    if (!file.name.endsWith('.json')) {
      setUploadError('Please drop a valid JSON file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Validate JSON structure first
      const fileContent = await file.text();
      const demoData = JSON.parse(fileContent);

      // Basic validation - check if it's a valid JSON object
      if (typeof demoData !== 'object' || demoData === null) {
        throw new Error('Invalid demo file format. File must contain a valid JSON object.');
      }

      // Upload to API
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/recordings/import', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import demo');
      }

      setUploadSuccess(true);

      // Refresh recordings list after a short delay
      setTimeout(() => {
        fetchRecordings();
        setShowImportModal(false);
        setUploadSuccess(false);
      }, 1500);

    } catch (err) {
      console.error('Error importing demo:', err);
      if (err instanceof SyntaxError) {
        setUploadError('Invalid JSON file format. Please check the file and try again.');
      } else {
        setUploadError(err instanceof Error ? err.message : 'Failed to import demo file');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

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
                    <button
                      onClick={() => {
                        setShowCreateDropdown(false);
                        handleImportClick();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors"
                    >
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
              className={`flex items-center gap-2 pb-2 px-1 text-sm font-medium transition-colors ${activeTab === "Shared with Team"
                ? "text-foreground border-b-2 border-primary"
                : "text-foreground/60 hover:text-foreground"
                }`}
            >
              <Users className="w-4 h-4" />
              Shared with Team
            </button>
            <button
              onClick={() => setActiveTab("Personal")}
              className={`flex items-center gap-2 pb-2 px-1 text-sm font-medium transition-colors ${activeTab === "Personal"
                ? "text-foreground border-b-2 border-primary"
                : "text-foreground/60 hover:text-foreground"
                }`}
            >
              <User2 className="w-4 h-4" />
              Personal
            </button>
            <button
              onClick={() => setActiveTab("Archived")}
              className={`flex items-center gap-2 pb-2 px-1 text-sm font-medium transition-colors ${activeTab === "Archived"
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
                className={`p-1.5 rounded transition-colors ${viewMode === "grid"
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/60 hover:text-foreground"
                  }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${viewMode === "list"
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
          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-foreground/60">Loading recordings...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="text-red-500 mb-4">
                <FileText className="w-12 h-12" />
              </div>
              <p className="text-foreground mb-2">Failed to load recordings</p>
              <p className="text-foreground/60 text-sm mb-4">{error}</p>
              <button
                onClick={fetchRecordings}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : recordings.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-primary/40" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No recordings yet</h3>
              <p className="text-foreground/60 text-sm text-center max-w-md mb-4">
                Use the Holodeck Builder extension to record your first demo.
                Recordings will automatically appear here.
              </p>
              <button
                onClick={fetchRecordings}
                className="flex items-center gap-2 px-4 py-2 border border-primary/20 rounded-lg text-primary hover:bg-primary/5 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recordings.map((recording) => (
                <Link
                  key={recording.id}
                  href={`/editor/${encodeURIComponent(recording.id)}`}
                  className="bg-surface rounded-lg border border-primary/10 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group block"
                >
                  {/* Thumbnail area - full width, no padding */}
                  <div className="relative">
                    <DemoThumbnailWrapper thumbnail={recording.thumbnail} />
                    {/* Three-dot menu on top of thumbnail */}
                    <div className="absolute top-2 right-2 z-10">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === recording.id ? null : recording.id);
                        }}
                        className="p-1.5 bg-surface/90 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4 text-foreground/60" />
                      </button>
                      {openMenuId === recording.id && (
                        <div className="absolute right-0 mt-1 w-40 bg-surface border border-primary/10 rounded-lg shadow-lg z-20">
                          <button
                            onClick={(e) => handleShareClick(recording, e)}
                            className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(recording, e)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Text content with padding */}
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 truncate">{recording.title}</h3>
                    <p className="text-sm text-foreground/60">
                      {recording.creator} • {recording.date}
                    </p>
                    <p className="text-xs text-foreground/40 mt-1">
                      {(recording.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {recordings.map((recording) => (
                <Link
                  key={recording.id}
                  href={`/editor/${encodeURIComponent(recording.id)}`}
                  className="bg-surface rounded-lg border border-primary/10 p-4 hover:bg-primary/5 transition-colors cursor-pointer flex items-center gap-4 group"
                >
                  <div className="w-24 h-16 flex-shrink-0">
                    {recording.thumbnail ? (
                      <div className="w-full h-full rounded-lg overflow-hidden">
                        <DemoThumbnailWrapper thumbnail={recording.thumbnail} />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-primary/5 rounded-lg flex items-center justify-center">
                        <FileText className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground mb-1 truncate">{recording.title}</h3>
                    <p className="text-sm text-foreground/60">
                      {recording.creator} • {recording.date} • {(recording.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === recording.id ? null : recording.id);
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="w-4 h-4 text-foreground/60" />
                    </button>
                    {openMenuId === recording.id && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-surface border border-primary/10 rounded-lg shadow-lg z-20">
                        <button
                          onClick={(e) => handleShareClick(recording, e)}
                          className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-primary/5 transition-colors flex items-center gap-2"
                        >
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(recording, e)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Import Demo Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowImportModal(false)}>
          <div
            className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-primary/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Import Demo</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setUploadError(null);
                  setUploadSuccess(false);
                }}
                className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-foreground/60" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="flex flex-col items-center py-8">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-foreground font-medium mb-2">Demo imported successfully!</p>
                <p className="text-sm text-foreground/60">The demo will appear in your list shortly.</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-foreground/70 mb-6">
                  Upload a demo file from your computer. Supported format: JSON files.
                </p>

                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center mb-4 hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                  <p className="text-sm text-foreground mb-2">
                    Drag and drop your demo file here
                  </p>
                  <p className="text-xs text-foreground/60 mb-4">or</p>
                  <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
                    Browse Files
                  </button>
                  <p className="text-xs text-foreground/40 mt-4">Supported: JSON files</p>
                </div>

                {/* Hidden File Input */}
                <input
                  id="file-input"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* Upload Status */}
                {isUploading && (
                  <div className="flex items-center gap-2 text-primary mb-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Uploading demo...</span>
                  </div>
                )}

                {uploadError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-600 font-medium">Error</p>
                      <p className="text-xs text-red-600/80 mt-1">{uploadError}</p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setUploadError(null);
                      setUploadSuccess(false);
                    }}
                    className="px-4 py-2 border border-primary/10 text-foreground rounded-lg font-medium hover:bg-primary/5 transition-colors"
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && demoToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
          <div
            className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-primary/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">Remove Demo</h3>
                <p className="text-sm text-foreground/60 mt-1">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-foreground mb-6">
              Are you sure you want to remove <span className="font-semibold">"{demoToDelete.title}"</span>? This will permanently delete the demo.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDemoToDelete(null);
                }}
                className="px-4 py-2 border border-primary/10 text-foreground rounded-lg font-medium hover:bg-primary/5 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && demoToShare && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShareModal(false)}>
          <div
            className="bg-surface rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-primary/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground">Share Demo</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setDemoToShare(null);
                  setLinkCopied(false);
                }}
                className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-foreground/60" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-foreground/70 mb-2">Share "{demoToShare.title}"</p>
              <div className="bg-background border border-primary/10 rounded-lg p-3 flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getShareLink(demoToShare)}
                  className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-2"
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleShareEmail}
                className="w-full flex items-center gap-3 px-4 py-3 bg-background border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Share via Email</p>
                  <p className="text-xs text-foreground/60">Send a link via email</p>
                </div>
              </button>

              <button
                onClick={handleShareSlack}
                className="w-full flex items-center gap-3 px-4 py-3 bg-background border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors text-left"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Share on Slack</p>
                  <p className="text-xs text-foreground/60">Share in a Slack channel</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
