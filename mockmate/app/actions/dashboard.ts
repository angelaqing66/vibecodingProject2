'use server';

import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getDashboardData() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const userId = session.user.id;
    const now = new Date();

    try {
        // Fetch all sessions where user is either host or guest
        const allSessions = await prisma.mockSession.findMany({
            where: {
                OR: [
                    { hostId: userId },
                    { guestId: userId }
                ]
            },
            include: {
                host: {
                    select: { id: true, name: true, experienceLevel: true, interviewTypes: true, zoomLink: true }
                },
                guest: {
                    select: { id: true, name: true, experienceLevel: true, interviewTypes: true, zoomLink: true }
                }
            },
            orderBy: {
                scheduledTime: 'asc'
            }
        });

        const pendingSent = allSessions.filter(s =>
            s.guestId === userId &&
            s.status === 'PENDING' &&
            s.scheduledTime > now
        );

        const pendingReceived = allSessions.filter(s =>
            s.hostId === userId &&
            s.status === 'PENDING' &&
            s.scheduledTime > now
        );

        const upcoming = allSessions.filter(s =>
            s.status === 'SCHEDULED' &&
            s.scheduledTime > now
        );

        // Any session in the past is considered "Past" regardless of its previous status
        // Though we might want to only include SCHEDULED or COMPLETED, not CANCELLED or PENDING
        // Let's include COMPLETED and SCHEDULED that are in the past
        const past = allSessions.filter(s =>
            s.scheduledTime <= now &&
            (s.status === 'SCHEDULED' || s.status === 'COMPLETED' || (s.status === 'PENDING' && s.guestId === userId)) // Show missed pending sent
        );

        return {
            success: true,
            data: {
                pendingSent,
                pendingReceived,
                upcoming,
                past
            }
        };
    } catch (error) {
        console.error('getDashboardData error:', error);
        return { success: false, error: 'Failed to fetch dashboard data' };
    }
}

export async function acceptSession(sessionId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const mockSession = await prisma.mockSession.findUnique({
            where: { id: sessionId }
        });

        if (!mockSession) {
            return { success: false, error: 'Session not found' };
        }

        if (mockSession.hostId !== session.user.id) {
            return { success: false, error: 'Only the host can accept this session' };
        }

        const updatedSession = await prisma.mockSession.update({
            where: { id: sessionId },
            data: { status: 'SCHEDULED' }
        });

        return { success: true, session: updatedSession };
    } catch (error) {
        console.error('acceptSession error:', error);
        return { success: false, error: 'Failed to accept session' };
    }
}

export async function declineSession(sessionId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const mockSession = await prisma.mockSession.findUnique({
            where: { id: sessionId }
        });

        if (!mockSession) {
            return { success: false, error: 'Session not found' };
        }

        if (mockSession.hostId !== session.user.id && mockSession.guestId !== session.user.id) {
            return { success: false, error: 'Not authorized for this session' };
        }

        const updatedSession = await prisma.mockSession.update({
            where: { id: sessionId },
            data: { status: 'CANCELLED' }
        });

        return { success: true, session: updatedSession };
    } catch (error) {
        console.error('declineSession error:', error);
        return { success: false, error: 'Failed to decline session' };
    }
}

export async function cancelSession(sessionId: string) {
    // Essentially the same logic as declineSession
    return declineSession(sessionId);
}
