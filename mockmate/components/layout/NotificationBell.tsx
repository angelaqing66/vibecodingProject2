'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPendingRequestCount } from '@/app/actions/dashboard';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const res = await getPendingRequestCount();
      if (res.success && res.count !== undefined) {
        setUnreadCount(res.count);
      }
    };
    fetchCount();

    // Optional: Poll every 30 seconds for new requests (simulating real-time for now)
    const interval = setInterval(fetchCount, 30000);

    const handleUpdate = () => fetchCount();
    window.addEventListener('mockmate-session-updated', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mockmate-session-updated', handleUpdate);
    };
  }, []);

  return (
    <div className="relative">
      <Link
        href="/dashboard?tab=pending"
        className="p-2 text-gray-500 hover:text-[#7C3AED] hover:bg-purple-50 rounded-full transition-colors relative block"
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
            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"
            data-testid="notification-badge"
          />
        )}
      </Link>
    </div>
  );
}
