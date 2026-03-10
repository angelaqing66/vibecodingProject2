'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  experienceLevel: string | null;
};

type AdminSession = {
  id: string;
  status: string;
  scheduledTime: string | null;
  requester?: { id: string; name: string; level: string };
  partner?: { id: string; name: string; level: string };
};

type AdminStats = {
  totalUsers: number;
  totalSessions: number;
  weekSessions: number;
};

type Tab = 'Overview' | 'Users' | 'Sessions';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalSessions: 0, weekSessions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, sessionsRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/sessions'),
        fetch('/api/admin/stats'),
      ]);

      if (usersRes.status === 401 || usersRes.status === 403 || sessionsRes.status === 401 || sessionsRes.status === 403) {
        router.push('/dashboard');
        return;
      }

      const [ud, sd, statsD] = await Promise.all([
        usersRes.json(),
        sessionsRes.json(),
        statsRes.json(),
      ]);

      if (ud.success) setUsers(ud.data || []);
      if (sd.success) setSessions(sd.data || []);
      if (statsD.success) setStats(statsD.data || { totalUsers: 0, totalSessions: 0, weekSessions: 0 });
    } catch {
      setError('Failed to load admin data');
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      alert(data.error || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.name?.toLowerCase() ?? '').includes(searchQuery.toLowerCase()) ||
      (u.email?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
  );

  const getLevelColor = (level: string | null) => {
    switch (level) {
      case 'Intern': return 'bg-blue-100 text-blue-800';
      case 'New Grad': return 'bg-green-100 text-green-800';
      case 'Experienced': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Completed</span>;
      case 'UPCOMING':
      case 'SCHEDULED': return <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Upcoming</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">Cancelled</span>;
      default: return <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">{status}</span>;
    }
  };

  const formatDateTime = (iso: string | null) => {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-8 text-center">
          <p className="font-semibold text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          Admin Panel
          <span className="bg-red-600 text-white text-sm font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide" data-testid="admin-badge">
            Admin
          </span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {(['Overview', 'Users', 'Sessions'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            data-testid={`tab-${tab}`}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'Overview' && (
        <section className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-[#7C3AED] mb-2">{stats.totalUsers}</span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Users</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-blue-600 mb-2">{stats.weekSessions}</span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Sessions This Week</span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-green-600 mb-2">{stats.totalSessions}</span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Sessions</span>
            </div>
          </div>
        </section>
      )}

      {/* USERS */}
      {activeTab === 'Users' && (
        <section className="space-y-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Filter users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="user-search"
              className="w-full pl-4 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7C3AED] focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" data-testid="users-table">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Level</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 italic">
                        {searchQuery ? `No users matching "${searchQuery}"` : 'No users found'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr key={user.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}`}>
                        <td className="p-4 font-bold text-gray-900">{user.name || '—'}</td>
                        <td className="p-4 text-gray-600 text-sm">{user.email || '—'}</td>
                        <td className="p-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getLevelColor(user.experienceLevel)}`}>
                            {user.experienceLevel || 'No level'}
                          </span>
                        </td>
                        <td className="p-4 flex justify-end gap-3">
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-sm font-semibold px-3 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            data-testid={`delete-btn-${user.id}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* SESSIONS */}
      {activeTab === 'Sessions' && (
        <section>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" data-testid="sessions-table">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4">Participants</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Scheduled</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500 italic">No sessions found</td>
                    </tr>
                  ) : (
                    sessions.map((session, idx) => (
                      <tr key={session.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}`}>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-900">
                              <span className="font-semibold text-gray-500 text-xs mr-1">R:</span>
                              {session.requester?.name || '—'}
                            </span>
                            <span className="text-sm text-gray-900">
                              <span className="font-semibold text-gray-500 text-xs mr-1">P:</span>
                              {session.partner?.name || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-purple-100 text-[#7C3AED] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                            Mock Interview
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-700">{formatDateTime(session.scheduledTime)}</td>
                        <td className="p-4">{getStatusBadge(session.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
