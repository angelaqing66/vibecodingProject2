"use client";

import React, { useState, useRef, useEffect } from "react";

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(2);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Hardcoded initial notifications for mockup purposes per PRD
    const [notifications, setNotifications] = useState([
        { id: "1", text: "Alex Chen booked your Monday Morning slot", read: false },
        { id: "2", text: "Your session with Priya Sharma is tomorrow", read: false }
    ]);

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

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-500 hover:text-[#7C3AED] hover:bg-purple-50 rounded-full transition-colors relative"
                data-testid="notification-bell-btn"
                aria-label="Notifications"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                    />
                </svg>

                {unreadCount > 0 && (
                    <span
                        className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white"
                        data-testid="notification-badge"
                    >
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-3 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-4 flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                                data-testid="mark-all-read-btn"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto" data-testid="notifications-list">
                        {notifications.length === 0 || notifications.every(n => n.read) ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                No new notifications
                            </div>
                        ) : (
                            notifications.filter(n => !n.read).map(notif => (
                                <div key={notif.id} className="px-4 py-3 hover:bg-gray-50 border-t border-gray-50 transition-colors cursor-default">
                                    <p className="text-sm text-gray-800">{notif.text}</p>
                                    <span className="text-xs text-purple-600 font-medium mt-1 inline-block">Just now</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
