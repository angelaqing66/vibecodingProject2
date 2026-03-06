'use server';

import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function updateProfile(data: {
  experienceLevel: string;
  interviewTypes: string[];
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: 'Unauthorized' };
  }

  if (!data.experienceLevel || data.interviewTypes.length === 0) {
    return {
      success: false,
      error: 'Experience level and at least one interview type are required',
    };
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        experienceLevel: data.experienceLevel,
        interviewTypes: data.interviewTypes,
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}
