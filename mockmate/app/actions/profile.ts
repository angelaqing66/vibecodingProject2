'use server';

import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { profileSchema, type ProfileInput } from '@/lib/validations';

export async function getProfile() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        experienceLevel: true,
        interviewTypes: true,
        availability: true,
        zoomLink: true,
      },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('getProfile error:', error);
    return { success: false, error: 'Failed to fetch profile' };
  }
}

export async function updateProfile(data: ProfileInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const validatedData = profileSchema.safeParse(data);

    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0]?.message || 'Invalid input data',
      };
    }

    const { experienceLevel, interviewTypes, availability, zoomLink } = validatedData.data;

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        experienceLevel,
        interviewTypes,
        availability,
        zoomLink: zoomLink || null,
      },
    });

    return { success: true, user };
  } catch (error) {
    console.error('updateProfile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}
