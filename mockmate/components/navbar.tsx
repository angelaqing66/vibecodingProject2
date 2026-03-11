'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Calendar, User, ShieldAlert } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import NotificationBell from './layout/NotificationBell';

export function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

    // Don't show navbar on login/signup pages
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
        return null;
    }

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#8A2BE2] rounded-lg flex items-center justify-center">
                            <div className="w-4 h-4 bg-white rounded-sm transform rotate-45" />
                        </div>
                        <span className="font-extrabold text-xl text-gray-900 tracking-tight">MockMate</span>
                    </div>

                    {/* Center Navigation Links */}
                    <div className="hidden sm:flex items-center justify-center flex-1 px-8 gap-8">
                        <Link
                            href="/search"
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${pathname === '/search'
                                ? 'bg-purple-50 text-[#8A2BE2]'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </Link>

                        <Link
                            href="/dashboard"
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${pathname === '/dashboard'
                                ? 'bg-purple-50 text-[#8A2BE2]'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <Calendar className="w-4 h-4" />
                            <span>Dashboard</span>
                        </Link>

                        <Link
                            href="/profile"
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${pathname === '/profile' || pathname === '/profile-setup'
                                ? 'bg-purple-50 text-[#8A2BE2]'
                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                        </Link>

                        {isAdmin && (
                            <Link
                                href="/admin"
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${pathname === '/admin'
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`}
                            >
                                <ShieldAlert className="w-4 h-4" />
                                <span>Admin</span>
                            </Link>
                        )}
                    </div>

                    {/* Right side - User stuff */}
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                            title="Sign out"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation (Bottom Bar) */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around p-3 pb-safe z-50">
                <Link href="/search" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/search' ? 'text-[#8A2BE2]' : 'text-gray-500'}`}>
                    <Search className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Search</span>
                </Link>
                <Link href="/dashboard" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/dashboard' ? 'text-[#8A2BE2]' : 'text-gray-500'}`}>
                    <Calendar className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Dashboard</span>
                </Link>
                <Link href="/profile" className={`flex flex-col items-center gap-1 p-2 ${pathname === '/profile' ? 'text-[#8A2BE2]' : 'text-gray-500'}`}>
                    <User className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </div>
        </nav>
    );
}
