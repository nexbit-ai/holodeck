import { getAuthHeaders } from "../utils/apiAuth";
import { API_BASE_URL } from "../utils/config";


export interface Conversation {
    id: string;
    organization_id: string;
    created_at: string;
    updated_at: string;
    metadata: Record<string, any>;
}

export interface ChatMessage {
    id: string;
    conversation_id: string;
    role: "user" | "assistant" | "system";
    content: string;
    created_at: string;
    metadata: Record<string, any>;
}

export const chatLogsService = {
    async getConversations(organizationId: string, limit: number = 50): Promise<Conversation[]> {
        const response = await fetch(`${API_BASE_URL}/conversations?organization_id=${organizationId}&limit=${limit}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch conversations: ${response.statusText}`);
        }

        return response.json();
    },

    async getMessages(conversationId: string, organizationId: string): Promise<ChatMessage[]> {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages?organization_id=${organizationId}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return [];
            }
            throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }

        return response.json();
    },

    async deleteConversation(conversationId: string, organizationId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}?organization_id=${organizationId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to delete conversation: ${response.statusText}`);
        }
    }
};
