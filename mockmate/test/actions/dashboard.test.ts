import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardData, acceptSession, declineSession } from '../../app/actions/dashboard';
import prisma from '../../lib/db';
import { getServerSession } from 'next-auth';

vi.mock('../../lib/db', () => ({
    default: {
        mockSession: {
            findMany: vi.fn(),
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

describe('Dashboard Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getDashboardData', () => {
        it('returns error if unauthenticated', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);
            const result = await getDashboardData();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unauthorized');
        });

        it('categorizes sessions correctly based on time and status', async () => {
            const now = new Date();

            const futureDate = new Date();
            futureDate.setDate(now.getDate() + 1);

            const pastDate = new Date();
            pastDate.setDate(now.getDate() - 1);

            const mockSessions = [
                { id: '1', hostId: 'user1', guestId: 'user2', status: 'PENDING', scheduledTime: futureDate }, // Pending Received for host (user1), Pending Sent for guest (user2)
                { id: '2', hostId: 'user2', guestId: 'user1', status: 'PENDING', scheduledTime: futureDate }, // Pending Sent for host (user1)
                { id: '3', hostId: 'user1', guestId: 'user3', status: 'SCHEDULED', scheduledTime: futureDate }, // Upcoming for user1
                { id: '4', hostId: 'user4', guestId: 'user1', status: 'COMPLETED', scheduledTime: pastDate }, // Past for user1
                { id: '5', hostId: 'user2', guestId: 'user1', status: 'PENDING', scheduledTime: pastDate }, // Past (missed pending sent) for user1
            ];

            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { id: 'user1' },
            } as unknown as import('next-auth').Session);

            vi.mocked(prisma.mockSession.findMany).mockResolvedValueOnce(mockSessions as unknown as import('@prisma/client').MockSession[]);

            const result = await getDashboardData();

            expect(result.success).toBe(true);
            expect(result.data?.pendingReceived).toHaveLength(1);
            expect(result.data?.pendingReceived[0].id).toBe('1');

            expect(result.data?.pendingSent).toHaveLength(1);
            expect(result.data?.pendingSent[0].id).toBe('2');

            expect(result.data?.upcoming).toHaveLength(1);
            expect(result.data?.upcoming[0].id).toBe('3');

            expect(result.data?.past).toHaveLength(2); // id 4 and 5
        });
    });

    describe('acceptSession', () => {
        it('fails if unauthenticated', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);
            const result = await acceptSession('session1');
            expect(result.success).toBe(false);
        });

        it('fails if user is not the host', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { id: 'guestUser' },
            } as unknown as import('next-auth').Session);

            vi.mocked(prisma.mockSession.findUnique).mockResolvedValueOnce({
                id: 'session1',
                hostId: 'hostUser',
            } as unknown as import('@prisma/client').MockSession);

            const result = await acceptSession('session1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Only the host can accept this session');
        });

        it('succeeds if user is the host', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { id: 'hostUser' },
            } as unknown as import('next-auth').Session);

            vi.mocked(prisma.mockSession.findUnique).mockResolvedValueOnce({
                id: 'session1',
                hostId: 'hostUser',
            } as unknown as import('@prisma/client').MockSession);

            vi.mocked(prisma.mockSession.update).mockResolvedValueOnce({
                id: 'session1',
                status: 'SCHEDULED',
            } as unknown as import('@prisma/client').MockSession);

            const result = await acceptSession('session1');
            expect(result.success).toBe(true);
            expect(prisma.mockSession.update).toHaveBeenCalledWith({
                where: { id: 'session1' },
                data: { status: 'SCHEDULED' },
            });
        });
    });

    describe('declineSession', () => {
        it('fails if user is not host or guest', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { id: 'randomUser' },
            } as unknown as import('next-auth').Session);

            vi.mocked(prisma.mockSession.findUnique).mockResolvedValueOnce({
                id: 'session1',
                hostId: 'hostUser',
                guestId: 'guestUser',
            } as unknown as import('@prisma/client').MockSession);

            const result = await declineSession('session1');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Not authorized for this session');
        });

        it('succeeds if user is guest', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { id: 'guestUser' },
            } as unknown as import('next-auth').Session);

            vi.mocked(prisma.mockSession.findUnique).mockResolvedValueOnce({
                id: 'session1',
                hostId: 'hostUser',
                guestId: 'guestUser',
            } as unknown as import('@prisma/client').MockSession);

            vi.mocked(prisma.mockSession.update).mockResolvedValueOnce({
                id: 'session1',
                status: 'CANCELLED',
            } as unknown as import('@prisma/client').MockSession);

            const result = await declineSession('session1');
            expect(result.success).toBe(true);
            expect(prisma.mockSession.update).toHaveBeenCalledWith({
                where: { id: 'session1' },
                data: { status: 'CANCELLED' },
            });
        });
    });
});
