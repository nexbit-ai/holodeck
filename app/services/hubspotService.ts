import { fetchJson, fetchWithAuth } from "../utils/apiClient";
import { API_BASE_URL } from "../utils/config";


export interface HubSpotIntegration {
    id: string;
    organization_id: string;
    hubspot_account_id: string | null;
    hubspot_hub_id: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    metadata: Record<string, any>;
}

export interface AuthUrlResponse {
    authorization_url: string;
    organization_id: string;
}

export const hubspotService = {
    async getAuthUrl(organizationId: string, redirectUri: string): Promise<AuthUrlResponse> {
        return await fetchJson<AuthUrlResponse>(
            `${API_BASE_URL}/hubspot/oauth/authorize?organization_id=${organizationId}&redirect_uri=${encodeURIComponent(redirectUri)}`
        );
    },

    async exchangeCode(code: string, organizationId: string): Promise<HubSpotIntegration> {
        return await fetchJson<HubSpotIntegration>(`${API_BASE_URL}/hubspot/oauth/callback`, {
            method: "POST",
            body: JSON.stringify({
                code,
                organization_id: organizationId,
            }),
        });
    },

    async getIntegrationStatus(organizationId: string): Promise<HubSpotIntegration> {
        // Note: organization_id is not needed as query param - backend gets it from authenticated session
        // We handle 404 explicitly as it might mean just "not integrated" rather than an error context we want to throw generically if the logic expects it.
        // However, fetchJson throws on !ok.
        // If the original code handled 404 specifically to throw "Integration not found", we can keep a try-catch or let fetchJson throw and handle it in UI.
        // But looking at original code:
        /*
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Integration not found");
            }
            throw new Error(`Failed to get integration status: ${response.statusText}`);
        }
        */
        // fetchJson throws ApiError with status.
        // So we can arguably just use fetchJson and let the caller handle 404 if needed, or wrap it here.
        // Let's wrap it to preserve the specific error message "Integration not found" for 404.

        try {
            return await fetchJson<HubSpotIntegration>(`${API_BASE_URL}/hubspot/integration`);
        } catch (error: any) {
            if (error.status === 404) {
                throw new Error("Integration not found");
            }
            throw error;
        }
    },

    async disconnectIntegration(organizationId: string): Promise<void> {
        // Note: organization_id is not needed as query param - backend gets it from authenticated session
        await fetchWithAuth(`${API_BASE_URL}/hubspot/integration`, {
            method: "DELETE",
        });
    }
};
