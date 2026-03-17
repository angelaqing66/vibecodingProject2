import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookSession } from '../../app/actions/booking';
import prisma from '../../lib/db';
import { getServerSession } from 'next-auth';

vi.mock('../../lib/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    mockSession: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('Booking Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('bookSession', () => {
    const validFutureDate = new Date();
    validFutureDate.setDate(validFutureDate.getDate() + 1);
    const validISO = validFutureDate.toISOString();

    it('returns error if unauthenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null);

      const result = await bookSession({
        hostId: 'host123',
        scheduledTime: validISO,
        message: 'Hello!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });

    it('returns error if user attempts to book themselves', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'user123' },
      } as unknown as import('next-auth').Session);

      const result = await bookSession({
        hostId: 'user123',
        scheduledTime: validISO,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('You cannot book a session with yourself');
    });

    it('returns error if host does not exist or has no such availability', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'guest123' },
      } as unknown as import('next-auth').Session);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        availability: [],
      } as unknown as import('@prisma/client').User);

      const result = await bookSession({
        hostId: 'host123',
        scheduledTime: validISO,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('This time slot is no longer available');
    });

    it('returns error if guest already requested this exact slot', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'guest123' },
      } as unknown as import('next-auth').Session);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        availability: [validISO],
      } as unknown as import('@prisma/client').User);

      vi.mocked(prisma.mockSession.findFirst).mockResolvedValueOnce({
        id: 'existing123',
      } as unknown as import('@prisma/client').MockSession);

      const result = await bookSession({
        hostId: 'host123',
        scheduledTime: validISO,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        'You have already requested or booked this slot'
      );
    });

    it('creates a MockSession if valid', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'guest123' },
      } as unknown as import('next-auth').Session);

      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
        availability: [validISO],
      } as unknown as import('@prisma/client').User);

      vi.mocked(prisma.mockSession.findFirst).mockResolvedValueOnce(null);

      vi.mocked(prisma.mockSession.create).mockResolvedValueOnce({
        id: 'newSession123',
        hostId: 'host123',
        guestId: 'guest123',
        scheduledTime: new Date(validISO),
        status: 'PENDING',
        message: 'Looking forward to it',
      } as unknown as import('@prisma/client').MockSession);

      const result = await bookSession({
        hostId: 'host123',
        scheduledTime: validISO,
        message: 'Looking forward to it',
      });

      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(prisma.mockSession.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            hostId: 'host123',
            guestId: 'guest123',
            scheduledTime: new Date(validISO),
            status: 'PENDING',
            message: 'Looking forward to it',
          },
        })
      );
    });

    it('returns error when host does not exist in DB (null from findUnique)', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'guest123' },
      } as unknown as import('next-auth').Session);

      // findUnique returns null — host not found
      vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

      const result = await bookSession({
        hostId: 'host-nonexistent',
        scheduledTime: validISO,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Host not found');
    });

    it('returns ZodError message when scheduledTime is not a valid datetime', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'guest123' },
      } as unknown as import('next-auth').Session);

      const result = await bookSession({
        hostId: 'host123',
        scheduledTime: 'not-a-valid-datetime',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('returns server error when DB throws unexpectedly', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce({
        user: { id: 'guest123' },
      } as unknown as import('next-auth').Session);

      vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(
        new Error('Unexpected DB failure')
      );

      const result = await bookSession({
        hostId: 'host123',
        scheduledTime: validISO,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unexpected DB failure');
    });
  });
});
