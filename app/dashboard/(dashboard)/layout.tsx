import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { auth } from '@/app/(auth)/auth.config';
import { Layout } from '@/components/primitives';
import type { UserAvatarMenuItem } from '@/components/primitives/user-avatar';
import { LayoutSkeleton } from '@/components/skeleton';
import { findMenus, groupMenuItems } from '@/lib/tree';
import { PermissionProvider } from '@/providers/permission';
import type { Navigation } from '@/types/client';
import { getMyMembership, getMyMenus } from './_server/membership.service';

interface OrgLayoutProps {
  children: React.ReactNode;
}

export default async function OrgLayout({ children }: OrgLayoutProps) {
  // Authentication check
  const session = await auth();
  if (!session?.user) return null;

  // Get organization data
  return (
    <Suspense fallback={<LayoutSkeleton />}>
      <OrgLayoutWrap>{children}</OrgLayoutWrap>
    </Suspense>
  );
}

async function OrgLayoutWrap({ children }: { children: React.ReactNode }) {
  // Get user membership and permissions
  const membership = await getMyMembership();
  const hasFullAccess =
    membership.isDeveloper === true ||
    membership.isOwner === true ||
    membership.role?.fullAccess === true;

  // Get translations
  const t = await getTranslations('dashboard.userMenu');
  const tn = await getTranslations('dashboard.nav');

  // Build navigation menu
  const menu = await getMyMenus({
    fullAccess: hasFullAccess,
    roleId: membership?.roleId,
  });

  const navigation: Navigation = {
    rootPath: `/dashboard`,
    items: groupMenuItems(findMenus(menu, null, { level: 1 })),
  };

  navigation.items = navigation.items.map((item) => {
    if (Array.isArray(item)) {
      return item.map((subItem) => ({
        ...subItem,
        title: subItem.title ? tn(subItem.title) : subItem.title,
      }));
    }
    return {
      ...item,
      title: item.title ? tn(item.title) : item.title,
    };
  });

  const userAvatarMenu = [
    {
      id: 'user',
      type: 'Group',
      group: [
        // {
        //   id: 'dashboard',
        //   text: t('dashboard'),
        //   href: '/dashboard',
        //   type: 'Link',
        // },
        {
          id: 'accountSettings',
          text: t('accountSettings'),
          href: '/account/me',
          type: 'Link',
        },
      ],
    },
    // {
    //   id: 'separator1',
    //   type: 'Separator',
    // },
    // {
    //   id: 'theme',
    //   text: t('theme'),
    //   type: 'Theme',
    // },
    {
      id: 'separator2',
      type: 'Separator',
    },
    // {
    //   id: 'homePage',
    //   text: t('homePage'),
    //   href: '/',
    //   type: 'Link',
    // },
    {
      id: 'logOut',
      text: t('logOut'),
      type: 'LogOut',
    },
  ] satisfies UserAvatarMenuItem[];

  if (membership.isDeveloper) {
    userAvatarMenu[0].group?.push({
      id: 'dev-center',
      text: t('developer'),
      href: '/dev-center',
      type: 'Link',
    });
  }

  return (
    <PermissionProvider>
      <Layout navigation={navigation} menu={userAvatarMenu}>
        {children}
      </Layout>
    </PermissionProvider>
  );
}
