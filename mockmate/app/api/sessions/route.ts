import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const currentUserId = (session.user as { id?: string }).id;
        if (!currentUserId) {
            return NextResponse.json({ success: false, error: 'User ID not found in session' }, { status: 401 });
        }

        const body = await request.json();
        const { hostId, scheduledTime, notes } = body as {
            hostId: string;
            scheduledTime: string;
            notes?: string;
        };

        if (!hostId || !scheduledTime) {
            return NextResponse.json(
                { success: false, error: 'hostId and scheduledTime are required' },
                { status: 400 }
            );
        }

        // Prevent booking yourself
        if (hostId === currentUserId) {
            return NextResponse.json(
                { success: false, error: 'You cannot book a session with yourself' },
                { status: 400 }
            );
        }

        // Verify the host exists and has this slot available
        const host = await prisma.user.findUnique({
            where: { id: hostId },
            select: { id: true, name: true, availability: true, zoomLink: true },
        });

        if (!host) {
            return NextResponse.json({ success: false, error: 'Partner not found' }, { status: 404 });
        }

        const slotTime = new Date(scheduledTime);

        // Check if slot is genuinely in host's availability
        const slotExists = host.availability.some((a: string) => {
            try { return new Date(a).getTime() === slotTime.getTime(); } catch { return false; }
        });
        if (!slotExists) {
            return NextResponse.json(
                { success: false, error: 'Selected time slot is not available' },
                { status: 409 }
            );
        }

        // Check if this slot is already booked
        const existingSession = await prisma.mockSession.findFirst({
            where: {
                hostId,
                scheduledTime: slotTime,
                status: { in: ['PENDING', 'SCHEDULED'] },
            },
        });

        if (existingSession) {
            return NextResponse.json(
                { success: false, error: 'This slot is already booked. Please choose another time.' },
                { status: 409 }
            );
        }

        // Create the session
        const newSession = await prisma.mockSession.create({
            data: {
                hostId,
                guestId: currentUserId,
                scheduledTime: slotTime,
                status: 'PENDING',
                ...(notes ? { notes } : {}),
            },
            include: {
                host: { select: { id: true, name: true, zoomLink: true } },
                guest: { select: { id: true, name: true } },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: newSession.id,
                scheduledTime: newSession.scheduledTime.toISOString(),
                status: newSession.status,
                meetingLink: newSession.host.zoomLink,
                hostName: newSession.host.name,
                guestName: newSession.guest.name,
            },
        });
    } catch (error) {
        console.error('POST /api/sessions error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as { id?: string }).id;
        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID not found' }, { status: 401 });
        }

        const sessions = await prisma.mockSession.findMany({
            where: {
                OR: [{ hostId: userId }, { guestId: userId }],
            },
            include: {
                host: { select: { id: true, name: true, zoomLink: true } },
                guest: { select: { id: true, name: true } },
            },
            orderBy: { scheduledTime: 'asc' },
        });

        return NextResponse.json({ success: true, data: sessions });
    } catch (error) {
        console.error('GET /api/sessions error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
