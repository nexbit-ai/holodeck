"use client";

// Stytch authentication has been removed.
// This component is kept as a passthrough to avoid breaking the layout import.
export function StytchProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
