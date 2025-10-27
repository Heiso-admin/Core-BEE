import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { menus } from "./menu";
import { roles } from "./role";

export const roleMenus = pgTable(
  "role_menus",
  {
    roleId: varchar("role_id", { length: 20 })
      .references(() => roles.id)
      .notNull(),
    menuId: varchar("menu_id", { length: 20 })
      .references(() => menus.id)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.roleId, table.menuId],
    }),
    // Add indexes for foreign key columns to improve join performance
    index("role_menus_role_id_idx").on(table.roleId),
    index("role_menus_menu_id_idx").on(table.menuId),
  ],
);

export const roleMenusRelations = relations(roleMenus, ({ one }) => ({
  role: one(roles, {
    fields: [roleMenus.roleId],
    references: [roles.id],
  }),
  menus: one(menus, {
    fields: [roleMenus.menuId],
    references: [menus.id],
  }),
}));
