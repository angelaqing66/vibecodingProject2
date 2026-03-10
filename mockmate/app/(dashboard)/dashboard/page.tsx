import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import DashboardPage from '@/components/features/dashboard/DashboardPage';

export const metadata = {
    title: 'Dashboard | MockMate',
    description: 'Manage your mock interview sessions',
};

export default async function DashboardRoute() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return (
        <DashboardPage />
    );
}
