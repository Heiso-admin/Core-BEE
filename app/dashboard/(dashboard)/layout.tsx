import { Layout } from "@heiso/core/components/primitives/layout";
import type { UserAvatarMenuItem } from "@heiso/core/components/primitives/user-avatar";
import { LayoutSkeleton } from "@heiso/core/components/skeleton";
import { findMenus, groupMenuItems } from "@heiso/core/lib/tree";
import { auth } from "@heiso/core/modules/auth/auth.config";
import { PermissionProvider } from "@heiso/core/providers/permission";
import type { Navigation } from "@heiso/core/types/client";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getMyMembership, getMyMenus } from "./_server/membership.service";

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

  // Zombie Session Check: If no membership record found, force signout
  // This handles cases where DB is reset but Browser Cookie remains.
  // if (!membership.id) {
  //   const { headers } = await import("next/headers");
  //   const { redirect } = await import("next/navigation");
  //   const h = await headers();
  //   const host = h.get("x-forwarded-host") || h.get("host");
  //   const proto = h.get("x-forwarded-proto") || "http";
  //   const callbackUrl = `${proto}://${host}/login`;
  //   redirect(`/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  // }

  // // 若非開發者，且尚未加入（無 membership 或 status !== 'joined'），強制導向 Join 頁
  // if (!membership.isDeveloper && (!membership?.id || membership?.status !== 'joined')) {
  //   const cookieStore = await cookies();
  //   const joinToken = cookieStore.get('join-token');
  //   if (joinToken) {
  //     redirect(`/join?token=${joinToken.value}`);
  //   }
  //   redirect('/join');
  // }
  const hasFullAccess =
    membership.isDeveloper === true ||
    membership.isOwner === true ||
    membership.role?.fullAccess === true;

  // Get translations
  const t = await getTranslations("dashboard.userMenu");
  const tn = await getTranslations("dashboard.nav");

  // Build navigation menu
  const menu = await getMyMenus({
    fullAccess: hasFullAccess,
    roleId: membership?.roleId,
  });

  console.log("menu: ", menu);

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
      id: "user",
      type: "Group",
      group: [
        // {
        //   id: 'dashboard',
        //   text: t('dashboard'),
        //   href: '/dashboard',
        //   type: 'Link',
        // },
        {
          id: "accountSettings",
          text: t("accountSettings"),
          href: "/account/me",
          type: "Link",
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
      id: "separator2",
      type: "Separator",
    },
    // {
    //   id: 'homePage',
    //   text: t('homePage'),
    //   href: '/',
    //   type: 'Link',
    // },
    {
      id: "logOut",
      text: t("logOut"),
      type: "LogOut",
    },
  ] satisfies UserAvatarMenuItem[];

  if (membership.isDeveloper) {
    userAvatarMenu[0].group?.push({
      id: "dev-center",
      text: t("developer"),
      href: "/dev-center",
      type: "Link",
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
