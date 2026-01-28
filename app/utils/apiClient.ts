import { getAuthHeaders } from "./apiAuth";

export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}

interface FetchOptions extends RequestInit {
    headers?: HeadersInit;
}

/**
 * Enhanced fetch wrapper that handles authentication and common error cases
 * automatically redirects to login on 401 Unauthorized
 */
export async function fetchWithAuth(url: string, options: FetchOptions = {}): Promise<Response> {
    const headers = {
        ...getAuthHeaders(),
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Handle unauthorized access
            if (typeof window !== 'undefined') {
                // Redirect to login page
                // We use window.location.href to ensure a full page refresh and clear any client-side state issues
                window.location.href = '/login?reason=session_expired';
            }
            throw new ApiError('Session expired. Please log in again.', 401, null);
        }

        return response;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network errors or other issues
        throw new Error(error instanceof Error ? error.message : 'Network error occurred');
    }
}

/**
 * Helper to handle JSON responses and throw on errors
 */
export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
    const response = await fetchWithAuth(url, options);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.detail || errorData.message || `Request failed with status ${response.status}`,
            response.status,
            errorData
        );
    }

    // Handle 204 No Content
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}
