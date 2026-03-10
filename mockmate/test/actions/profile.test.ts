import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfile } from '../../app/actions/profile';
import prisma from '../../lib/db';
import { getServerSession } from 'next-auth/next';

vi.mock('../../lib/db', () => ({
  default: {
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

describe('updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fails if user is not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const result = await updateProfile({
      experienceLevel: 'Intern',
      interviewTypes: ['Coding'],
    });

    expect(result).toEqual({ success: false, error: 'Unauthorized' });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('fails if required data is missing', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com', id: '1' },
      expires: '123',
    });

    const result = await updateProfile({
      experienceLevel: '',
      interviewTypes: [],
    });

    expect(result).toEqual({
      success: false,
      error: 'Experience level and at least one interview type are required',
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('successfully updates user profile', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com', id: '1' },
      expires: '123',
    });

    const mockUpdatedUser = {
      id: '1',
      experienceLevel: 'Intern',
      interviewTypes: ['Coding'],
    };
    vi.mocked(prisma.user.update).mockResolvedValueOnce(
      mockUpdatedUser as unknown as import('@prisma/client').User
    );

    const result = await updateProfile({
      experienceLevel: 'Intern',
      interviewTypes: ['Coding'],
    });

    expect(result.success).toBe(true);
    expect(result.user).toEqual(mockUpdatedUser);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
      data: {
        experienceLevel: 'Intern',
        interviewTypes: ['Coding'],
      },
    });
  });

  it('handles database errors gracefully', async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { email: 'test@example.com', id: '1' },
      expires: '123',
    });

    vi.mocked(prisma.user.update).mockRejectedValueOnce(new Error('DB Error'));

    const result = await updateProfile({
      experienceLevel: 'Intern',
      interviewTypes: ['Coding'],
    });

    expect(result).toEqual({
      success: false,
      error: 'Failed to update profile',
    });
  });
});
