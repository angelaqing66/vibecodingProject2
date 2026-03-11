"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import NotificationBell from "./NotificationBell";

interface NavbarProps {
    userName: string;
    role: string | undefined;
}

export default function Navbar({ userName, role }: NavbarProps) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);



    const navLinks = [
        { name: "Search", href: "/search" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Profile", href: "/profile" },
    ];

    if (role === "ADMIN") {
        navLinks.push({ name: "Admin", href: "/admin" });
    }

    const isActive = (href: string) => pathname.startsWith(href);

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

                {/* Left: Logo */}
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="flex items-center gap-2" data-testid="nav-logo">
                        <span className="text-2xl">🤝</span>
                        <span className="text-xl font-extrabold text-[#0B1527] tracking-tight">
                            MockMate
                        </span>
                    </Link>
                </div>

                {/* Center: Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            data-testid={`nav-link-${link.name.toLowerCase()}`}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive(link.href)
                                ? "bg-[#EDE9FE] text-[#7C3AED]"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                        <NotificationBell />
                    </div>

                    <div className="hidden md:block">
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-gray-600 hover:text-red-600 font-semibold text-sm transition-colors py-2 px-3 rounded-lg hover:bg-red-50"
                        >
                            Sign Out
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden items-center">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-500 hover:text-[#7C3AED] p-2"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-3 py-2 rounded-md justify-between items-center text-base font-medium ${isActive(link.href)
                                    ? "bg-[#EDE9FE] text-[#7C3AED]"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-100">
                        <div className="flex items-center px-5 gap-3 justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-base font-medium leading-none text-gray-800">{userName}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <NotificationBell />
                                <button
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                    className="text-sm font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
