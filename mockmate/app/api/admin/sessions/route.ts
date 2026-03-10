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
      orderBy: { scheduledTime: 'desc' },
    });

    const formattedSessions = mockSessions.map(
      (s: {
        id: string;
        status: string;
        scheduledTime: Date;
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
        status: s.status,
        scheduledTime: s.scheduledTime.toISOString(),
        requester: {
          id: s.host.id,
          name: s.host.name || 'Unknown',
          level: s.host.experienceLevel || 'Unknown',
        },
        partner: {
          id: s.guest.id,
          name: s.guest.name || 'Unknown',
          level: s.guest.experienceLevel || 'Unknown',
        },
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
