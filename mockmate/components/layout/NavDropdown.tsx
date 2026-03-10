"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface NavDropdownProps {
    initials: string;
}

export default function NavDropdown({ initials }: NavDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.addEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                data-testid="nav-avatar-btn"
                className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-[#7C3AED] font-bold text-sm tracking-wide shadow-sm hover:ring-2 hover:ring-[#7C3AED] hover:ring-offset-1 transition-all"
            >
                {initials}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                    data-testid="nav-dropdown-menu"
                >
                    <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-[#7C3AED] font-medium transition-colors"
                    >
                        My Profile
                    </Link>
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            signOut({ callbackUrl: "/login" });
                        }}
                        data-testid="nav-signout-btn"
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}
