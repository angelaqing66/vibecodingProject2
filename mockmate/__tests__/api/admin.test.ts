/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getUsers } from '@/app/api/admin/users/route';
import { PUT as suspendUser } from '@/app/api/admin/users/[id]/suspend/route';
import { GET as getStats } from '@/app/api/admin/stats/route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    mockSession: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Admin API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication & Authorization', () => {
    it('Returns 401 if not logged in', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null);
      const res = await getUsers();
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('Returns 403 if not admin', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'user-1', role: 'STUDENT' },
      } as any);

      const res = await getUsers();
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });

  describe('Users API', () => {
    it('Returns correct data for admin user', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN' },
      } as any);

      const mockUsers = [{ id: 'u1', name: 'Alice' }];
      vi.mocked(prisma.user.findMany).mockResolvedValueOnce(mockUsers as any);

      const res = await getUsers();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockUsers);
    });

    it('Suspend returns 200 with stub response (suspended field removed from schema)', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN' },
      } as any);

      const req = new Request('http://localhost/api/admin/users/u1/suspend');
      const res = await suspendUser(req, {
        params: Promise.resolve({ id: 'u1' }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('u1');
    });
  });

  describe('Stats API', () => {
    it('Returns stats aggregation for admins', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN' },
      } as any);

      vi.mocked(prisma.user.count).mockResolvedValueOnce(100);
      // first call evaluates to 10
      vi.mocked(prisma.mockSession.count).mockResolvedValueOnce(10);
      // second call to 5
      vi.mocked(prisma.mockSession.count).mockResolvedValueOnce(5);
      // third call to 20
      vi.mocked(prisma.mockSession.count).mockResolvedValueOnce(20);

      const res = await getStats();
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.data.totalUsers).toBe(100);
      expect(data.data.sessionsThisWeek).toBe(10);
      // 5 completed out of 20 total = 25% show up rate
      expect(data.data.showUpRate).toBe(25);
    });

    it('Returns 401 for unauthenticated request to stats', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null);
      const res = await getStats();
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('Returns 403 for non-admin request to stats', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'user-1', role: 'USER' },
      } as any);
      const res = await getStats();
      expect(res.status).toBe(403);
    });

    it('Returns 500 when DB throws on stats', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN' },
      } as any);
      vi.mocked(prisma.user.count).mockRejectedValueOnce(new Error('DB error'));

      const res = await getStats();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('Returns 0 showUpRate when totalSessions is 0', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN' },
      } as any);
      vi.mocked(prisma.user.count).mockResolvedValueOnce(5);
      vi.mocked(prisma.mockSession.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.mockSession.count).mockResolvedValueOnce(0);
      vi.mocked(prisma.mockSession.count).mockResolvedValueOnce(0);

      const res = await getStats();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.data.showUpRate).toBe(0);
    });
  });

  describe('Users API — error paths', () => {
    it('Returns 500 when DB throws on user list', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'admin-1', role: 'ADMIN' },
      } as any);
      vi.mocked(prisma.user.findMany).mockRejectedValueOnce(
        new Error('DB crash')
      );

      const res = await getUsers();
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
    });
  });
});
