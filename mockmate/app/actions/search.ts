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
  availability: string[];
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
  date = '',
}: {
  page?: number;
  limit?: number;
  name?: string;
  experienceLevel?: string;
  interviewType?: string;
  date?: string;
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
      role: { not: 'ADMIN' }, // Exclude admin users
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

    if (date) {
      // Generate 48 half-hour ISO strings (in UTC) for the given YYYY-MM-DD
      const [year, month, day] = date.split('-');
      const targetDate = new Date(
        Date.UTC(Number(year), Number(month) - 1, Number(day))
      );

      const timeSlots: string[] = [];
      for (let i = 0; i < 48; i++) {
        const slotDate = new Date(targetDate);
        slotDate.setUTCMinutes(i * 30);
        timeSlots.push(slotDate.toISOString());
      }

      whereClause.availability = {
        hasSome: timeSlots,
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
          availability: true,
        },
        skip,
        take: limit,
        orderBy: {
          id: 'asc', // deterministic sort, could be dynamic later
        },
      }),
      prisma.user.count({
        where: whereClause,
      }),
    ]);

    // Gather all PENDING or SCHEDULED sessions covering fetched users
    const bookedSessions = await prisma.mockSession.findMany({
      where: {
        hostId: { in: users.map((u) => u.id) },
        status: { in: ['PENDING', 'SCHEDULED'] },
        scheduledTime: { gt: new Date() },
      },
      select: { hostId: true, scheduledTime: true },
    });

    // Strip booked slots dynamically
    const filteredUsers = users.map((u) => {
      const userBookings = bookedSessions
        .filter((s) => s.hostId === u.id)
        .map((s) => s.scheduledTime.toISOString());

      return {
        ...u,
        availability: u.availability.filter(
          (slot) => !userBookings.includes(slot)
        ),
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return {
      users: filteredUsers,
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

    const partner = await prisma.user.findFirst({
      where: {
        id: partnerId,
        role: { not: 'ADMIN' },
      },
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

    // Filter out actively booked slots
    const bookedSessions = await prisma.mockSession.findMany({
      where: {
        hostId: partnerId,
        status: { in: ['PENDING', 'SCHEDULED'] },
        scheduledTime: { gt: new Date() },
      },
      select: { scheduledTime: true },
    });

    const bookedSlots = bookedSessions.map((s) =>
      s.scheduledTime.toISOString()
    );
    partner.availability = partner.availability.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    return { success: true, partner };
  } catch (error) {
    console.error('getPartnerById error:', error);
    return { success: false, error: 'Failed to fetch partner profile' };
  }
}
