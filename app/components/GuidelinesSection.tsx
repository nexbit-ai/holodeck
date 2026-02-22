import { useState, useEffect } from "react";
import { Plus, X, Loader2, Save, Trash2, FileText } from "lucide-react";
import { guidelinesService, GuidelinesConfig } from "../services/guidelinesService";

export function GuidelinesSection() {
    const [guidelinesConfig, setGuidelinesConfig] = useState<GuidelinesConfig | null>(null);
    const [guidelinesText, setGuidelinesText] = useState("");
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchGuidelines();
    }, []);

    const fetchGuidelines = async () => {
        setLoading(true);
        try {
            const data = await guidelinesService.getGuidelines("demo-org");
            setGuidelinesConfig(data);
            if (data) {
                setGuidelinesText(data.guidelines);
            }
        } catch (err) {
            console.error("Failed to fetch guidelines", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const updatedConfig = await guidelinesService.updateGuidelines({
                organization_id: "demo-org",
                guidelines: guidelinesText,
            });
            setGuidelinesConfig(updatedConfig);
            setShowAddModal(false);
        } catch (err: any) {
            setError(err.message || "Failed to save guidelines");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete these guidelines? The chatbot will revert to default behavior.")) return;

        setIsSaving(true);
        try {
            await guidelinesService.deleteGuidelines("demo-org");
            setGuidelinesConfig(null);
            setGuidelinesText("");
        } catch (err: any) {
            setError(err.message || "Failed to delete guidelines");
            console.error("Failed to delete guidelines", err);
        } finally {
            setIsSaving(false);
        }
    };

    // If no guidelines exist, show the "Empty State" UI
    const renderEmptyState = () => (
        <div className="bg-background/50 border border-primary/10 rounded-2xl p-12 min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Cloud Graphics */}
            <div className="relative mb-8 group-hover:scale-110 transition-transform duration-500">
                <div className="w-32 h-32 bg-primary/5 rounded-full absolute -top-4 -left-4 animate-pulse"></div>
                <div className="w-24 h-24 bg-primary/10 rounded-full absolute top-0 left-0"></div>
                <div className="w-28 h-28 bg-primary/5 rounded-full absolute -top-2 left-12"></div>
            </div>

            <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Start by adding a guideline</h3>
            <p className="text-sm text-foreground/50 mb-8 font-medium max-w-xs text-center leading-relaxed">Define your agent's persona and rules to ensure consistent AI behavior.</p>

            <button
                onClick={() => {
                    setGuidelinesText("");
                    setShowAddModal(true);
                }}
                className="btn-terracotta flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95"
            >
                <Plus className="w-5 h-5" />
                Add New Guideline
            </button>
        </div>
    );

    return (
        <section className="premium-surface rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground tracking-tight">System Guidelines</h2>
                        <p className="text-xs text-foreground/50 font-medium">Fine-tune your agent's core instructions</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : guidelinesConfig ? (
                <div className="space-y-4">
                    <div className="bg-background/50 border border-primary/10 rounded-2xl p-8 relative group hover:bg-background transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shadow-sm">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground tracking-tight">Active Guidelines</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg border border-primary/10 font-bold uppercase tracking-wider">v{guidelinesConfig.version}</span>
                                        <span className="text-xs text-foreground/40 font-medium tracking-tight">Updated {new Date(guidelinesConfig.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={handleDelete}
                                    className="p-2.5 text-foreground/40 hover:text-red-600 bg-surface/50 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all"
                                    title="Delete Guidelines"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="prose prose-sm max-w-none text-foreground/70 whitespace-pre-wrap leading-relaxed px-1">
                            {guidelinesConfig.guidelines}
                        </div>

                        <div className="mt-8 pt-6 border-t border-primary/5 flex justify-end">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 text-primary hover:text-primary active:scale-95 font-bold text-sm transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Edit System Instructions
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                renderEmptyState()
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-lg p-6 max-w-2xl w-full shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-foreground">
                                {guidelinesConfig ? "Edit Guidelines" : "Add Guidelines"}
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-foreground/60" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-foreground/70 mb-2">
                                Instructions for the AI assistant. These guidelines will be included in the system prompt for every conversation.
                            </p>
                            <textarea
                                value={guidelinesText}
                                onChange={(e) => setGuidelinesText(e.target.value)}
                                className="w-full h-64 px-4 py-3 bg-background border border-primary/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none font-mono"
                                placeholder="e.g. Always be helpful and professional. Never share confidential information..."
                            />
                            <p className="text-xs text-foreground/40 mt-1 text-right">
                                {guidelinesText.length} characters
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                <X className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-5 py-2.5 border border-primary/10 text-foreground/60 rounded-xl font-bold text-sm hover:bg-primary/5 transition-all"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-terracotta flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                                disabled={isSaving || !guidelinesText.trim()}
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Save className="w-4 h-4" />
                                <span>Save System Guidelines</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
