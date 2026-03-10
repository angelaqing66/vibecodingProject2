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

  return (
    <div className="min-h-screen bg-[#F3F4FE]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-xl font-extrabold text-[#0B1527] tracking-tight">
              MockMate
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">
              Hi, {session.user?.name || 'User'}
            </span>
          </div>
        </div>
      </header>
      </header>
      <SearchPage />
    </div >
  );
}
