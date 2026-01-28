import { fetchJson, fetchWithAuth } from "../utils/apiClient";
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
        return await fetchJson<Conversation[]>(
            `${API_BASE_URL}/conversations?organization_id=${organizationId}&limit=${limit}`
        );
    },

    async getMessages(conversationId: string, organizationId: string): Promise<ChatMessage[]> {
        try {
            return await fetchJson<ChatMessage[]>(
                `${API_BASE_URL}/conversations/${conversationId}/messages?organization_id=${organizationId}`
            );
        } catch (error: any) {
            if (error.status === 404) {
                return [];
            }
            throw error;
        }
    },

    async deleteConversation(conversationId: string, organizationId: string): Promise<void> {
        await fetchWithAuth(
            `${API_BASE_URL}/conversations/${conversationId}?organization_id=${organizationId}`,
            {
                method: "DELETE",
            }
        );
    }
};
