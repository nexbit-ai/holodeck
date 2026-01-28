export interface GuidelinesConfig {
    id: string;
    organization_id: string;
    guidelines: string;
    version: string;
    created_at: string;
    updated_at: string;
}

export interface UpdateGuidelinesData {
    organization_id: string;
    guidelines: string;
}

import { fetchJson, fetchWithAuth } from "../utils/apiClient";
import { API_BASE_URL as BASE_URL } from "../utils/config";

const API_BASE_URL = `${BASE_URL}/config/guidelines`;


export const guidelinesService = {
    /**
     * Get guidelines for an organization.
     */
    getGuidelines: async (organizationId: string): Promise<GuidelinesConfig | null> => {
        try {
            return await fetchJson<GuidelinesConfig>(`${API_BASE_URL}?organization_id=${encodeURIComponent(organizationId)}`);
        } catch (error: any) {
            if (error.status === 404) {
                return null;
            }
            console.error("Error fetching guidelines:", error);
            throw error;
        }
    },

    /**
     * Update or create guidelines for an organization.
     */
    updateGuidelines: async (data: UpdateGuidelinesData): Promise<GuidelinesConfig> => {
        try {
            return await fetchJson<GuidelinesConfig>(API_BASE_URL, {
                method: "PUT",
                body: JSON.stringify(data),
            });
        } catch (error) {
            console.error("Error updating guidelines:", error);
            throw error;
        }
    },

    /**
     * Delete guidelines for an organization.
     */
    deleteGuidelines: async (organizationId: string): Promise<void> => {
        try {
            await fetchWithAuth(`${API_BASE_URL}?organization_id=${encodeURIComponent(organizationId)}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error("Error deleting guidelines:", error);
            throw error;
        }
    }
};
