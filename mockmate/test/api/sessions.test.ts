/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/sessions/route';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    mockSession: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Helper to create a minimal Next.js Request object
function makeRequest(body: object): Request {
  return new Request('http://localhost/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await POST(
      makeRequest({ hostId: 'h1', scheduledTime: new Date().toISOString() })
    );

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('returns 401 when session has no user id', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@test.com' }, // no id
      expires: '123',
    } as any);

    const res = await POST(
      makeRequest({ hostId: 'h1', scheduledTime: new Date().toISOString() })
    );

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('returns 400 when hostId or scheduledTime missing', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'guest-1' },
      expires: '123',
    } as any);

    const res = await POST(makeRequest({ hostId: 'h1' })); // missing scheduledTime

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('hostId and scheduledTime are required');
  });

  it('returns 400 when user tries to book themselves', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'user-1' },
      expires: '123',
    } as any);

    const res = await POST(
      makeRequest({
        hostId: 'user-1',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      })
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('You cannot book a session with yourself');
  });

  it('returns 404 when host not found', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'guest-1' },
      expires: '123',
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

    const res = await POST(
      makeRequest({
        hostId: 'host-nonexistent',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      })
    );

    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Partner not found');
  });

  it('returns 409 when slot not in host availability', async () => {
    const slotTime = new Date(Date.now() + 86400000);

    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'guest-1' },
      expires: '123',
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'host-1',
      name: 'Host',
      availability: [], // empty — slot not available
      zoomLink: null,
    } as any);

    const res = await POST(
      makeRequest({
        hostId: 'host-1',
        scheduledTime: slotTime.toISOString(),
      })
    );

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toBe('Selected time slot is not available');
  });

  it('returns 409 when slot already booked', async () => {
    const slotTime = new Date(Date.now() + 86400000);
    const slotISO = slotTime.toISOString();

    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'guest-1' },
      expires: '123',
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'host-1',
      name: 'Host',
      availability: [slotISO],
      zoomLink: 'https://zoom.us/j/abc',
    } as any);
    vi.mocked(prisma.mockSession.findFirst).mockResolvedValueOnce({
      id: 'existing-session',
    } as any);

    const res = await POST(
      makeRequest({ hostId: 'host-1', scheduledTime: slotISO })
    );

    expect(res.status).toBe(409);
    const data = await res.json();
    expect(data.error).toContain('already booked');
  });

  it('returns 200 and creates session on success', async () => {
    const slotTime = new Date(Date.now() + 86400000);
    const slotISO = slotTime.toISOString();

    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'guest-1' },
      expires: '123',
    } as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
      id: 'host-1',
      name: 'Host',
      availability: [slotISO],
      zoomLink: 'https://zoom.us/j/abc',
    } as any);
    vi.mocked(prisma.mockSession.findFirst).mockResolvedValueOnce(null);
    vi.mocked(prisma.mockSession.create).mockResolvedValueOnce({
      id: 'new-session',
      hostId: 'host-1',
      guestId: 'guest-1',
      scheduledTime: slotTime,
      status: 'PENDING',
      host: { id: 'host-1', name: 'Host', zoomLink: 'https://zoom.us/j/abc' },
      guest: { id: 'guest-1', name: 'Guest' },
    } as any);

    const res = await POST(
      makeRequest({ hostId: 'host-1', scheduledTime: slotISO })
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('new-session');
    expect(data.data.status).toBe('PENDING');
    expect(data.data.hostName).toBe('Host');
  });

  it('returns 500 on unexpected DB error', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'guest-1' },
      expires: '123',
    } as any);
    vi.mocked(prisma.user.findUnique).mockRejectedValueOnce(
      new Error('DB crash')
    );

    const res = await POST(
      makeRequest({
        hostId: 'host-1',
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      })
    );

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});

describe('GET /api/sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const res = await GET();

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it('returns 401 when session has no user id', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@test.com' },
      expires: '123',
    } as any);

    const res = await GET();

    expect(res.status).toBe(401);
  });

  it('returns 200 with sessions list for authenticated user', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'user-1' },
      expires: '123',
    } as any);

    const mockSessions = [
      {
        id: 's1',
        scheduledTime: new Date(),
        status: 'SCHEDULED',
        host: { id: 'host-1', name: 'Alice', zoomLink: null },
        guest: { id: 'user-1', name: 'Bob' },
      },
    ];
    vi.mocked(prisma.mockSession.findMany).mockResolvedValueOnce(
      mockSessions as any
    );

    const res = await GET();

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].id).toBe('s1');
  });

  it('returns 500 on DB error', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'user-1' },
      expires: '123',
    } as any);
    vi.mocked(prisma.mockSession.findMany).mockRejectedValueOnce(
      new Error('DB error')
    );

    const res = await GET();

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal server error');
  });
});
