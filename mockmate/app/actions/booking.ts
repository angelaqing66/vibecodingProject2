'use server';

import prisma from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const bookingSchema = z.object({
    hostId: z.string().min(1, 'Host ID is required'),
    scheduledTime: z.string().datetime({ message: 'Invalid scheduled time format' }),
    message: z.string().max(500, 'Message cannot exceed 500 characters').optional().nullable(),
});

export async function bookSession(data: {
    hostId: string;
    scheduledTime: string;
    message?: string | null;
}) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return { success: false, error: 'Unauthorized' };
    }

    const guestId = session.user.id;

    if (data.hostId === guestId) {
        return { success: false, error: 'You cannot book a session with yourself' };
    }

    try {
        const validatedData = bookingSchema.parse({
            hostId: data.hostId,
            scheduledTime: data.scheduledTime,
            message: data.message || null,
        });

        // Check if the host actually exists and has this availability
        const host = await prisma.user.findUnique({
            where: { id: validatedData.hostId },
            select: { availability: true },
        });

        if (!host) {
            return { success: false, error: 'Host not found' };
        }

        // Verify the requested time is still in their availability list
        if (!host.availability.includes(validatedData.scheduledTime)) {
            return { success: false, error: 'This time slot is no longer available' };
        }

        // Since we don't immediately remove the slot from availability (per requirements, it stays until ACCEPTED),
        // we should prevent the *same* user from booking the *same* slot twice.
        const existingRequest = await prisma.mockSession.findFirst({
            where: {
                hostId: validatedData.hostId,
                guestId: guestId,
                scheduledTime: new Date(validatedData.scheduledTime),
                status: { in: ['PENDING', 'SCHEDULED'] }
            }
        });

        if (existingRequest) {
            return { success: false, error: 'You have already requested or booked this slot' };
        }

        // Create the session!
        const newSession = await prisma.mockSession.create({
            data: {
                hostId: validatedData.hostId,
                guestId: guestId,
                scheduledTime: new Date(validatedData.scheduledTime),
                status: 'PENDING',
                message: validatedData.message,
            },
        });

        return { success: true, session: newSession };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0].message };
        }
        if (error instanceof Error) {
            console.error('bookSession error:', error.message);
            return { success: false, error: `Server error: ${error.message}` };
        }
        console.error('bookSession error:', error);
        return { success: false, error: 'Failed to book session: ' + String(error) };
    }
}
