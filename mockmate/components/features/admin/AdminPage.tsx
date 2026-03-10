'use client';

import React, { useState, useMemo } from 'react';
import { User, Session } from '@/types';

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alex Chen',
    email: 'alex@mit.edu',
    level: 'NEW_GRAD',
    interviewTypes: ['CODING'],
    companies: ['Google'],
    bio: '',
    meetingLink: null,
    role: 'STUDENT',
    availability: [],
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya@stanford.edu',
    level: 'INTERN',
    interviewTypes: ['BEHAVIORAL'],
    companies: ['Amazon'],
    bio: '',
    meetingLink: null,
    role: 'STUDENT',
    availability: [],
    createdAt: '2025-01-22',
  },
  {
    id: '3',
    name: 'James Park',
    email: 'james@berkeley.edu',
    level: 'EXPERIENCED',
    interviewTypes: ['SYSTEM_DESIGN'],
    companies: ['Meta'],
    bio: '',
    meetingLink: null,
    role: 'STUDENT',
    availability: [],
    createdAt: '2024-12-10',
  },
  {
    id: '4',
    name: 'Sofia Martinez',
    email: 'sofia@ucla.edu',
    level: 'NEW_GRAD',
    interviewTypes: ['BEHAVIORAL', 'CODING'],
    companies: ['Google'],
    bio: '',
    meetingLink: null,
    role: 'STUDENT',
    availability: [],
    createdAt: '2025-02-01',
  },
  {
    id: '5',
    name: 'Kevin Wu',
    email: 'kevin@cmu.edu',
    level: 'INTERN',
    interviewTypes: ['CODING'],
    companies: ['Amazon'],
    bio: '',
    meetingLink: null,
    role: 'STUDENT',
    availability: [],
    createdAt: '2025-02-08',
  },
];

const mockStats = {
  totalUsers: 248,
  sessionsThisWeek: 42,
  showUpRate: 89,
};

const mockSessions: Session[] = [
  {
    id: 's1',
    interviewType: 'CODING',
    status: 'COMPLETED',
    meetingLink: null,
    notes: null,
    timeSlot: { id: 't1', dayOfWeek: 0, period: 'MORNING', isBooked: true },
    requester: { id: '1', name: 'Alex Chen', level: 'NEW_GRAD' },
    partner: { id: '2', name: 'Priya Sharma', level: 'INTERN' },
    createdAt: '2025-02-20',
  },
  {
    id: 's2',
    interviewType: 'SYSTEM_DESIGN',
    status: 'UPCOMING',
    meetingLink: null,
    notes: null,
    timeSlot: { id: 't2', dayOfWeek: 4, period: 'EVENING', isBooked: true },
    requester: { id: '3', name: 'James Park', level: 'EXPERIENCED' },
    partner: { id: '4', name: 'Sofia Martinez', level: 'NEW_GRAD' },
    createdAt: '2025-02-22',
  },
  {
    id: 's3',
    interviewType: 'BEHAVIORAL',
    status: 'CANCELLED',
    meetingLink: null,
    notes: null,
    timeSlot: { id: 't3', dayOfWeek: 2, period: 'AFTERNOON', isBooked: false },
    requester: { id: '5', name: 'Kevin Wu', level: 'INTERN' },
    partner: { id: '1', name: 'Alex Chen', level: 'NEW_GRAD' },
    createdAt: '2025-02-18',
  },
];

const WEEK_DATA = [
  { day: 'Mon', count: 6 },
  { day: 'Tue', count: 9 },
  { day: 'Wed', count: 5 },
  { day: 'Thu', count: 12 },
  { day: 'Fri', count: 8 },
  { day: 'Sat', count: 4 },
  { day: 'Sun', count: 7 },
];

const FULL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

type Tab = 'Overview' | 'Users' | 'Sessions';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [suspendedUsers, setSuspendedUsers] = useState<Set<string>>(new Set());

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const toggleSuspend = (id: string) => {
    setSuspendedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'INTERN':
        return 'bg-blue-100 text-blue-800';
      case 'NEW_GRAD':
        return 'bg-green-100 text-green-800';
      case 'EXPERIENCED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Completed
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Upcoming
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          Admin Panel
          <span
            className="bg-red-600 text-white text-sm font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wide"
            data-testid="admin-badge"
          >
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
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW CONTENT */}
      {activeTab === 'Overview' && (
        <section className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-[#7C3AED] mb-2">
                {mockStats.totalUsers}
              </span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Total Users
              </span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-blue-600 mb-2">
                {mockStats.sessionsThisWeek}
              </span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Sessions This Week
              </span>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-green-600 mb-2">
                {mockStats.showUpRate}%
              </span>
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                Show-up Rate
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Sessions (Last 7 Days)
            </h3>
            <div
              className="h-64 flex items-end gap-2 sm:gap-4 justify-between"
              data-testid="bar-chart"
            >
              {WEEK_DATA.map((data, index) => {
                const maxHeight = 12; // based on max count in mock
                const heightPercent = (data.count / maxHeight) * 100;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 gap-2 group"
                  >
                    <div className="opacity-0 group-hover:opacity-100 text-xs font-bold text-gray-600 transition-opacity">
                      {data.count}
                    </div>
                    <div
                      className="w-full bg-[#7C3AED] rounded-t-md transition-all duration-500 ease-out hover:bg-[#6D28D9]"
                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                    />
                    <span className="text-xs font-medium text-gray-500 mt-1">
                      {data.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* USERS CONTENT */}
      {activeTab === 'Users' && (
        <section className="space-y-6 animate-in fade-in duration-300">
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
              <table
                className="w-full text-left border-collapse"
                data-testid="users-table"
              >
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Level</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-gray-500 italic"
                      >
                        No users found matching &quot;{searchQuery}&quot;
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, idx) => (
                      <tr
                        key={user.id}
                        className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}`}
                      >
                        <td className="p-4 font-bold text-gray-900">
                          {user.name}
                        </td>
                        <td className="p-4 text-gray-600 text-sm">
                          {user.email}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getLevelColor(user.level)}`}
                          >
                            {user.level.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 flex justify-end gap-3">
                          <button className="text-sm font-semibold text-[#7C3AED] hover:text-[#6D28D9] transition-colors">
                            View
                          </button>
                          <button
                            onClick={() => toggleSuspend(user.id)}
                            className={`text-sm font-semibold transition-colors px-3 py-1 rounded-md ${
                              suspendedUsers.has(user.id)
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                            data-testid={`suspend-btn-${user.id}`}
                          >
                            {suspendedUsers.has(user.id)
                              ? 'Restore'
                              : 'Suspend'}
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

      {/* SESSIONS CONTENT */}
      {activeTab === 'Sessions' && (
        <section className="animate-in fade-in duration-300">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table
                className="w-full text-left border-collapse"
                data-testid="sessions-table"
              >
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                    <th className="p-4 w-64">Participants</th>
                    <th className="p-4">Interview Type</th>
                    <th className="p-4">Date / Time</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSessions.map((session, idx) => (
                    <tr
                      key={session.id}
                      className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}`}
                    >
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-900">
                            <span className="font-semibold text-gray-500 text-xs mr-1">
                              R:
                            </span>
                            {session.requester.name}
                          </span>
                          <span className="text-sm text-gray-900">
                            <span className="font-semibold text-gray-500 text-xs mr-1">
                              P:
                            </span>
                            {session.partner.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-purple-100 text-[#7C3AED] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                          {session.interviewType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {FULL_DAYS[session.timeSlot.dayOfWeek]}
                        </div>
                        <div className="text-xs text-gray-500">
                          {session.timeSlot.period}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(session.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
