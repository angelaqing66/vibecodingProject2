import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as { role?: string }).role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const mockSessions = await prisma.mockSession.findMany({
      include: {
        host: { select: { id: true, name: true, experienceLevel: true } },
        guest: { select: { id: true, name: true, experienceLevel: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedSessions = mockSessions.map(
      (s: {
        id: string;
        interviewType: string;
        status: string;
        meetingLink: string | null;
        notes: string | null;
        scheduledTime: Date;
        createdAt: Date;
        host: {
          id: string;
          name: string | null;
          experienceLevel: string | null;
        };
        guest: {
          id: string;
          name: string | null;
          experienceLevel: string | null;
        };
      }) => ({
        id: s.id,
        interviewType: s.interviewType,
        status: s.status,
        meetingLink: s.meetingLink,
        notes: s.notes,
        timeSlot: {
          id: 'legacy',
          dayOfWeek: s.scheduledTime.getDay(),
          period: 'MORNING',
          isBooked: true,
        }, // Defaulted timeslot values ensuring data consistency
        requester: {
          id: s.host.id,
          name: s.host.name || 'Unknown',
          level: s.host.experienceLevel || 'INTERN',
        },
        partner: {
          id: s.guest.id,
          name: s.guest.name || 'Unknown',
          level: s.guest.experienceLevel || 'INTERN',
        },
        createdAt: s.createdAt.toISOString(),
      })
    );

    return NextResponse.json({ success: true, data: formattedSessions });
  } catch (error) {
    console.error('GET /api/admin/sessions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
