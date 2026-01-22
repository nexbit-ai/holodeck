import { getAuthHeaders } from "../utils/apiAuth";
import { API_BASE_URL } from "../utils/config";


export interface ChatMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
    metadata?: Record<string, any>;
}

export interface ChatResponse {
    response: string;
    conversation_id: string;
    message_id: string;
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
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                message,
                organization_id: organizationId,
                conversation_id: conversationId,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to send message');
        }

        return response.json();
    },

    async getConversations(organizationId: string, limit: number = 50): Promise<Conversation[]> {
        const response = await fetch(`${API_BASE_URL}/conversations?organization_id=${organizationId}&limit=${limit}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to fetch conversations');
        }

        return response.json();
    },

    async getConversationMessages(conversationId: string, organizationId: string): Promise<ChatMessage[]> {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages?organization_id=${organizationId}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to fetch messages');
        }

        return response.json();
    },

    async deleteConversation(conversationId: string, organizationId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}?organization_id=${organizationId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || 'Failed to delete conversation');
        }
    }
};
