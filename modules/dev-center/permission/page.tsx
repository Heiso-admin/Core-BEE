import { PermissionCard } from "@heiso/core/components/primitives";
import { permissionsConfig, type PermissionConfigShape } from "@heiso/core/config/permissions";
import { Suspense } from "react";
import { getMenus } from "@heiso/core/modules/dev-center/permission/_server/menu.service";
import {
  getPermissions,
  groupPermissionsByMenu,
} from "@heiso/core/modules/dev-center/permission/_server/permission.service";

export default async function PermissionPage() {
  const menus = await getMenus();
  // 使用 config/permissions.ts 的靜態資料，並對應 menu id
  const permissions = (permissionsConfig as readonly PermissionConfigShape[]).map((p) => {
    return {
      id: p.id,
      resource: p.resource,
      action: p.action,
      menuId: p.menu?.id ?? null,
    };
  });
  const dbPermissions = await getPermissions();
  const permissionGroups = await groupPermissionsByMenu(
    menus,
    permissions,
    dbPermissions,
  );

  return (
    <div className="container mx-auto p-6 mb-15">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Permissions</h1>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<div>Loading...</div>}>
          {permissionGroups?.map((permission) => (
            <PermissionCard permissionGroup={permission} key={permission.id} />
          ))}
        </Suspense>
      </div>
    </div>
  );
}
