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

const API_BASE_URL = "http://localhost:8000/api/v1/config/guidelines";

export const guidelinesService = {
    /**
     * Get guidelines for an organization.
     */
    getGuidelines: async (organizationId: string): Promise<GuidelinesConfig | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}?organization_id=${encodeURIComponent(organizationId)}`);

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`Failed to fetch guidelines: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Error fetching guidelines:", error);
            throw error;
        }
    },

    /**
     * Update or create guidelines for an organization.
     */
    updateGuidelines: async (data: UpdateGuidelinesData): Promise<GuidelinesConfig> => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to update guidelines: ${response.statusText}`);
            }

            return await response.json();
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
            const response = await fetch(`${API_BASE_URL}?organization_id=${encodeURIComponent(organizationId)}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Failed to delete guidelines: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error deleting guidelines:", error);
            throw error;
        }
    }
};
