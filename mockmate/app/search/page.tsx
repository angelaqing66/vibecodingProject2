import { Suspense } from 'react';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { searchPartners } from '@/app/actions/search';
import { PartnerCard } from '@/components/ui/PartnerCard';
import { SearchFilters } from '@/components/ui/SearchFilters';
import { Pagination } from '@/components/ui/Pagination';

// This is a Server Component. Next.js App Router passes searchParams as a prop to page components.
// We make them async so we can await the params or fetch data.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession(authOptions);

  // Fallback protection if middleware misses
  if (!session) {
    redirect('/login');
  }

  const awaitedParams = await searchParams;

  // Parse URL parameters
  const page =
    typeof awaitedParams.page === 'string'
      ? parseInt(awaitedParams.page, 10)
      : 1;
  const name = typeof awaitedParams.name === 'string' ? awaitedParams.name : '';
  const experienceLevel =
    typeof awaitedParams.experienceLevel === 'string'
      ? awaitedParams.experienceLevel
      : '';
  const interviewType =
    typeof awaitedParams.interviewType === 'string'
      ? awaitedParams.interviewType
      : '';

  const limit = 5; // results per page

  // Fetch data server-side
  const result = await searchPartners({
    page,
    limit,
    name,
    experienceLevel,
    interviewType,
  });

  return (
    <div className="min-h-screen bg-[#F3F4FE]">
      {/* Simple Navbar placeholder for Search Page */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
            {/* A real app might have a dropdown or complete nav here */}
          </div>
        </div>
      </header>

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
