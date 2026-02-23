import { fetchJson, fetchWithAuth } from "../utils/apiClient";
import { API_BASE_URL } from "../utils/config";


export interface ChatMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
    metadata?: Record<string, any>;
}

export interface ChatResponseCTA {
    type: string; // e.g. "BOOK_DEMO"
}

export interface ChatResponse {
    response: string;
    conversation_id: string;
    message_id: string;
    cta?: ChatResponseCTA;
}

export interface Conversation {
    id: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
    metadata?: Record<string, any>;
}

export const chatService = {
    async sendMessage(message: string, organizationId: string, conversationId?: string | null): Promise<ChatResponse> {
        return await fetchJson<ChatResponse>(`${API_BASE_URL}/chat`, {
            method: 'POST',
            body: JSON.stringify({
                message,
                organization_id: organizationId,
                conversation_id: conversationId,
            }),
        });
    },

    async sendPublicShowcaseMessage(
        showcaseId: string,
        message: string,
        conversationId?: string | null,
        viewerId?: string | null
    ): Promise<ChatResponse> {
        // Public chat endpoint (no auth); organization is resolved from showcaseId on the backend
        return await fetchJson<ChatResponse>(`${API_BASE_URL}/public/showcases/${showcaseId}/chat`, {
            method: 'POST',
            body: JSON.stringify({
                message,
                conversation_id: conversationId,
                viewer_id: viewerId ?? undefined,
            }),
        });
    },

    async getConversations(organizationId: string, limit: number = 50): Promise<Conversation[]> {
        return await fetchJson<Conversation[]>(`${API_BASE_URL}/conversations?organization_id=${organizationId}&limit=${limit}`);
    },

    async getConversationMessages(conversationId: string, organizationId: string): Promise<ChatMessage[]> {
        return await fetchJson<ChatMessage[]>(`${API_BASE_URL}/conversations/${conversationId}/messages?organization_id=${organizationId}`);
    },

    async deleteConversation(conversationId: string, organizationId: string): Promise<void> {
        await fetchWithAuth(`${API_BASE_URL}/conversations/${conversationId}?organization_id=${organizationId}`, {
            method: 'DELETE',
        });
    }
};
