'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDashboardData, acceptSession, declineSession, cancelSession } from '@/app/actions/dashboard';

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read the tab from URL query params, default to 'upcoming'
    const initialTab = searchParams.get('tab') as 'upcoming' | 'pending' | 'past' || 'upcoming';

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    type SessionWithUsers = import('@prisma/client').MockSession & {
        host: Pick<import('@prisma/client').User, 'id' | 'name' | 'experienceLevel' | 'interviewTypes' | 'zoomLink'> | null;
        guest: Pick<import('@prisma/client').User, 'id' | 'name' | 'experienceLevel' | 'interviewTypes' | 'zoomLink'> | null;
        message?: string | null;
    };

    const [dashboardData, setDashboardData] = useState<{
        pendingReceived: SessionWithUsers[];
        pendingSent: SessionWithUsers[];
        upcoming: SessionWithUsers[];
        past: SessionWithUsers[];
    }>({
        pendingReceived: [],
        pendingSent: [],
        upcoming: [],
        past: []
    });

    const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'past'>(initialTab);

    // If query param changes, update the active tab
    useEffect(() => {
        const tab = searchParams.get('tab') as 'upcoming' | 'pending' | 'past';
        if (tab && ['upcoming', 'pending', 'past'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    const fetchDashboard = async (showLoadingObj = false) => {
        if (showLoadingObj) setIsLoading(true);
        const result = await getDashboardData();
        if (result.success && result.data) {
            setDashboardData(result.data);
            setError(null);
        } else {
            setError(result.error || 'Failed to load dashboard data');
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const loadInit = async () => {
            const result = await getDashboardData();
            if (result.success && result.data) {
                setDashboardData(result.data);
                setError(null);
            } else {
                setError(result.error || 'Failed to load dashboard data');
            }
            setIsLoading(false);
        };
        loadInit();
    }, []);

    const showMessage = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleAccept = async (id: string) => {
        const res = await acceptSession(id);
        if (res.success) {
            showMessage('Session accepted successfully');
            fetchDashboard();
            window.dispatchEvent(new Event('mockmate-session-updated'));
        } else {
            setError(res.error || 'Failed to accept session');
        }
    };

    const handleDecline = async (id: string) => {
        const res = await declineSession(id);
        if (res.success) {
            showMessage('Session declined');
            fetchDashboard();
            window.dispatchEvent(new Event('mockmate-session-updated'));
        } else {
            setError(res.error || 'Failed to decline session');
        }
    };

    const handleCancel = async (id: string) => {
        const res = await cancelSession(id);
        if (res.success) {
            showMessage('Session cancelled');
            fetchDashboard();
            window.dispatchEvent(new Event('mockmate-session-updated'));
        } else {
            setError(res.error || 'Failed to cancel session');
        }
    };

    const formatDateTime = (dateVal: Date | string) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short', month: 'short', day: 'numeric',
            hour: 'numeric', minute: '2-digit'
        }).format(new Date(dateVal));
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F3F4FE] flex flex-col items-center justify-center">
                <p className="text-xl font-medium text-gray-500">Loading Dashboard...</p>
            </div>
        );
    }

    const { pendingReceived, pendingSent, upcoming, past } = dashboardData;
    const pendingCount = pendingReceived.length + pendingSent.length;

    return (
        <div className="min-h-screen bg-[#F3F4FE] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#0B1527] mb-2">Your Dashboard</h1>
                        <p className="text-gray-500">Manage your mock interviews and requests</p>
                    </div>
                    <button
                        onClick={() => router.push('/search')}
                        className="mt-6 sm:mt-0 bg-[#8A2BE2] hover:bg-[#7924c7] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
                    >
                        Find Partners
                    </button>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-200 font-medium">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 text-sm text-green-700 bg-green-50 rounded-xl border border-green-200 font-medium">
                        {successMessage}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('upcoming')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'upcoming'
                            ? 'bg-[#8A2BE2] text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Upcoming Sessions <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{upcoming.length}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'pending'
                            ? 'bg-[#8A2BE2] text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Pending Requests <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{pendingCount}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'past'
                            ? 'bg-[#8A2BE2] text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Past Interviews <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">{past.length}</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {/* UPCOMING */}
                    {activeTab === 'upcoming' && (
                        <div className="space-y-4">
                            {upcoming.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
                                    No upcoming sessions. Time to find a partner!
                                </div>
                            ) : (
                                upcoming.map(session => (
                                    <div key={session.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">CONFIRMED</span>
                                                <span className="text-gray-900 font-bold">{formatDateTime(session.scheduledTime)}</span>
                                            </div>
                                            <p className="text-gray-600 mb-1">
                                                <span className="font-semibold text-gray-800">Partner: </span>
                                                {session.host?.name} & {session.guest?.name}
                                            </p>
                                            {session.host?.zoomLink && (
                                                <p className="text-sm">
                                                    <span className="font-semibold text-gray-800">Meeting Link: </span>
                                                    <a href={session.host.zoomLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{session.host.zoomLink}</a>
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleCancel(session.id)}
                                                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl text-sm transition-colors"
                                            >
                                                Cancel Session
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* PENDING */}
                    {activeTab === 'pending' && (
                        <div className="space-y-8">
                            {pendingCount === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
                                    No pending requests right now.
                                </div>
                            ) : (
                                <>
                                    {/* Received Requests */}
                                    {pendingReceived.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Action Required (Received)</h3>
                                            <div className="space-y-4">
                                                {pendingReceived.map(session => (
                                                    <div key={session.id} className="bg-white rounded-2xl p-6 border-l-4 border-[#8A2BE2] shadow-sm flex flex-col md:flex-row justify-between gap-4">
                                                        <div>
                                                            <p className="text-[#8A2BE2] font-semibold text-sm mb-1">{formatDateTime(session.scheduledTime)}</p>
                                                            <p className="text-gray-900 font-bold text-lg">{session.guest?.name}</p>
                                                            <p className="text-gray-500 text-sm mb-3">{session.guest?.experienceLevel} • {session.guest?.interviewTypes?.join(', ')}</p>
                                                            {session.message && (
                                                                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mt-2 max-w-lg">
                                                                    <p className="text-sm text-purple-900 italic">&quot;{session.message}&quot;</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => handleDecline(session.id)}
                                                                className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl text-sm transition-colors"
                                                            >
                                                                Decline
                                                            </button>
                                                            <button
                                                                onClick={() => handleAccept(session.id)}
                                                                className="px-5 py-2.5 bg-[#10B981] hover:bg-[#0EA5E9] text-white font-bold rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
                                                            >
                                                                Accept
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sent Requests */}
                                    {pendingSent.length > 0 && (
                                        <div className="pt-4">
                                            <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Awaiting Response (Sent)</h3>
                                            <div className="space-y-4">
                                                {pendingSent.map(session => (
                                                    <div key={session.id} className="bg-white/60 rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 opacity-80">
                                                        <div>
                                                            <p className="text-yellow-600 font-semibold text-sm mb-1">Awaiting confirmation for {formatDateTime(session.scheduledTime)}</p>
                                                            <p className="text-gray-900 font-bold text-lg">{session.host?.name}</p>
                                                            <p className="text-gray-500 text-sm mb-3">{session.host?.experienceLevel} • {session.host?.interviewTypes?.join(', ')}</p>
                                                            {session.message && (
                                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2 max-w-lg">
                                                                    <p className="text-sm text-gray-700 italic">&quot;{session.message}&quot;</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <button
                                                                onClick={() => handleCancel(session.id)}
                                                                className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold rounded-xl text-sm transition-colors"
                                                            >
                                                                Withdraw Request
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* PAST */}
                    {activeTab === 'past' && (
                        <div className="space-y-4">
                            {past.length === 0 ? (
                                <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm">
                                    No past interviews to show.
                                </div>
                            ) : (
                                past.map(session => (
                                    <div key={session.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-between gap-2 opacity-70">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">{session.status}</span>
                                            <span className="text-gray-600 font-medium text-sm">{formatDateTime(session.scheduledTime)}</span>
                                        </div>
                                        <p className="text-gray-800">
                                            <span className="font-semibold text-gray-900">Partner: </span>
                                            {session.host?.name} & {session.guest?.name}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F3F4FE] flex flex-col items-center justify-center">
                <p className="text-xl font-medium text-gray-500">Loading Dashboard...</p>
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
