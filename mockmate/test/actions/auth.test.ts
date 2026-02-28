import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUpUser } from '../../app/actions/auth';
import prisma from '../../lib/db';
import bcrypt from 'bcryptjs';

// Mock prisma
vi.mock('../../lib/db', () => {
    return {
        default: {
            user: {
                findUnique: vi.fn(),
                create: vi.fn(),
            },
        },
    };
});

// Mock bcrypt
vi.mock('bcryptjs', () => {
    return {
        default: {
            hash: vi.fn().mockResolvedValue('hashed_password'),
        },
    };
});

describe('signUpUser Action', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fails gracefully when validation fails (e.g. password too short)', async () => {
        const result = await signUpUser({
            name: 'Test',
            email: 'test@example.com',
            password: '123', // Too short
        });

        expect(result.success).toBe(false);
        expect(result.error).toContain('Password must be at least 6 characters');
    });

    it('fails when email is already in use', async () => {
        // Mock prisma to return an existing user
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce({
            id: '1',
            email: 'test@example.com',
        } as unknown as Awaited<ReturnType<typeof prisma.user.findUnique>>);

        const result = await signUpUser({
            name: 'Test',
            email: 'test@example.com',
            password: 'password123',
        });

        expect(result.success).toBe(false);
        expect(result.error).toBe('User with this email already exists');
        expect(prisma.user.findUnique).toHaveBeenCalledWith({
            where: { email: 'test@example.com' },
        });
        expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('registers a user successfully with valid inputs', async () => {
        // Mock prisma to return null (no existing user)
        vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);
        // Mock prisma to return the created user
        vi.mocked(prisma.user.create).mockResolvedValueOnce({
            id: '2',
            name: 'Test User',
            email: 'test@example.com',
        } as unknown as Awaited<ReturnType<typeof prisma.user.create>>);

        const result = await signUpUser({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123',
        });

        expect(result.success).toBe(true);
        expect(result.user).toBeDefined();
        expect(result.user?.email).toBe('test@example.com');
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'hashed_password',
            },
        });
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });
});
