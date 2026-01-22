import { getAuthHeaders } from "../utils/apiAuth";
import { API_BASE_URL as BASE_URL } from "../utils/config";

const API_BASE_URL = `${BASE_URL}/config/tone`;


export interface ToneSettings {
    id: string;
    organization_id: string;
    tone: string;
    description: string | null;
    version: string;
    created_at: string;
    updated_at: string;
}

export interface UpdateToneData {
    organization_id: string;
    tone: string;
    description?: string;
}

export const toneService = {
    async getTone(organizationId: string): Promise<ToneSettings | null> {
        const response = await fetch(`${API_BASE_URL}?organization_id=${organizationId}`, {
            headers: getAuthHeaders(),
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch tone settings: ${response.statusText}`);
        }

        return response.json();
    },

    async updateTone(data: UpdateToneData): Promise<ToneSettings> {
        const response = await fetch(API_BASE_URL, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to update tone settings: ${response.statusText}`);
        }

        return response.json();
    }
};
