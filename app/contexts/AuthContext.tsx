"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useStytchMember } from "@stytch/nextjs/b2b";

interface User {
    userId: string;
    email: string | null;
    organizationId: string | null;
    organizationName: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    organizationId: string | null;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    organizationId: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Check if Stytch is configured
    const publicToken = process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN;
    const isStytchConfigured = !!publicToken;

    // If Stytch is not configured, provide a default context
    if (!isStytchConfigured) {
        return (
            <AuthContext.Provider
                value={{
                    user: null,
                    isLoading: false,
                    isAuthenticated: false,
                    organizationId: null,
                }}
            >
                {children}
            </AuthContext.Provider>
        );
    }

    // If Stytch is configured, use the hooks (this component is inside StytchB2BProvider)
    return <AuthProviderInner>{children}</AuthProviderInner>;
}

// Inner component that uses Stytch B2B hooks
// This component MUST be rendered inside StytchB2BProvider
function AuthProviderInner({ children }: { children: React.ReactNode }) {
    // useStytchMember hook is safe to call here because this component
    // is only rendered when inside StytchB2BProvider (via StytchProvider)
    const { member, session, isInitialized } = useStytchMember();
    
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            setIsLoading(true);
            setHasCheckedAuth(false);
            return;
        }

        // Mark that we've checked auth state
        setHasCheckedAuth(true);

        // If we have a member, set user data
        // Member is the source of truth - if it exists, user is authenticated
        if (member) {
            // Extract organization ID from Stytch B2B member
            // B2B members belong to organizations
            const organizationId = 
                member.organization?.organization_id || 
                process.env.NEXT_PUBLIC_STYTCH_ORG_ID || 
                null;
            
            const organizationName = 
                member.organization?.organization_name || 
                null;

            setUser({
                userId: member.member_id,
                email: member.email_address || null,
                organizationId,
                organizationName,
            });
            setIsLoading(false);
        } else {
            // Clear user only if member is null/undefined
            setUser(null);
            setIsLoading(false);
        }
    }, [member, isInitialized]);

    // Use member as source of truth for authentication
    // Member existence means user is authenticated, regardless of session state
    // Session might be undefined during initial load but member will persist
    const isAuthenticated = !!member && hasCheckedAuth;

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading: isLoading || !hasCheckedAuth,
                isAuthenticated,
                organizationId: user?.organizationId || null,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
