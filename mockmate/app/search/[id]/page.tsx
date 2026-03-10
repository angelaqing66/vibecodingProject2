import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';

export default async function PartnerProfileStub({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id } = await params;

  return (
    <div className="min-h-screen bg-[#F3F4FE] flex flex-col items-center justify-center p-8 text-center">
      <span className="text-6xl mb-6">🚧</span>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Partner Profile: {id}
      </h1>
      <p className="text-lg text-gray-600 max-w-lg mb-8">
        This is a stub page for the partner profile and booking flow. In Sprint
        2, this will display the full profile details and availability grid for
        booking.
      </p>
      <Link
        href="/search"
        className="px-6 py-3 bg-[#7C3AED] text-white font-semibold rounded-xl hover:bg-[#6D28D9] transition-colors"
      >
        Back to Search
      </Link>
    </div>
  );
}
