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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#0B1527] mb-2">
            Find a Partner
          </h1>
          <p className="text-[#64748B] text-lg">
            Search and filter to find the perfect peer for your next mock
            interview.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="h-40 flex items-center justify-center text-gray-500">
              Loading filters...
            </div>
          }
        >
          <SearchFilters />
        </Suspense>

        {/* Results List */}
        <div className="space-y-4">
          {result.error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
              {result.error}
            </div>
          ) : result.users.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No partners found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters to find more potential matches.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-500 mb-4">
                Showing {result.users.length} of {result.totalCount} results
              </p>
              <div className="space-y-4">
                {result.users.map((user) => (
                  <PartnerCard key={user.id} user={user} />
                ))}
                <Suspense fallback={<div className="h-8"></div>}>
                  <Pagination
                    currentPage={result.currentPage}
                    totalPages={result.totalPages}
                  />
                </Suspense>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
