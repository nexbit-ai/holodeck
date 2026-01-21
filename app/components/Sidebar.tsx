"use client";

import {
    Home,
    LayoutGrid,
    MessageCircle,
    Users,
    BarChart3,
    ChevronDown,
    Link as LinkIcon,
    User,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();
    const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
    const [showUserProfileDropdown, setShowUserProfileDropdown] = useState(false);

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: "Home", href: "/dashboard", icon: Home },
        { name: "Demos", href: "/demos", icon: LayoutGrid },
        { name: "Chats", href: "/chats", icon: MessageCircle },
        { name: "Agentic Showcase", href: "/showcase", icon: Sparkles },
    ];

    return (
        <aside className="w-64 bg-surface border-r border-primary/10 flex flex-col h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 border-b border-primary/10">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Image
                        src="/assets/logo.jpg"
                        alt="Nexbit Logo"
                        width={32}
                        height={32}
                        className="rounded-lg"
                    />
                    <h1 className="text-2xl font-bold text-primary">Nexbit</h1>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isActive(item.href)
                                ? "bg-primary text-white"
                                : "text-foreground hover:bg-primary/5"
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
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/insights")
                            ? "bg-primary text-white"
                            : "text-foreground hover:bg-primary/5"
                        }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Insights
                </Link>

                <Link
                    href="/integrations"
                    className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${isActive("/integrations")
                            ? "bg-primary text-white"
                            : "text-foreground hover:bg-primary/5"
                        }`}
                >
                    <LinkIcon className="w-4 h-4" />
                    Integrations
                </Link>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-primary/10 relative">
                <button
                    onClick={() => setShowUserProfileDropdown(!showUserProfileDropdown)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-primary/5 rounded-lg cursor-pointer transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-foreground">Krishna</p>
                        <p className="text-xs text-foreground/60">Free Plan</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-foreground/60 transition-transform ${showUserProfileDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showUserProfileDropdown && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowUserProfileDropdown(false)}
                        />
                        {/* Popup */}
                        <div className="absolute bottom-full left-4 mb-2 w-56 bg-surface border border-primary/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="py-2">
                                <Link
                                    href="#"
                                    onClick={() => setShowUserProfileDropdown(false)}
                                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 transition-colors"
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="#"
                                    onClick={() => setShowUserProfileDropdown(false)}
                                    className="block px-4 py-2.5 text-sm text-foreground hover:bg-primary/5 transition-colors"
                                >
                                    Setting
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}
