import { Suspense, use } from 'react';
import { auth } from '@/modules/auth/auth.config';
import { Layout } from '@/components/primitives/layout';
import type { UserAvatarMenuItem } from '@/components/primitives/user-avatar';
import type { Navigation } from '@/types/client';

const nav: Navigation = {
  rootPath: '/dev-center',
  items: [
    // {
    //   id: 'Overview',
    //   title: 'Overview',
    //   path: '',
    //   icon: 'home',
    // },
    [
      {
        id: 'Developers',
        title: 'Developers',
        path: '/developers',
        icon: 'user-round-plus',
      },
    ],
    [
      {
        id: 'Menu',
        title: 'Menu',
        path: '/menu',
        icon: 'menu',
      },
    ],
    [
      {
        id: 'Permission',
        title: 'Permission',
        path: '/permission',
        icon: 'user-lock',
      },
    ],
    [
      {
        id: 'API Keys',
        title: 'API Keys',
        path: `/api-keys`,
        icon: 'globe-lock',
      },
      {
        id: 'API docs',
        title: 'API Docs',
        path: '/../../api/docs',
        icon: 'book-text',
      },
    ],
    [
      {
        id: 'AI Usage',
        title: 'AI Usage',
        path: `/ai/usage`,
        icon: 'chart-line',
      },
    ],
    [
      {
        id: 'Keys',
        title: 'Keys',
        path: '/key',
        icon: 'key',
      },

      {
        id: 'Settings',
        title: 'Settings',
        path: '/settings',
        icon: 'settings',
      },
    ],
  ],
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isDeveloper = session?.user?.isDeveloper;

  const userAvatarMenu = [
    {
      id: 'user',
      type: 'Group',
      group: [
        {
          id: 'dashboard',
          text: 'Dashboard',
          href: '/dashboard',
          type: 'Link',
        },
        {
          id: 'accountSettings',
          text: 'Account Settings',
          href: '/account/me',
          type: 'Link',
        },
      ],
    },
    {
      id: 'separator1',
      type: 'Separator',
    },
    {
      id: 'theme',
      text: 'Theme',
      type: 'Theme',
    },
    {
      id: 'separator2',
      type: 'Separator',
    },
    {
      id: 'homePage',
      text: 'Home Page',
      href: '/',
      type: 'Link',
    },
    {
      id: 'logOut',
      text: 'Log out',
      type: 'LogOut',
    },
  ] satisfies UserAvatarMenuItem[];

  if (isDeveloper) {
    userAvatarMenu[0].group?.push({
      id: 'dev-center',
      text: 'Dev Center',
      href: '/dev-center',
      type: 'Link',
    });
  }

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Loading ...
        </div>
      }
    >
      <Layout
        breadcrumb={{
          items: [
            {
              title: 'Dev Center',
            },
          ],
        }}
        navigation={isDeveloper ? nav : undefined}
        menu={userAvatarMenu}
      >
        {!isDeveloper ? (
          <div className="h-full flex items-center justify-center">
            Only admin can access this area
          </div>
        ) : (
          children
        )}
      </Layout>
    </Suspense>
  );
}
