"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Login is no longer needed — redirect to demos immediately
export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/demos");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
    );
}
