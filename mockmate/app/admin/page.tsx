import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import AdminPage from '@/components/features/admin/AdminPage';

export const metadata = {
  title: 'Admin Panel | MockMate',
  description: 'MockMate admin panel',
};

export default async function AdminRoute() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const userRole = (session.user as { role?: string })?.role;
  if (userRole !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <AdminPage />;
}
