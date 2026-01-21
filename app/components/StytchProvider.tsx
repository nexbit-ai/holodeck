"use client";

import { StytchB2BProvider } from "@stytch/nextjs/b2b";
import { createStytchB2BUIClient } from "@stytch/nextjs/b2b/ui";

// Optional object for configuring SDK cookie behavior
const stytchOptions = {
    cookieOptions: {
        opaqueTokenCookieName: "stytch_session",
        jwtCookieName: "stytch_session_jwt",
        path: "",
        availableToSubdomains: false,
        domain: "",
    }
};

// Create the Stytch client synchronously
// This matches the documentation pattern: https://stytch.com/docs/b2b/quickstarts/nextjs
const publicToken = process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN;
const stytchClient = publicToken 
    ? createStytchB2BUIClient(publicToken, stytchOptions)
    : null;

export function StytchProvider({ children }: { children: React.ReactNode }) {
    // If Stytch is not configured, render children without provider
    // This allows the app to work without auth during development
    if (!stytchClient) {
        if (typeof window !== 'undefined') {
            console.warn("NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN is not set. Please configure Stytch authentication.");
        }
        return <>{children}</>;
    }

    // Always wrap with StytchB2BProvider when client exists
    // This ensures all child components can use Stytch hooks
    return (
        <StytchB2BProvider stytch={stytchClient}>
            {children}
        </StytchB2BProvider>
    );
}
