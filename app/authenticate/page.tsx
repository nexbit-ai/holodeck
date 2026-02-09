"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { StytchB2B } from "@stytch/nextjs/b2b";
import { AuthFlowType, B2BProducts } from "@stytch/vanilla-js/b2b";
import { useStytchMember } from "@stytch/nextjs/b2b";

export default function AuthenticatePage() {
    const publicToken = process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN;
    const isStytchConfigured = !!publicToken;

    if (!isStytchConfigured) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4 text-foreground">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">Auth Not Configured</h1>
                    <p className="opacity-60">Authentication is required for this page.</p>
                </div>
            </div>
        );
    }

    return <AuthenticatePageInner />;
}

function AuthenticatePageInner() {
    const { member, isInitialized } = useStytchMember();
    const router = useRouter();
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Only redirect once to prevent loops
        if (!isInitialized || hasRedirected.current) {
            return;
        }

        if (member) {
            hasRedirected.current = true;
            router.replace("/demos");
        }
    }, [member, isInitialized, router]);

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
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <StytchB2B config={config} />
            </div>
        </div>
    );
}
