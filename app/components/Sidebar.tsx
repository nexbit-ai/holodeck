"use client";

import {
    LayoutGrid,
    MessageCircle,
    Users,
    BarChart3,
    ChevronDown,
    Link as LinkIcon,
    Sparkles,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();
    const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);

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
        </aside>
    );
}
