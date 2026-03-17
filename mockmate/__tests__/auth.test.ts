import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock PrismaAdapter (NextAuth adapter setup)
vi.mock('@next-auth/prisma-adapter', () => ({
  PrismaAdapter: vi.fn(() => ({})),
}));

import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Extract the callbacks from authOptions for isolated testing
const provider = authOptions.providers[0] as {
  options: {
    authorize: (
      credentials: { email: string; password: string } | undefined
    ) => Promise<unknown>;
  };
};
const authorize = provider.options.authorize;
const jwtCallback = authOptions.callbacks!.jwt! as (params: {
  token: Record<string, unknown>;
  user?: Record<string, unknown>;
}) => Promise<Record<string, unknown>>;
const sessionCallback = authOptions.callbacks!.session! as (params: {
  token: Record<string, unknown>;
  session: Record<string, unknown>;
}) => Promise<Record<string, unknown>>;

describe('lib/auth.ts — authorize callback', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws if credentials are missing', async () => {
    await expect(authorize(undefined)).rejects.toThrow('Invalid credentials');
  });

  it('throws if email is missing', async () => {
    await expect(authorize({ email: '', password: 'pass' })).rejects.toThrow(
      'Invalid credentials'
    );
  });

  it('throws if user not found in DB', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    await expect(
      authorize({ email: 'x@x.com', password: 'pass' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('throws if password is wrong', async () => {
    const hash = await bcrypt.hash('correct', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'x@x.com',
      name: 'X',
      password: hash,
      role: 'USER',
      emailVerified: null,
      image: null,
      experienceLevel: null,
      interviewTypes: [],
      availability: [],
      zoomLink: null,
    });
    await expect(
      authorize({ email: 'x@x.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials');
  });

  it('returns user object on valid credentials', async () => {
    const hash = await bcrypt.hash('secret', 10);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      name: 'Test User',
      password: hash,
      role: 'USER',
      emailVerified: null,
      image: null,
      experienceLevel: null,
      interviewTypes: [],
      availability: [],
      zoomLink: null,
    });
    const result = (await authorize({
      email: 'user@test.com',
      password: 'secret',
    })) as Record<string, unknown>;
    expect(result.id).toBe('user-1');
    expect(result.email).toBe('user@test.com');
    expect(result.role).toBe('USER');
  });
});

describe('lib/auth.ts — jwt callback', () => {
  beforeEach(() => vi.clearAllMocks());

  it('copies user id and role into token when user is provided', async () => {
    const token = await jwtCallback({
      token: {},
      user: { id: 'u1', role: 'ADMIN' },
    });
    expect(token.id).toBe('u1');
    expect(token.role).toBe('ADMIN');
  });

  it('hard-codes ADMIN role for admin@gmail.com', async () => {
    const token = await jwtCallback({
      token: { email: 'admin@gmail.com', id: 'a1', role: 'USER' },
    });
    expect(token.role).toBe('ADMIN');
  });

  it('re-fetches role from DB when token.id exists but role is missing', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      role: 'ADMIN',
    } as Parameters<typeof prisma.user.findUnique>[0] extends never
      ? never
      : Awaited<ReturnType<typeof prisma.user.findUnique>>);
    const token = await jwtCallback({ token: { id: 'u1' } });
    expect(token.role).toBe('ADMIN');
  });

  it('returns token unchanged when no user and role already set', async () => {
    const token = await jwtCallback({ token: { id: 'u1', role: 'USER' } });
    expect(token.role).toBe('USER');
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});

describe('lib/auth.ts — session callback', () => {
  it('copies id, name, email, role from token to session.user', async () => {
    const session = (await sessionCallback({
      token: {
        id: 'u1',
        name: 'Alice',
        email: 'alice@test.com',
        role: 'ADMIN',
      },
      session: { user: {} },
    })) as { user: Record<string, unknown> };
    expect(session.user.id).toBe('u1');
    expect(session.user.name).toBe('Alice');
    expect(session.user.email).toBe('alice@test.com');
    expect((session.user as { role?: string }).role).toBe('ADMIN');
  });

  it('returns session unchanged when no token', async () => {
    const session = (await sessionCallback({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token: undefined as any,
      session: { user: { name: 'Bob' } },
    })) as { user: Record<string, unknown> };
    expect(session.user.name).toBe('Bob');
  });
});
