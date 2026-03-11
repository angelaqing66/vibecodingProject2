import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchPartners } from '../../app/actions/search';
import prisma from '../../lib/db';
import { getServerSession } from 'next-auth/next';

vi.mock('../../lib/db', () => ({
  default: {
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    mockSession: {
      findMany: vi.fn(),
    }
  },
}));

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

describe('searchPartners', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fails if user is not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const result = await searchPartners({});

    expect(result.error).toBe('Unauthorized');
    expect(result.users).toEqual([]);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('searches users with pagination and filters securely excluding self', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'current-user-id', email: 'test@example.com' },
      expires: '123',
    });

    const mockUsers = [
      {
        id: '2',
        name: 'Alice',
        image: null,
        experienceLevel: 'Intern',
        interviewTypes: ['Coding'],
        availability: [],
      },
    ];

    vi.mocked(prisma.user.findMany).mockResolvedValueOnce(
      mockUsers as unknown as import('@prisma/client').User[]
    );
    vi.mocked(prisma.user.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.mockSession.findMany).mockResolvedValueOnce([]);

    const result = await searchPartners({
      page: 1,
      limit: 10,
      name: 'Ali',
      experienceLevel: 'Intern',
      interviewType: 'Coding',
    });

    expect(result.users).toEqual(mockUsers);
    expect(result.totalCount).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.currentPage).toBe(1);

    // Verify Prisma queries
    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: {
        id: { not: 'current-user-id' },
        experienceLevel: 'Intern',
        name: { contains: 'Ali', mode: 'insensitive' },
        interviewTypes: { has: 'Coding' },
      },
      select: {
        id: true,
        name: true,
        image: true,
        experienceLevel: true,
        interviewTypes: true,
        availability: true,
      },
      skip: 0,
      take: 10,
      orderBy: { id: 'asc' },
    });

    expect(prisma.user.count).toHaveBeenCalledWith({
      where: {
        id: { not: 'current-user-id' },
        experienceLevel: 'Intern',
        name: { contains: 'Ali', mode: 'insensitive' },
        interviewTypes: { has: 'Coding' },
      },
    });
  });

  it('searches users by date by generating 48 UTC time slots and using hasSome', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'current-user-id', email: 'test@example.com' },
      expires: '123',
    });

    vi.mocked(prisma.user.findMany).mockResolvedValueOnce([]);
    vi.mocked(prisma.user.count).mockResolvedValueOnce(0);
    vi.mocked(prisma.mockSession.findMany).mockResolvedValueOnce([]);

    const result = await searchPartners({
      page: 1, limit: 10, date: '2024-05-12'
    });

    const expectedTimeSlots = Array.from({ length: 48 }, (_, i) => {
      const slotDate = new Date(Date.UTC(2024, 4, 12)); // Month is 0-indexed (May = 4)
      slotDate.setUTCMinutes(i * 30);
      return slotDate.toISOString();
    });

    expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        availability: { hasSome: expectedTimeSlots }
      })
    }));
  });

  it('returns empty list gracefully on db errors', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'current-user-id', email: 'test@example.com' },
      expires: '123',
    });

    vi.mocked(prisma.user.findMany).mockRejectedValueOnce(
      new Error('DB connection failed')
    );

    const result = await searchPartners({});

    expect(result.error).toBe('Failed to find partners.');
    expect(result.users).toEqual([]);
  });
});
