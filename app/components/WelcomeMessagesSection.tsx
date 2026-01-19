import { useState, useEffect } from "react";
import { MessageSquare, Plus, Trash2, Edit2, Check, X, Loader2, Star } from "lucide-react";
import { welcomeService, WelcomeMessage, CreateWelcomeMessageData } from "../services/welcomeService";

export function WelcomeMessagesSection() {
    const [messages, setMessages] = useState<WelcomeMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMessage, setEditingMessage] = useState<WelcomeMessage | null>(null);

    // Form state
    const [formData, setFormData] = useState<CreateWelcomeMessageData>({
        organization_id: "demo-org",
        message: "",
        is_default: false,
        conditions: {},
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const data = await welcomeService.getWelcomeMessages("demo-org");
            setMessages(data);
        } catch (err) {
            console.error("Failed to fetch welcome messages", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Enforce single default message
            if (formData.is_default) {
                const currentDefault = messages.find(m => m.is_default);
                // If there is a current default and it's not the one we are editing
                if (currentDefault && currentDefault.id !== editingMessage?.id) {
                    await welcomeService.updateWelcomeMessage(currentDefault.id, "demo-org", {
                        is_default: false
                    });
                }
            }

            if (editingMessage) {
                await welcomeService.updateWelcomeMessage(editingMessage.id, "demo-org", {
                    message: formData.message,
                    is_default: formData.is_default
                });
            } else {
                await welcomeService.createWelcomeMessage({
                    organization_id: "demo-org",
                    message: formData.message,
                    is_default: formData.is_default,
                    conditions: {} // Default empty conditions for now
                });
            }

            await fetchMessages();
            handleCloseModal();
        } catch (err: any) {
            setError(err.message || "Failed to save message");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this welcome message?")) return;

        try {
            await welcomeService.deleteWelcomeMessage(id, "demo-org");
            setMessages(messages.filter(m => m.id !== id));
        } catch (err) {
            console.error("Failed to delete message", err);
            alert("Failed to delete message");
        }
    };

    const handleEdit = (message: WelcomeMessage) => {
        setEditingMessage(message);
        setFormData({
            organization_id: message.organization_id,
            message: message.message,
            is_default: message.is_default,
            conditions: message.conditions || {}
        });
        setShowAddModal(true);
    };

    const handleSetDefault = async (message: WelcomeMessage) => {
        try {
            // Unset current default if exists
            const currentDefault = messages.find(m => m.is_default);
            if (currentDefault) {
                await welcomeService.updateWelcomeMessage(currentDefault.id, "demo-org", {
                    is_default: false
                });
            }

            await welcomeService.updateWelcomeMessage(message.id, "demo-org", {
                is_default: true
            });
            fetchMessages(); // Refresh to update all messages' status
        } catch (err) {
            console.error("Failed to set default", err);
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingMessage(null);
        setFormData({
            organization_id: "demo-org",
            message: "",
            is_default: false,
            conditions: {},
        });
        setError(null);
    };

    return (
        <section className="bg-surface rounded-lg p-6 shadow-sm border border-primary/5">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold text-foreground">Welcome Messages</h2>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New
                </button>
            </div>

            <p className="text-sm text-foreground/70 mb-4">
                Manage the welcome messages displayed when users start a new conversation.
            </p>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
            ) : messages.length === 0 ? (
                <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center">
                    <MessageSquare className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                    <p className="text-foreground/60 mb-2">No welcome messages found</p>
                    <p className="text-sm text-foreground/40">Create one to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`p-4 bg-background border rounded-lg transition-colors group ${msg.is_default ? "border-primary/40 bg-primary/5" : "border-primary/10 hover:border-primary/30"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        {msg.is_default && (
                                            <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                                <Star className="w-3 h-3 fill-current" />
                                                Default
                                            </span>
                                        )}
                                        <span className="text-xs text-foreground/40">
                                            Created {new Date(msg.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground">{msg.message}</p>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!msg.is_default && (
                                        <button
                                            onClick={() => handleSetDefault(msg)}
                                            className="p-2 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Set as Default"
                                        >
                                            <Star className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleEdit(msg)}
                                        className="p-2 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(msg.id)}
                                        className="p-2 text-foreground/60 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-foreground">
                                {editingMessage ? "Edit Welcome Message" : "New Welcome Message"}
                            </h3>
                            <button
                                onClick={handleCloseModal}
                                className="p-1 hover:bg-primary/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-foreground/60" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Message Content
                                </label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full h-32 px-4 py-3 bg-background border border-primary/10 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                                    placeholder="Enter the welcome message..."
                                    required
                                    maxLength={5000}
                                />
                                <p className="text-xs text-foreground/40 mt-1 text-right">
                                    {formData.message.length}/5000
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_default}
                                        onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                        className="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary/20"
                                    />
                                    <span className="text-sm text-foreground">Set as default message</span>
                                </label>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <X className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-primary/10 text-foreground rounded-lg font-medium hover:bg-primary/5 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingMessage ? "Save Changes" : "Create Message"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
