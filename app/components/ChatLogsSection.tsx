
import { useState, useEffect } from "react";
import {
    MessageSquare,
    Trash2,
    Loader2,
    User,
    Bot,
    Clock,
    Calendar,
    Eye,
    ArrowLeft,
    ChevronLeft
} from "lucide-react";
import { chatLogsService, Conversation, ChatMessage } from "../services/chatLogsService";

export function ChatLogsSection() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            setViewMode('detail');
        }
    }, [selectedConversation]);

    const fetchConversations = async () => {
        setLoadingConversations(true);
        try {
            const data = await chatLogsService.getConversations("demo-org");
            setConversations(data);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        } finally {
            setLoadingConversations(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        setLoadingMessages(true);
        try {
            const data = await chatLogsService.getMessages(conversationId, "demo-org");
            setMessages(data);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setLoadingMessages(false);
        }
    };

    const handleDeleteConversation = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this conversation?")) return;

        try {
            await chatLogsService.deleteConversation(id, "demo-org");
            setConversations(conversations.filter(c => c.id !== id));
            if (selectedConversation?.id === id) {
                handleBackToList();
            }
        } catch (err) {
            console.error("Failed to delete conversation", err);
            alert("Failed to delete conversation");
        }
    };

    const handleBackToList = () => {
        setSelectedConversation(null);
        setMessages([]);
        setViewMode('list');
        // Refresh list to ensure up-to-date status
        fetchConversations();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    if (viewMode === 'detail' && selectedConversation) {
        return (
            <div className="bg-surface rounded-lg shadow-sm border border-primary/5 h-[800px] flex flex-col">
                {/* Detail Header with Back Button */}
                <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-surface">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBackToList}
                            className="p-2 hover:bg-primary/5 rounded-full transition-colors text-foreground/70"
                            title="Back to List"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                Conversation Details
                                <span className="text-xs font-normal text-foreground/50 font-mono bg-foreground/5 px-2 py-0.5 rounded">
                                    {selectedConversation.id}
                                </span>
                            </h3>
                            <div className="flex items-center gap-4 text-xs text-foreground/60 mt-0.5">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Started: {formatDate(selectedConversation.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
                    {loadingMessages ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-12 text-foreground/40">
                            <p>No messages in this conversation.</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-primary" />
                                    </div>
                                )}

                                <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-br-none'
                                        : 'bg-surface border border-primary/10 text-foreground rounded-bl-none'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    <div className={`text-[10px] mt-2 opacity-70 ${msg.role === 'user' ? 'text-white/80' : 'text-foreground/50'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-1">
                                        <User className="w-4 h-4 text-foreground/60" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    // List View (Table)
    return (
        <section className="bg-surface rounded-lg shadow-sm border border-primary/5 min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-primary/10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Conversation Logs</h2>
                    <p className="text-sm text-foreground/60 mt-1">View and manage chat history</p>
                </div>
                <button
                    onClick={fetchConversations}
                    className="p-2 hover:bg-primary/5 rounded-lg text-foreground/60 transition-colors"
                    title="Refresh List"
                >
                    <Clock className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-primary/10 bg-primary/5">
                            <th className="text-left py-4 px-6 text-xs font-semibold text-foreground/70 uppercase tracking-wider">Conversation ID</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-foreground/70 uppercase tracking-wider">Started At</th>
                            <th className="text-left py-4 px-6 text-xs font-semibold text-foreground/70 uppercase tracking-wider">Last Active</th>
                            <th className="text-right py-4 px-6 text-xs font-semibold text-foreground/70 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {loadingConversations ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : conversations.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-12 text-center text-foreground/60">
                                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                    <p>No conversations found</p>
                                </td>
                            </tr>
                        ) : (
                            conversations.map((conv) => (
                                <tr
                                    key={conv.id}
                                    className="hover:bg-primary/5 transition-colors group cursor-default"
                                >
                                    <td className="py-4 px-6 text-sm text-foreground font-mono">
                                        {conv.id}
                                    </td>
                                    <td className="py-4 px-6 text-sm text-foreground/80">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 opacity-50" />
                                            {formatDate(conv.created_at)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-foreground/80">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 opacity-50" />
                                            {formatDate(conv.updated_at)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setSelectedConversation(conv)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteConversation(e, conv.id)}
                                                className="p-1.5 text-foreground/40 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                                title="Delete Conversation"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
