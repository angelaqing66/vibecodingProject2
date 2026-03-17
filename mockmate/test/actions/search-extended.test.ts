import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPartnerById } from '../../app/actions/search';
import prisma from '../../lib/db';
import { getServerSession } from 'next-auth/next';

vi.mock('../../lib/db', () => ({
  default: {
    user: {
      findFirst: vi.fn(),
    },
    mockSession: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

describe('getPartnerById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Unauthorized if unauthenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const result = await getPartnerById('partner-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unauthorized');
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('returns Partner not found when user does not exist', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'current-user', email: 'user@test.com' },
      expires: '123',
    });
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null);

    const result = await getPartnerById('nonexistent-id');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Partner not found');
  });

  it('returns partner profile with booked slots filtered out', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString();

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterISO = dayAfter.toISOString();

    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'current-user', email: 'user@test.com' },
      expires: '123',
    });

    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
      id: 'partner-1',
      name: 'Alice',
      image: null,
      experienceLevel: 'New Grad',
      interviewTypes: ['Coding', 'System Design'],
      availability: [tomorrowISO, dayAfterISO],
      zoomLink: 'https://zoom.us/j/123',
    } as unknown as import('@prisma/client').User);

    // tomorrowISO is booked, dayAfterISO is free
    vi.mocked(prisma.mockSession.findMany).mockResolvedValueOnce([
      { scheduledTime: tomorrow },
    ] as unknown as import('@prisma/client').MockSession[]);

    const result = await getPartnerById('partner-1');

    expect(result.success).toBe(true);
    expect(result.partner).toBeDefined();
    expect(result.partner!.availability).toHaveLength(1);
    expect(result.partner!.availability[0]).toBe(dayAfterISO);
  });

  it('returns all availability when no booked sessions', async () => {
    const slot1 = new Date(Date.now() + 86400000).toISOString();
    const slot2 = new Date(Date.now() + 172800000).toISOString();

    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'current-user', email: 'user@test.com' },
      expires: '123',
    });

    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce({
      id: 'partner-2',
      name: 'Bob',
      image: null,
      experienceLevel: 'Experienced',
      interviewTypes: ['Behavioral'],
      availability: [slot1, slot2],
      zoomLink: null,
    } as unknown as import('@prisma/client').User);

    vi.mocked(prisma.mockSession.findMany).mockResolvedValueOnce([]);

    const result = await getPartnerById('partner-2');

    expect(result.success).toBe(true);
    expect(result.partner!.availability).toHaveLength(2);
    expect(result.partner!.name).toBe('Bob');
    expect(result.partner!.zoomLink).toBeNull();
  });

  it('returns error when DB throws', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'current-user', email: 'user@test.com' },
      expires: '123',
    });
    vi.mocked(prisma.user.findFirst).mockRejectedValueOnce(
      new Error('DB connection failed')
    );

    const result = await getPartnerById('partner-1');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to fetch partner profile');
  });
});
