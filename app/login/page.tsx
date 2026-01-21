"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StytchB2B } from "@stytch/nextjs/b2b";
import { AuthFlowType, B2BProducts } from "@stytch/vanilla-js/b2b";
import { useStytchMember } from "@stytch/nextjs/b2b";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { member, isInitialized } = useStytchMember();
    const { isAuthenticated, isLoading } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Only redirect if we're on login page and authenticated
    useEffect(() => {
        // Clear any pending redirects
        if (redirectTimeoutRef.current) {
            clearTimeout(redirectTimeoutRef.current);
            redirectTimeoutRef.current = null;
        }

        // Wait for everything to initialize
        if (!isClient || isLoading || !isInitialized) {
            return;
        }

        // Only redirect if we're actually on the login page and authenticated
        if (pathname === "/login" && (member || isAuthenticated)) {
            // Add a small delay to prevent rapid redirects
            redirectTimeoutRef.current = setTimeout(() => {
                router.replace("/dashboard");
            }, 100);
        }

        // Cleanup timeout on unmount
        return () => {
            if (redirectTimeoutRef.current) {
                clearTimeout(redirectTimeoutRef.current);
            }
        };
    }, [member, isAuthenticated, isInitialized, isLoading, isClient, pathname, router]);

    // Show loading while checking auth state
    if (!isClient || isLoading || !isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Don't render login form if already authenticated
    if (isAuthenticated || member) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    // Stytch B2B Discovery flow configuration
    const config = {
        products: [B2BProducts.emailMagicLinks, B2BProducts.passwords],
        sessionOptions: { sessionDurationMinutes: 60 },
        authFlowType: AuthFlowType.Discovery,
        emailMagicLinksOptions: {
            discoveryRedirectURL: `${typeof window !== 'undefined' ? window.location.origin : ''}/authenticate`,
        },
        passwordOptions: {
            loginRedirectURL: `${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard`,
            resetPasswordRedirectURL: `${typeof window !== 'undefined' ? window.location.origin : ''}/authenticate`,
        },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md bg-surface border border-primary/10 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Welcome to Nexbit
                    </h1>
                    <p className="text-foreground/60">
                        Sign in to access your account
                    </p>
                </div>

                <StytchB2B config={config} />

                <div className="mt-6 text-center text-xs text-foreground/60">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </div>
            </div>
        </div>
    );
}
