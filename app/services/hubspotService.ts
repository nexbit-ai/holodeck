import { getAuthHeaders } from "../utils/apiAuth";
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
        const response = await fetch(
            `${API_BASE_URL}/hubspot/oauth/authorize?organization_id=${organizationId}&redirect_uri=${encodeURIComponent(redirectUri)}`,
            {
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get auth URL: ${response.statusText}`);
        }

        return response.json();
    },

    async exchangeCode(code: string, organizationId: string): Promise<HubSpotIntegration> {
        const response = await fetch(`${API_BASE_URL}/hubspot/oauth/callback`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                code,
                organization_id: organizationId,
            }),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `Failed to exchange code: ${response.statusText}`);
        }

        return response.json();
    },

    async getIntegrationStatus(organizationId: string): Promise<HubSpotIntegration> {
        // Note: organization_id is not needed as query param - backend gets it from authenticated session
        const response = await fetch(`${API_BASE_URL}/hubspot/integration`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Integration not found");
            }
            throw new Error(`Failed to get integration status: ${response.statusText}`);
        }

        return response.json();
    },

    async disconnectIntegration(organizationId: string): Promise<void> {
        // Note: organization_id is not needed as query param - backend gets it from authenticated session
        const response = await fetch(`${API_BASE_URL}/hubspot/integration`, {
            method: "DELETE",
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `Failed to disconnect integration: ${response.statusText}`);
        }
    }
};
