"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();
    const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasRedirectedRef = useRef(false);

    useEffect(() => {
        // Clear any pending redirects
        if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
            redirectTimeoutRef.current = null;
        }

        // Wait for auth check to complete
        if (isLoading) {
            hasRedirectedRef.current = false;
            return;
        }

        // Only redirect if we're on a protected page and not authenticated
        // Don't redirect if we're already on login/authenticate pages
        // Only redirect once per auth state change
        if (
            !isAuthenticated && 
            pathname !== "/login" && 
            pathname !== "/authenticate" &&
            !hasRedirectedRef.current
        ) {
            hasRedirectedRef.current = true;
            // Add a small delay to prevent rapid redirects
            redirectTimeoutRef.current = setTimeout(() => {
                router.replace("/login");
            }, 100);
        } else if (isAuthenticated) {
            // Reset redirect flag when authenticated
            hasRedirectedRef.current = false;
        }

        // Cleanup timeout on unmount
        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, [isAuthenticated, isLoading, pathname, router]);

    // Show loading while checking auth state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Don't render content if not authenticated (redirect will happen)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
