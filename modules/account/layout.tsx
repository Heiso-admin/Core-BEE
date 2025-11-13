import { getTranslations } from "next-intl/server";
import { auth } from '@/modules/auth/auth.config';
import { Layout } from "@/components/primitives/layout";
import type { UserAvatarMenuItem } from "@/components/primitives/user-avatar";
import type { Navigation } from "@/types/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const t = await getTranslations("account.layout");

  const navigation: Navigation = {
    rootPath: "/account",
    items: [
      {
        id: "preferences",
        title: t("navigation.preferences"),
        path: "/me",
        icon: "user-round-cog",
      },
      {
        id: "Authentication",
        title: t("navigation.authentication"),
        path: "/authentication",
        icon: "shield-user",
      },
    ],
  };

  const userAvatarMenu = [
    {
      id: "user",
      type: "Group",
      group: [
        {
          id: "dashboard",
          text: t("userMenu.dashboard"),
          href: "/dashboard",
          type: "Link",
        },
        // {
        //   id: 'accountSettings',
        //   text: 'Account Settings',
        //   href: '/account/me',
        //   type: 'Link',
        // },
      ],
    },
    {
      id: "separator1",
      type: "Separator",
    },
    // {
    //   id: 'theme',
    //   text: 'Theme',
    //   type: 'Theme',
    // },
    // {
    //   id: 'separator2',
    //   type: 'Separator',
    // },
    // {
    //   id: 'homePage',
    //   text: 'Home Page',
    //   href: '/',
    //   type: 'Link',
    // },
    {
      id: "logOut",
      text: t("userMenu.logOut"),
      type: "LogOut",
    },
  ] satisfies UserAvatarMenuItem[];

  return (
    <Layout
      breadcrumb={{
        items: [
          {
            title: t("breadcrumb.account"),
            link: "/account",
          },
        ],
      }}
      navigation={navigation}
      menu={userAvatarMenu}
    >
      {children}
    </Layout>
  );
}
