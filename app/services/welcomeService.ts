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

import { getAuthHeaders } from "../utils/apiAuth";

const API_BASE_URL = "http://localhost:8000/api/v1/config/welcome";

export const welcomeService = {
    /**
     * Get all welcome messages for an organization.
     */
    getWelcomeMessages: async (organizationId: string): Promise<WelcomeMessage[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}?organization_id=${encodeURIComponent(organizationId)}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch welcome messages: ${response.statusText}`);
            }

            return await response.json();
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
            const response = await fetch(`${API_BASE_URL}/default?organization_id=${encodeURIComponent(organizationId)}`, {
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error("No default welcome message found");
                }
                throw new Error(`Failed to fetch default welcome message: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching default welcome message:", error);
            throw error;
        }
    },

    /**
     * Create a new welcome message.
     */
    createWelcomeMessage: async (data: CreateWelcomeMessageData): Promise<WelcomeMessage> => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to create welcome message: ${response.statusText}`);
            }

            return await response.json();
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
            const response = await fetch(`${API_BASE_URL}/${id}?organization_id=${encodeURIComponent(organizationId)}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to update welcome message: ${response.statusText}`);
            }

            return await response.json();
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
            const response = await fetch(`${API_BASE_URL}/${id}?organization_id=${encodeURIComponent(organizationId)}`, {
                method: "DELETE",
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to delete welcome message: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error deleting welcome message:", error);
            throw error;
        }
    }
};
