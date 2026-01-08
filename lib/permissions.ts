import type { Permission } from "@heiso/core/types/permission";

export function mergePermissions(
  rolePermissions: Permission[],
  customPermissions: Permission[],
): Permission[] {
  const map = new Map<string, Permission>();
  for (const p of [...rolePermissions, ...customPermissions]) {
    map.set(`${p.resource}.${p.action}`, p);
  }
  return Array.from(map.values());
}
