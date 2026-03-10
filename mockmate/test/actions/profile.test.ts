import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProfile, updateProfile } from '../../app/actions/profile';
import prisma from '../../lib/db';
import { getServerSession } from 'next-auth';

// Mock prisma
vi.mock('../../lib/db', () => ({
    default: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}));

// Mock next-auth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

describe('Profile Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getProfile', () => {
        it('returns error if user is not authenticated', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);
            const result = await getProfile();
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unauthorized');
        });

        it('returns error if user not found in database', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { email: 'test@example.com' },
                expires: '123',
            } as unknown as import('next-auth').Session);
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(null);

            const result = await getProfile();
            expect(result.success).toBe(false);
            expect(result.error).toBe('User not found');
        });

        it('returns user profile successfully', async () => {
            const mockUser = {
                experienceLevel: 'New Grad',
                interviewTypes: ['Behavioral'],
                availability: ['2026-03-12T14:00:00.000Z'],
                zoomLink: 'https://zoom.us/j/123456',
            } as unknown as import('@prisma/client').User;

            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { email: 'test@example.com' },
                expires: '123',
            } as unknown as import('next-auth').Session);
            vi.mocked(prisma.user.findUnique).mockResolvedValueOnce(mockUser);

            const result = await getProfile();
            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUser);
        });
    });

    describe('updateProfile', () => {
        it('returns error if user is not authenticated', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce(null);
            const result = await updateProfile({
                experienceLevel: 'Intern',
                interviewTypes: ['Coding'],
                availability: [],
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unauthorized');
        });

        it('returns error on invalid data', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { email: 'test@example.com' },
                expires: '123',
            } as unknown as import('next-auth').Session);
            const result = await updateProfile({
                experienceLevel: 'Intern',
                interviewTypes: [], // Invalid: min length 1
                availability: [],
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('Select at least one interview type');
        });

        it('returns error on invalid zoom link', async () => {
            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { email: 'test@example.com' },
                expires: '123',
            } as unknown as import('next-auth').Session);
            const result = await updateProfile({
                experienceLevel: 'Intern',
                interviewTypes: ['Coding'],
                availability: [],
                zoomLink: 'not a url',
            });
            expect(result.success).toBe(false);
            expect(result.error).toBe('Must be a valid URL');
        });

        it('updates user successfully with valid data', async () => {
            const validData = {
                experienceLevel: 'Experienced' as const, // Need to match z.enum
                interviewTypes: ['System Design'],
                availability: ['2026-03-14T15:00:00.000Z'],
                zoomLink: 'https://zoom.us/j/987654321',
            };

            const mockUpdatedUser = { id: 'user1', email: 'test@example.com', ...validData } as unknown as import('@prisma/client').User;

            vi.mocked(getServerSession).mockResolvedValueOnce({
                user: { email: 'test@example.com' },
                expires: '123',
            } as unknown as import('next-auth').Session);
            vi.mocked(prisma.user.update).mockResolvedValueOnce(mockUpdatedUser);

            const result = await updateProfile(validData);

            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUpdatedUser);
            expect(prisma.user.update).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
                data: {
                    experienceLevel: 'Experienced',
                    interviewTypes: ['System Design'],
                    availability: ['2026-03-14T15:00:00.000Z'],
                    zoomLink: 'https://zoom.us/j/987654321',
                },
            });
        });
    });
});
