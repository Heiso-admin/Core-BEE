import { ClientRedirect } from "@heiso/core/components/primitives/redirect.client";
import { auth } from "@heiso/core/modules/auth/auth.config";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getMyMembership,
  getMyMenus,
  getUser,
} from "./_server/membership.service";

export default async function DashboardPage() {
  const headerList = await headers();
  const pathname = headerList.get("x-current-pathname");

  const session = await auth();
  if (!session?.user) return null;

  const me = await getUser();
  if (me?.mustChangePassword) {
    redirect("/auth/change-password");
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
    (pathname === "/dashboard" || pathname === "/dashboard/") &&
    menu?.length &&
    menu[0].path
  ) {
    return <ClientRedirect url={`/dashboard${menu[0].path}`} />;
  }

  return null;
}
