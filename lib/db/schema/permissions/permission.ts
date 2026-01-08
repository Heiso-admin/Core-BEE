import { generatePermissionId } from "@heiso/core/lib/id-generator";
import { relations } from "drizzle-orm";
import { index, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type zod from "zod";
import { menus } from "./menu";

export const permissions = pgTable(
  "permissions",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$default(() => generatePermissionId()),
    menuId: varchar("menu_id", { length: 20 }).references(() => menus.id),
    resource: varchar("resource", { length: 100 }).notNull(), // e.g., "user.add"
    action: varchar("action", { length: 20 }).notNull(), // e.g., "view", "click"
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("permissions_menu_id_idx").on(table.menuId),
    index("permissions_resource_action_idx").on(table.resource, table.action),
  ],
);

export const PermissionsRelations = relations(permissions, ({ one }) => ({
  menus: one(menus, {
    fields: [permissions.menuId],
    references: [menus.id],
  }),
}));

export const permissionsSchema = createSelectSchema(permissions);
export const permissionsInsertSchema = createInsertSchema(permissions);
export const permissionsUpdateSchema = createUpdateSchema(permissions);

export type TPermission = zod.infer<typeof permissionsSchema>;
export type TPermissionInsert = zod.infer<typeof permissionsInsertSchema>;
export type TPermissionUpdate = zod.infer<typeof permissionsUpdateSchema>;
