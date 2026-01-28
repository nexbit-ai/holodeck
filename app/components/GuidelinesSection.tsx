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
            <p className="text-sm text-foreground/70 mb-1">Define your agent's persona and rules.</p>
            <p className="text-sm text-foreground/60 mb-6">Start creating by clicking on Add new</p>

            <button
                onClick={() => {
                    setGuidelinesText("");
                    setShowAddModal(true);
                }}
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
                <Plus className="w-5 h-5" />
                Add new
            </button>
        </div>
    );

    return (
        <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                    Fine tune your agent
                </h2>

            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : guidelinesConfig ? (
                <div className="space-y-4">
                    <div className="bg-background border border-primary/10 rounded-lg p-6 relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary" />
                                <div>
                                    <h3 className="font-medium text-foreground">System Guidelines</h3>
                                    <p className="text-xs text-foreground/50">Version {guidelinesConfig.version} • Updated {new Date(guidelinesConfig.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleDelete}
                                    className="p-2 text-foreground/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Guidelines"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap">
                            {guidelinesConfig.guidelines}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                Edit Guidelines
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

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="px-4 py-2 border border-primary/10 text-foreground rounded-lg font-medium hover:bg-primary/5 transition-colors"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                disabled={isSaving || !guidelinesText.trim()}
                            >
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                <Save className="w-4 h-4" />
                                Save Guidelines
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
