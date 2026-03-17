import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import SearchPage from '@/components/features/search/SearchPage';

export const metadata = {
  title: 'Find Partners | MockMate',
  description: 'Search and filter practice partners for mock interviews',
};

export default async function SearchRoute() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <SearchPage />;
}
