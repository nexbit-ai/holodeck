export interface WelcomeMessage {
    id: string;
    organization_id: string;
    message: string;
    is_default: boolean;
    conditions: Record<string, any> | null; // Flexible object for conditions
    created_at: string;
    updated_at: string;
}

export interface CreateWelcomeMessageData {
    organization_id: string;
    message: string;
    is_default?: boolean;
    conditions?: Record<string, any>;
}

export interface UpdateWelcomeMessageData {
    message?: string;
    is_default?: boolean;
    conditions?: Record<string, any>;
}

import { fetchJson, fetchWithAuth } from "../utils/apiClient";
import { API_BASE_URL as BASE_URL } from "../utils/config";

const API_BASE_URL = `${BASE_URL}/config/welcome`;
const PUBLIC_WELCOME_BASE_URL = `${BASE_URL}/public/showcases`;


export const welcomeService = {
    /**
     * Get all welcome messages for an organization.
     */
    getWelcomeMessages: async (organizationId: string): Promise<WelcomeMessage[]> => {
        try {
            return await fetchJson<WelcomeMessage[]>(`${API_BASE_URL}?organization_id=${encodeURIComponent(organizationId)}`);
        } catch (error) {
            console.error("Error fetching welcome messages:", error);
            throw error;
        }
    },

    /**
     * Get the default welcome message for an organization.
     */
    getDefaultWelcomeMessage: async (organizationId: string): Promise<WelcomeMessage> => {
        try {
            return await fetchJson<WelcomeMessage>(`${API_BASE_URL}/default?organization_id=${encodeURIComponent(organizationId)}`);
        } catch (error: any) {
            if (error.status === 404) {
                throw new Error("No default welcome message found");
            }
            console.error("Error fetching default welcome message:", error);
            throw error;
        }
    },

    /**
     * Get the default welcome message for a public showcase (no auth required).
     * Resolves organization from showcaseId on the backend.
     */
    getPublicDefaultWelcomeForShowcase: async (showcaseId: string): Promise<WelcomeMessage> => {
        try {
            return await fetchJson<WelcomeMessage>(`${PUBLIC_WELCOME_BASE_URL}/${encodeURIComponent(showcaseId)}/welcome`);
        } catch (error: any) {
            if (error.status === 404) {
                throw new Error("No default welcome message found for showcase");
            }
            console.error("Error fetching public welcome message for showcase:", error);
            throw error;
        }
    },

    /**
     * Create a new welcome message.
     */
    createWelcomeMessage: async (data: CreateWelcomeMessageData): Promise<WelcomeMessage> => {
        try {
            return await fetchJson<WelcomeMessage>(API_BASE_URL, {
                method: "POST",
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error("Error creating welcome message:", error);
            throw error;
        }
    },

    /**
     * Update an existing welcome message.
     */
    updateWelcomeMessage: async (id: string, organizationId: string, data: UpdateWelcomeMessageData): Promise<WelcomeMessage> => {
        try {
            return await fetchJson<WelcomeMessage>(`${API_BASE_URL}/${id}?organization_id=${encodeURIComponent(organizationId)}`, {
                method: "PUT",
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error("Error updating welcome message:", error);
            throw error;
        }
    },

    /**
     * Delete a welcome message.
     */
    deleteWelcomeMessage: async (id: string, organizationId: string): Promise<void> => {
        try {
            await fetchWithAuth(`${API_BASE_URL}/${id}?organization_id=${encodeURIComponent(organizationId)}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error("Error deleting welcome message:", error);
            throw error;
        }
    }
};
