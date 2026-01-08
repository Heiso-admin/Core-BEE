// import { db } from '@heiso/core/lib/db';
// import { menus } from '@heiso/core/lib/db/schema';
// import { eq } from 'drizzle-orm';

// export async function getMenus() {
//   return await db.select().from(menus);
// }

// export async function addMenus(newMenu: any) {
//   return await db.insert(menus).values(newMenu);
// }

// export async function updateMenu(id: string, body: any) {
//   return await db.update(menus).set(body).where(eq(menus.id, body.id));
// }

// export async function reorderMenus(
//   data: Array<{
//     id: string;
//     order: number;
//   }>
// ) {
//   return await db.transaction(async (tx) => {
//     for (const { id, order } of data) {
//       await tx.update(menus).set({ order }).where(eq(menus.id, id));
//     }
//   });
// }

// export async function deleteMenu(id: string) {
//   return await updateMenu(id, { deletedAt: new Date() });
// }
