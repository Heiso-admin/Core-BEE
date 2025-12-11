import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ClientRedirect } from '@/components/primitives/redirect.client';
import { auth } from '@/modules/auth/auth.config';
import {
  getMyMembership,
  getMyMenus,
  getUser,
} from './_server/membership.service';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const headerList = await headers();
  const pathname = headerList.get('x-current-pathname');
  const joinToken = cookieStore.get('join-token');

  if (joinToken) {
    redirect(`/join?token=${joinToken.value}`);
  }

  const session = await auth();
  if (!session?.user) return null;

  const me = await getUser();
  if (me?.mustChangePassword) {
    redirect('/auth/change-password');
  }

  const membership = await getMyMembership();
  const hasFullAccess =
    membership.isDeveloper === true ||
    membership.isOwner === true ||
    membership.role?.fullAccess === true;

  const menu = await getMyMenus({
    fullAccess: hasFullAccess,
    roleId: membership?.roleId,
  });

  if (
    (pathname === '/dashboard' || pathname === '/dashboard/') &&
    menu?.length &&
    menu[0].path
  ) {
    return <ClientRedirect url={`/dashboard${menu[0].path}`} />;
  }

  return null;
}
