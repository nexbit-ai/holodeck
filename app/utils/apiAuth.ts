/**
 * Utility to get Stytch session JWT for API authentication
 * Uses Stytch client session.getSync() method as per Stytch documentation
 */

import { stytchClient } from "../components/StytchProvider";

export function getStytchSessionJWT(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    // Get the session JWT from Stytch client using getSync() method
    // This matches the pattern: stytchClient.session.getSync()?.session_jwt
    try {
        if (stytchClient?.session) {
            const sessionJWT = stytchClient.session.getSync()?.session_jwt;
            if (sessionJWT) {
                return sessionJWT;
            }
        }
    } catch (error) {
        // Fall back to cookie reading if client access fails
        console.debug('Could not access Stytch client session, falling back to cookies', error);
    }

    // Fallback: Read from cookies where Stytch SDK stores the session JWT
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'stytch_session_jwt') {
            return decodeURIComponent(value);
        }
    }

    return null;
}

/**
 * Get authorization header with Stytch session JWT
 */
export function getAuthHeaders(): HeadersInit {
    const sessionJWT = getStytchSessionJWT();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (sessionJWT) {
        headers['Authorization'] = `Bearer ${sessionJWT}`;
    }

    return headers;
}
