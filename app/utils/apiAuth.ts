/**
 * Utility to get Stytch session JWT for API authentication
 * Uses Stytch client session.getTokens() method as per Stytch documentation
 */

import { stytchClient } from "../components/StytchProvider";

export function getStytchSessionJWT(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    // Get the session JWT from Stytch client using getTokens() method
    // This matches the pattern: stytchClient.session.getTokens()?.session_jwt
    try {
        if (stytchClient?.session) {
            // Correct way to get tokens in Stytch B2B SDK:
            // getSync() returns MemberSession which doesn't have the JWT
            // getTokens() returns the tokens if they are available (non-opaque)
            const tokens = stytchClient.session.getTokens();
            if (tokens && tokens.session_jwt) {
                return tokens.session_jwt;
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
