"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StytchB2B } from "@stytch/nextjs/b2b";
import { AuthFlowType, B2BProducts } from "@stytch/vanilla-js/b2b";
import { useStytchMember } from "@stytch/nextjs/b2b";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const publicToken = process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN;
    const isStytchConfigured = !!publicToken;

    if (!isStytchConfigured) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <div className="w-full max-w-md bg-surface border border-yellow-500/30 rounded-2xl shadow-xl p-8 text-center text-foreground">
                    <h1 className="text-2xl font-bold mb-4">Auth Not Configured</h1>
                    <p className="mb-6 opacity-70">
                        Please set <code>NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN</code> in your environment variables to enable authentication.
                    </p>
                    <div className="p-4 bg-yellow-500/10 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                        Authentication is currently disabled for local development.
                    </div>
                </div>
            </div>
        );
    }

    return <LoginPageInner />;
}

function LoginPageInner() {
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
                router.replace("/demos");
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
        products: [B2BProducts.passwords],
        sessionOptions: { sessionDurationMinutes: 60 },
        authFlowType: AuthFlowType.Discovery,
        emailMagicLinksOptions: {
            discoveryRedirectURL: `${typeof window !== 'undefined' ? window.location.origin : ''}/authenticate`,
        },
        passwordOptions: {
            loginRedirectURL: `${typeof window !== 'undefined' ? window.location.origin : ''}/demos`,
            resetPasswordRedirectURL: `${typeof window !== 'undefined' ? window.location.origin : ''}/authenticate`,
        },
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />

            <div className="w-full max-w-md premium-surface rounded-[2.5rem] shadow-2xl p-10 relative z-10 border border-primary/5">
                <div className="text-center mb-10">
                    {/* <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="text-4xl font-black text-primary tracking-tighter italic"></span>
                    </div> */}
                    <h1 className="text-3xl font-bold text-foreground mb-3 tracking-tight">
                        Welcome to <span className="text-primary tracking-tighter">Nexbit</span>
                    </h1>
                    <p className="text-foreground/40 font-medium">
                        Enter your credentials to continue
                    </p>
                </div>

                <div className="stytch-auth-container">
                    <StytchB2B config={config} />
                </div>

                <div className="mt-6 text-center text-xs text-foreground/60">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </div>
            </div>
        </div>
    );
}
