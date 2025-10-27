import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/skeleton";
import { RoleList } from "./_components/role-list";
import { getMenus } from "./_server/menu.service";
import {
  getPermissions,
  groupPermissionsByMenu,
} from "./_server/permission.service";
import { getRoles } from "./_server/role.service";

export default async function RolePage() {
  const t = await getTranslations("dashboard.permission.role");
  return (
    <div className="container mx-auto max-w-6xl justify-start py-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <RoleManagement />
      </Suspense>
    </div>
  );
}

async function RoleManagement() {
  const [roles, { data: menu }, permissions] = await Promise.all([
    getRoles(),
    getMenus({ recursive: true }),
    getPermissions(),
  ]);

  const permissionGroups = await groupPermissionsByMenu(menu, permissions);
  return <RoleList data={roles} menus={menu} permissions={permissionGroups} />;
}
