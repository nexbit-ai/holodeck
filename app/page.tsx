"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function Home() {
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
    if (isLoading || hasRedirectedRef.current) {
      return;
    }

    // Only redirect if we're on the root path
    if (pathname === "/") {
      hasRedirectedRef.current = true;
      // Add a small delay to prevent rapid redirects
      redirectTimeoutRef.current = setTimeout(() => {
        if (isAuthenticated) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      }, 100);
    }

    // Cleanup timeout on unmount
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [isAuthenticated, isLoading, pathname, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}
