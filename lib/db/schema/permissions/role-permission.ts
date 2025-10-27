import { relations } from "drizzle-orm";
import { index, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { permissions } from "./permission";
import { roles } from "./role";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: varchar("role_id", { length: 20 })
      .references(() => roles.id)
      .notNull(),
    permissionId: varchar("permission_id", { length: 20 })
      .references(() => permissions.id)
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    // Add indexes for foreign key columns to improve query performance
    index("role_permissions_role_id_idx").on(table.roleId),
    index("role_permissions_permission_id_idx").on(table.permissionId),
  ],
);

export const rolePermissionsRelations = relations(
  rolePermissions,
  ({ one }) => ({
    role: one(roles, {
      fields: [rolePermissions.roleId],
      references: [roles.id],
    }),
    permission: one(permissions, {
      fields: [rolePermissions.permissionId],
      references: [permissions.id],
    }),
  }),
);
