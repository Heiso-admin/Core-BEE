import { generateRoleId } from "@heiso/core/lib/id-generator";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgPolicy,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tenantSchema } from "../utils";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type zod from "zod";
import { members } from "./member";
import { roleMenus } from "./role-menus";
import { rolePermissions } from "./role-permission";

export const roles = pgTable(
  "roles",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$default(() => generateRoleId()),
    ...tenantSchema,
    name: varchar("name", { length: 50 }).notNull(),
    description: varchar("description", { length: 255 }),
    fullAccess: boolean("full_access").notNull().default(false),
    loginMethod: varchar("login_method", { length: 20 }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    rolesNameIdx: index("roles_name_idx").on(table.name),
    rolesDeletedAtIdx: index("roles_deleted_at_idx").on(table.deletedAt),
    policy: pgPolicy("tenant_isolation", {
      for: "all",
      to: "public",
      using: sql`${table.tenantId} = current_setting('app.current_tenant_id')`,
      withCheck: sql`${table.tenantId} = current_setting('app.current_tenant_id')`,
    }),
  }),
);

export const enableRoleRls = sql`ALTER TABLE roles ENABLE ROW LEVEL SECURITY; ALTER TABLE roles FORCE ROW LEVEL SECURITY;`;

export const roleRelations = relations(roles, ({ many }) => ({
  menus: many(roleMenus),
  permissions: many(rolePermissions),
  members: many(members),
}));

export const rolesSchema = createSelectSchema(roles);
export const rolesInsertSchema = createInsertSchema(roles);
export const rolesUpdateSchema = createUpdateSchema(roles);

export type TRole = zod.infer<typeof rolesSchema>;
export type TRoleInsert = zod.infer<typeof rolesInsertSchema>;
export type TRoleUpdate = zod.infer<typeof rolesUpdateSchema>;
