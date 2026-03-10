import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminPage from '@/components/features/admin/AdminPage';

export const metadata = {
  title: 'Admin Panel | MockMate',
  description: 'Manage users and mock interview sessions',
};

export default async function AdminRoute() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // PRD requires role to be ADMIN, otherwise back to dashboard
  if (session.user?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <AdminPage />
  );
}
