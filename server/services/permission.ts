"use server";

import { auth } from "@/app/(auth)/auth.config";
import * as roleService from "./role";

const permissionCache = new Map<string, roleService.UserPermission>();

export async function getUserPermissions() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const cached = permissionCache.get(userId);
  if (cached) return cached;
  const permissions = await roleService.findUserPermissions(userId);
  permissionCache.set(userId, permissions);
  return permissions;
}

// export async function filterMenuByPermission(
// 	userId: string,
// 	menus: MenuItem[],
// ): Promise<MenuItem[]> {
// 	const result: MenuItem[] = [];

// 	for (const item of menus) {
// 		const hasAccess =
// 			!item.permission ||
// 			(await can(userId, item.permission.resource, item.permission.action));

// 		if (!hasAccess) continue;

// 		const children = item.children
// 			? await filterMenuByPermission(userId, item.children)
// 			: [];

// 		result.push({ ...item, children });
// 	}

// 	return result;
// }
