import { Suspense } from "react";
import { PermissionCard } from "@/components/primitives";
import { getMenus } from "./_server/menu.service";
import {
  getPermissions,
  groupPermissionsByMenu,
} from "./_server/permission.service";

export default async function PermissionPage() {
  const menus = await getMenus();
  const permissions = await getPermissions();
  const permissionGroups = await groupPermissionsByMenu(menus, permissions);
  
  return (
    <div className="container mx-auto p-6 mb-15">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Permissions</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Suspense fallback={<div>Loading...</div>}>
          {permissionGroups?.map((permission, i) => (
            <PermissionCard
              permissionGroup={permission}
              key={i}
              // selectable={true}
              editable={true}
            />
          ))}
        </Suspense>

      </div>
    </div>
  );
}
