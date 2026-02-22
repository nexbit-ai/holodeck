"use client";

import {
    Home,
    LayoutGrid,
    MessageCircle,
    Users,
    BarChart3,
    ChevronDown,
    Link as LinkIcon,
    Sparkles,
    LogOut
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useStytchMember, useStytchB2BClient } from "@stytch/nextjs/b2b";
import { useAuth } from "../contexts/AuthContext";

export function Sidebar() {
    const publicToken = process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN;
    const isStytchConfigured = !!publicToken;

    if (!isStytchConfigured) {
        return <SidebarContent />;
    }

    return <SidebarInner />;
}

function SidebarInner() {
    const router = useRouter();
    const stytch = useStytchB2BClient();

    const handleLogout = async () => {
        try {
            await stytch.session.revoke();
            localStorage.removeItem("nexbit_user_name");
        } catch (error) {
            console.error("Logout error:", error);
            localStorage.removeItem("nexbit_user_name"); // Ensure it's removed even on error
        }
        router.push("/login");
    };

    return <SidebarContent onLogout={handleLogout} />;
}

interface SidebarContentProps {
    onLogout?: () => void;
}

function SidebarContent({ onLogout }: SidebarContentProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);

    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout();
        } else {
            router.push("/login");
        }
    };

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: "Demos", href: "/demos", icon: LayoutGrid },
        { name: "Chats", href: "/chats", icon: MessageCircle },
        { name: "Agentic Showcase", href: "/showcase", icon: Sparkles },
    ];

    return (
        <aside className="w-64 bg-background border-r border-primary/10 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6">
                <Link href="/demos" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all shadow-sm">
                        <Image
                            src="/assets/logo.jpg"
                            alt="Nexbit Logo"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                    </div>
                    <h1 className="text-2xl font-bold text-primary tracking-tight">Nexbit</h1>
                </Link>
            </div>

            {/* Navigation container with premium feel */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive(item.href)
                            ? "bg-primary text-white shadow-md shadow-primary/20 translate-x-1"
                            : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                            }`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </Link>
                ))}

                <div>
                    <button
                        onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-foreground hover:bg-primary/5 rounded-lg transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Audience
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showAudienceDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    {showAudienceDropdown && (
                        <div className="ml-6 mt-1">
                            <Link
                                href="/audience"
                                className={`block px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/audience") ? "text-primary font-medium" : "text-foreground/70 hover:text-primary"
                                    }`}
                            >
                                View all
                            </Link>
                        </div>
                    )}
                </div>

                <Link
                    href="/insights"
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/insights")
                        ? "bg-primary text-white shadow-md shadow-primary/20 translate-x-1"
                        : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                        }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Insights
                </Link>

                <Link
                    href="/integrations"
                    className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isActive("/integrations")
                        ? "bg-primary text-white shadow-md shadow-primary/20 translate-x-1"
                        : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                        }`}
                >
                    <LinkIcon className="w-4 h-4" />
                    Integrations
                </Link>
            </nav>

            {/* Logout Option */}
            <div className="p-4">
                <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-3 px-3 py-3 text-red-600 bg-red-50/50 hover:bg-red-50 border border-red-100/50 rounded-2xl transition-all duration-200 group"
                >
                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                        <LogOut className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                        <p className="text-sm font-bold">Logout</p>
                        <p className="text-[10px] text-red-600/60 truncate uppercase tracking-wider">{user?.email}</p>
                    </div>
                </button>
            </div>
        </aside>
    );
}
