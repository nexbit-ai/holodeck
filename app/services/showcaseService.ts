import { getAuthHeaders } from "../utils/apiAuth";
import { API_BASE_URL } from "../utils/config";


export interface Showcase {
    id: string;
    title: string;
    organizationId: string;
    demoId: string | null;
    chatId: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    accentColor: string | null;
    showcaseShareLink: string | null;
    live: boolean;
    viewCount: number;
    clickCount: number;
    lastOpenedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateShowcaseData {
    title: string;
    organizationId: string;
    demoId?: string;
    chatId?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    live?: boolean;
}

export interface UpdateShowcaseData {
    title?: string;
    demoId?: string;
    chatId?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    live?: boolean;
}

// Helper function to transform backend response (snake_case) to frontend format (camelCase)
function transformShowcaseResponse(data: any): Showcase {
    return {
        id: data.showcase_id || data.id,
        title: data.title,
        organizationId: data.organization_id || data.organizationId,
        demoId: data.demo_id || data.demoId || null,
        chatId: data.chat_id || data.chatId || null,
        primaryColor: data.primary_color || data.primaryColor || null,
        secondaryColor: data.secondary_color || data.secondaryColor || null,
        accentColor: data.accent_color || data.accentColor || null,
        showcaseShareLink: data.showcase_share_link || data.showcaseShareLink || null,
        live: data.live ?? false,
        viewCount: data.viewCount || data.view_count || 0,
        clickCount: data.clickCount || data.click_count || 0,
        lastOpenedAt: data.lastOpenedAt || data.last_opened_at || null,
        createdAt: data.created_at || data.createdAt,
        updatedAt: data.updated_at || data.updatedAt
    };
}

export const showcaseService = {
    /**
     * Create a new showcase
     */
    async createShowcase(data: CreateShowcaseData): Promise<Showcase> {
        const response = await fetch(`${API_BASE_URL}/showcases`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to create showcase: ${response.statusText}`);
        }

        const responseData = await response.json();
        return transformShowcaseResponse(responseData);
    },

    /**
     * Get all showcases for an organization
     */
    async getShowcases(organizationId: string, limit: number = 100): Promise<Showcase[]> {
        const response = await fetch(
            `${API_BASE_URL}/showcases?organization_id=${encodeURIComponent(organizationId)}&limit=${limit}`,
            {
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to fetch showcases: ${response.statusText}`);
        }

        const responseData = await response.json();
        return Array.isArray(responseData)
            ? responseData.map(transformShowcaseResponse)
            : [];
    },

    /**
     * Get a single showcase by ID
     */
    async getShowcase(showcaseId: string, organizationId: string): Promise<Showcase> {
        const response = await fetch(
            `${API_BASE_URL}/showcases/${showcaseId}?organization_id=${encodeURIComponent(organizationId)}`,
            {
                headers: getAuthHeaders(),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 404) {
                throw new Error("Showcase not found");
            }
            throw new Error(errorData.detail || `Failed to fetch showcase: ${response.statusText}`);
        }

        const responseData = await response.json();
        return transformShowcaseResponse(responseData);
    },

    /**
     * Update an existing showcase
     */
    async updateShowcase(
        showcaseId: string,
        organizationId: string,
        data: UpdateShowcaseData
    ): Promise<Showcase> {
        const response = await fetch(
            `${API_BASE_URL}/showcases/${showcaseId}?organization_id=${encodeURIComponent(organizationId)}`,
            {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 404) {
                throw new Error("Showcase not found");
            }
            throw new Error(errorData.detail || `Failed to update showcase: ${response.statusText}`);
        }

        const responseData = await response.json();
        return transformShowcaseResponse(responseData);
    },

    /**
     * Track an analytics event for a showcase
     */
    async trackEvent(showcaseId: string, eventType: "view" | "click" | "interaction"): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/showcases/${showcaseId}/track`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ event_type: eventType }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Failed to track event: ${response.statusText}`);
        }
    }
};
