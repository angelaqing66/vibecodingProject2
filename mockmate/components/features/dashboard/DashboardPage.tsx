"use client";

import React from "react";
import { Session } from "@/types";

const mockSessions: Session[] = [
    {
        id: "session-1",
        interviewType: "CODING",
        status: "UPCOMING",
        meetingLink: "https://zoom.us/j/111",
        notes: "Preparing for Google SWE internship",
        timeSlot: { id: "s1", dayOfWeek: 4, period: "EVENING", isBooked: true },
        requester: { id: "current-user", name: "Vartika Singh", level: "NEW_GRAD" },
        partner: { id: "1", name: "James Park", level: "EXPERIENCED" },
        createdAt: "2025-02-20"
    },
    {
        id: "session-2",
        interviewType: "BEHAVIORAL",
        status: "UPCOMING",
        meetingLink: "https://zoom.us/j/222",
        notes: null,
        timeSlot: { id: "s2", dayOfWeek: 6, period: "AFTERNOON", isBooked: true },
        requester: { id: "current-user", name: "Vartika Singh", level: "NEW_GRAD" },
        partner: { id: "4", name: "Sofia Martinez", level: "NEW_GRAD" },
        createdAt: "2025-02-22"
    },
    {
        id: "session-3",
        interviewType: "CODING",
        status: "COMPLETED",
        meetingLink: "https://zoom.us/j/333",
        notes: null,
        timeSlot: { id: "s3", dayOfWeek: 0, period: "MORNING", isBooked: true },
        requester: { id: "current-user", name: "Vartika Singh", level: "NEW_GRAD" },
        partner: { id: "5", name: "Kevin Wu", level: "INTERN" },
        createdAt: "2025-02-15"
    },
    {
        id: "session-4",
        interviewType: "SYSTEM_DESIGN",
        status: "COMPLETED",
        meetingLink: "https://zoom.us/j/444",
        notes: null,
        timeSlot: { id: "s4", dayOfWeek: 1, period: "EVENING", isBooked: true },
        requester: { id: "2", name: "Priya Sharma", level: "INTERN" },
        partner: { id: "current-user", name: "Vartika Singh", level: "NEW_GRAD" },
        createdAt: "2025-02-10"
    }
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function DashboardPage() {
    const currentUserId = "current-user";

    const completedSessions = mockSessions.filter(s => s.status === "COMPLETED");

    const sessionsAsInterviewee = completedSessions.filter(s => s.requester.id === currentUserId).length;
    const sessionsAsInterviewer = completedSessions.filter(s => s.partner.id === currentUserId).length;
    const totalCompleted = completedSessions.length;

    const upcomingSessions = mockSessions.filter(s => s.status === "UPCOMING");
    const pastSessions = mockSessions.filter(s => s.status === "COMPLETED" || s.status === "CANCELLED");

    const getPartnerName = (session: Session) => {
        return session.requester.id === currentUserId ? session.partner.name : session.requester.name;
    };

    const getRoleBadge = (session: Session) => {
        const isInterviewee = session.requester.id === currentUserId;
        return isInterviewee ? (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">Interviewee</span>
        ) : (
            <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">Interviewer</span>
        );
    };

    const getTypeBadge = (type: string) => {
        return <span className="bg-purple-100 text-[#7C3AED] text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">{type.replace("_", " ")}</span>;
    };

    const getStatusBadge = (status: string) => {
        if (status === "COMPLETED") return <span className="text-green-600 text-xs font-bold uppercase">✓ Completed</span>;
        if (status === "CANCELLED") return <span className="text-red-600 text-xs font-bold uppercase">✕ Cancelled</span>;
        return null;
    };

    const SessionCard = ({ session, isUpcoming }: { session: Session, isUpcoming: boolean }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6" data-testid={`session-card-${session.id}`}>
            <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    {getRoleBadge(session)}
                    {getTypeBadge(session.interviewType)}
                    {!isUpcoming && getStatusBadge(session.status)}
                </div>

                <div>
                    <h3 className="text-lg font-bold text-gray-900">Mock Interview with {getPartnerName(session)}</h3>
                    <p className="text-gray-600 font-medium">
                        {DAYS[session.timeSlot.dayOfWeek]} {session.timeSlot.period.toLowerCase()}
                    </p>
                </div>

                {session.notes && (
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                        &quot;{session.notes}&quot;
                    </p>
                )}
            </div>

            {isUpcoming && session.meetingLink ? (
                <div className="flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                    <a
                        href={session.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full md:w-auto px-6 py-3 bg-[#7C3AED] text-white font-semibold rounded-xl hover:bg-[#6D28D9] transition-colors"
                    >
                        Join Meeting
                    </a>
                </div>
            ) : null}
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

            {/* Header Segment */}
            <div className="border-b border-gray-200 pb-5">
                <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-gray-600 text-lg">Manage your mock interview sessions</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-[#7C3AED]">{totalCompleted}</span>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest mt-1">Total Completed</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-blue-600">{sessionsAsInterviewee}</span>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest mt-1">As Interviewee</span>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-black text-orange-600">{sessionsAsInterviewer}</span>
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest mt-1">As Interviewer</span>
                </div>
            </div>

            {/* Upcoming Sessions List */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <span>📅</span> Upcoming Sessions
                </h2>

                {upcomingSessions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
                        You have no upcoming sessions. Go to Search to find a partner!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingSessions.map(session => (
                            <SessionCard key={session.id} session={session} isUpcoming={true} />
                        ))}
                    </div>
                )}
            </section>

            {/* Past Sessions List */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12 flex items-center gap-3">
                    <span>🕰️</span> Past Sessions
                </h2>

                {pastSessions.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-500">
                        No past sessions yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pastSessions.map(session => (
                            <SessionCard key={session.id} session={session} isUpcoming={false} />
                        ))}
                    </div>
                )}
            </section>

        </div>
    );
}
