
import { useState, useEffect, useRef } from "react";
import { BookOpen, Upload, Trash2, FileText, Loader2, Check, AlertCircle, X, Search } from "lucide-react";
import { knowledgeBaseService, KBDocument } from "../services/knowledgeBaseService";

export function KnowledgeBaseSection() {
    const [documents, setDocuments] = useState<KBDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const data = await knowledgeBaseService.getDocuments("demo-org");
            setDocuments(data);
        } catch (err) {
            console.error("Failed to fetch documents", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError("Please select a file to upload");
            return;
        }

        setUploading(true);
        setError(null);

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const content = e.target?.result as string;
                if (!content) {
                    throw new Error("File content is empty");
                }

                await knowledgeBaseService.uploadDocument({
                    organization_id: "demo-org",
                    filename: selectedFile.name,
                    content: content,
                    file_type: selectedFile.type || "text/plain"
                });

                await fetchDocuments();
                handleCloseModal();
            } catch (err: any) {
                console.error("Upload failed", err);
                setError(err.message || "Failed to upload document");
            } finally {
                setUploading(false);
            }
        };

        reader.onerror = () => {
            setError("Failed to read file");
            setUploading(false);
        };

        // For this iteration, we treat all files as text to extract content for the API.
        // In a real app, we'd need PDF/DOCX parsing libraries.
        reader.readAsText(selectedFile);
    };

    const handleDelete = async (id: string, filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

        try {
            await knowledgeBaseService.deleteDocument(id, "demo-org");
            setDocuments(documents.filter(d => d.id !== id));
        } catch (err) {
            console.error("Failed to delete document", err);
            alert("Failed to delete document");
        }
    };

    const handleCloseModal = () => {
        setShowUploadModal(false);
        setSelectedFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Knowledge Base</h2>
                        <p className="text-xs text-foreground/60">
                            Manage documents for AI context
                        </p>
                    </div>
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
                Upload text-based documents (TXT, MD) that your chatbot can reference when answering questions.
            </p>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : documents.length === 0 ? (
                <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
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
                                    <p className="font-medium text-foreground">{doc.filename}</p>
                                    <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-foreground/60">
                                            {doc.file_type || "text/plain"}
                                        </span>
                                        <span className="text-xs text-foreground/60">•</span>
                                        <span className="text-xs text-foreground/60">
                                            Uploaded {new Date(doc.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(doc.id, doc.filename)}
                                className="p-2 text-foreground/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Document"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-foreground">Upload Document</h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-foreground/60" />
                            </button>
                        </div>
                        <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center mb-4 transition-colors hover:border-primary/40">
                            <Upload className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                id="file-upload"
                                accept=".txt,.md,.json,.csv" // Restricting to likely text formats for now
                            />
                            {selectedFile ? (
                                <div className="text-center">
                                    <p className="font-medium text-primary mb-1">{selectedFile.name}</p>
                                    <p className="text-xs text-foreground/60">
                                        {(selectedFile.size / 1024).toFixed(1)} KB
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSelectedFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 mt-2 underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer"
                                    >
                                        <span className="block text-sm text-foreground mb-2">
                                            Click to browse files
                                        </span>
                                        <p className="text-xs text-foreground/60">
                                            Supported: TXT, MD, JSON, CSV (Text files)
                                        </p>
                                    </label>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                className="px-4 py-2 border border-primary/10 text-foreground rounded-lg font-medium hover:bg-primary/5 transition-colors"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                disabled={!selectedFile || uploading}
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
