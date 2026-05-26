"use client";

// Authentication has been removed — all routes are accessible.
// This component is kept as a passthrough so existing usage doesn't break.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
