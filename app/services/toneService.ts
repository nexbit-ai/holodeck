import { fetchJson } from "../utils/apiClient";
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
        try {
            return await fetchJson<ToneSettings | null>(`${API_BASE_URL}?organization_id=${organizationId}`);
        } catch (error: any) {
            if (error.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async updateTone(data: UpdateToneData): Promise<ToneSettings> {
        return await fetchJson<ToneSettings>(API_BASE_URL, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    }
};
