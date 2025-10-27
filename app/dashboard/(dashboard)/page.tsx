import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth.config';
import { ProjectSkeleton } from '@/components/skeleton';
import { Overview } from './_components/overview';
import {
  getMyMembership,
  getMyMenus,
  getUser,
} from './_server/membership.service';
import { getOverviewInfo } from './_server/overview.service';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const headerList = await headers();
  const pathname = headerList.get('x-current-pathname');
  const joinToken = cookieStore.get('join-token');

  if (joinToken) {
    redirect(`/dashboard/join?token=${joinToken.value}`);
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
    !hasFullAccess &&
    (pathname === '/dashboard' || pathname === '/dashboard/') &&
    menu?.length &&
    menu[0].path
  ) {
    redirect(`/dashboard/${menu[0].path}`);
  }

  return (
    <Suspense fallback={<ProjectSkeleton />}>
      <ProjectOverview />
    </Suspense>
  );
}

async function ProjectOverview() {
  // const overview = await getOverviewInfo();
  return <Overview />;
}
