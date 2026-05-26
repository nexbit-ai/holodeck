/**
 * API authentication headers utility.
 * Stytch has been removed — this now provides plain headers without JWT.
 */

export function getStytchSessionJWT(): string | null {
    return null;
}

/**
 * Get authorization headers (no auth token since login is removed)
 */
export function getAuthHeaders(): HeadersInit {
    return {
        'Content-Type': 'application/json',
    };
}
