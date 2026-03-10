import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import PartnerProfilePage from '@/components/features/search/PartnerProfilePage';

export default async function PartnerProfileRoute({
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
    <PartnerProfilePage partnerId={id} />
  );
}
