'use server';

import prisma from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export type UserSearchResponse = {
  id: string;
  name: string | null;
  image: string | null;
  experienceLevel: string | null;
  interviewTypes: string[];
};

export type SearchResult = {
  users: UserSearchResponse[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  error?: string;
};

export async function searchPartners({
  page = 1,
  limit = 10,
  name = '',
  experienceLevel = '',
  interviewType = '',
}: {
  page?: number;
  limit?: number;
  name?: string;
  experienceLevel?: string;
  interviewType?: string;
}): Promise<SearchResult> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return {
        users: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        error: 'Unauthorized',
      };
    }

    const currentUserId = session.user.id;

    // Construct where clause dynamically based on provided filters
    const whereClause: Prisma.UserWhereInput = {
      id: { not: currentUserId }, // Exclude current user from results
      experienceLevel: { not: null }, // Only show users who finished profile setup
    };

    if (name) {
      whereClause.name = {
        contains: name,
        mode: 'insensitive', // PostgreSQL case-insensitive search
      };
    }

    if (experienceLevel) {
      whereClause.experienceLevel = experienceLevel;
    }

    if (interviewType) {
      whereClause.interviewTypes = {
        has: interviewType,
      };
    }

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          image: true,
          experienceLevel: true,
          interviewTypes: true,
        },
        skip,
        take: limit,
        orderBy: {
          name: 'asc', // Or order by last active, etc.
        },
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      users,
      totalCount,
      totalPages,
      currentPage: page,
    };
  } catch (error) {
    console.error('Error searching partners:', error);
    return {
      users: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      error: 'Failed to find partners.',
    };
  }
}

export type PartnerProfile = {
  id: string;
  name: string | null;
  image: string | null;
  experienceLevel: string | null;
  interviewTypes: string[];
  availability: string[];
  zoomLink: string | null;
};

export async function getPartnerById(partnerId: string): Promise<{
  success: boolean;
  partner?: PartnerProfile;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const partner = await prisma.user.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        name: true,
        image: true,
        experienceLevel: true,
        interviewTypes: true,
        availability: true,
        zoomLink: true,
      },
    });

    if (!partner) {
      return { success: false, error: 'Partner not found' };
    }

    return { success: true, partner };
  } catch (error) {
    console.error('getPartnerById error:', error);
    return { success: false, error: 'Failed to fetch partner profile' };
  }
}
