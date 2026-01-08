import { TableSkeleton } from "@heiso/core/components/skeleton";
import { Suspense } from "react";
import { RoleList } from "./_components/role-list";
import { getMenus } from "./_server/menu.service";
import {
  getPermissions,
  groupPermissionsByMenu,
} from "./_server/permission.service";
import { getRoles } from "./_server/role.service";

export default async function RolePage() {
  return (
    <div className="flex w-full min-h-full bg-sub-background">
      <div className="main-section-item grow w-full">
        <Suspense fallback={<TableSkeleton />}>
          <RoleManagement />
        </Suspense>
      </div>
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
