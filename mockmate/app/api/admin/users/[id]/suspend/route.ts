import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // NOTE: The 'suspended' column was removed from the User model (see schema.prisma).
    // This endpoint is preserved for the admin UI but is a no-op until
    // the field is restored. Return the id to keep the API surface stable.
    return NextResponse.json({ success: true, data: { id, suspended: false } });
  } catch (error) {
    console.error('PUT /api/admin/users/[id]/suspend error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
