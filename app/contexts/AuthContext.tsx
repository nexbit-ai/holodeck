"use client";

import { createContext, useContext } from "react";

interface User {
    userId: string;
    email: string | null;
    name: string | null;
    organizationId: string | null;
    organizationName: string | null;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    organizationId: string | null;
}

// Default user that is always "logged in"
const defaultUser: User = {
    userId: "default-user",
    email: null,
    name: null,
    organizationId: null,
    organizationName: null,
};

const AuthContext = createContext<AuthContextType>({
    user: defaultUser,
    isLoading: false,
    isAuthenticated: true,
    organizationId: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <AuthContext.Provider
            value={{
                user: defaultUser,
                isLoading: false,
                isAuthenticated: true,
                organizationId: null,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
