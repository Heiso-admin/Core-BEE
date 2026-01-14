import { generateId } from "@heiso/core/lib/id-generator";
import {
  index,
  integer,
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

export const menus = pgTable(
  "menus",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    ...tenantSchema,
    title: varchar("title", { length: 100 }).notNull(),
    path: varchar("path", { length: 255 }),
    icon: varchar("icon", { length: 50 }),
    group: varchar("group", { length: 20 }),
    parentId: varchar("parent_id", { length: 20 }),
    order: integer("order_number"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    parentIdIdx: index("parent_id_idx").on(table.parentId),
    groupOrderIdx: index("group_order_idx").on(table.group, table.order),
    deletedAtIdx: index("deleted_at_idx").on(table.deletedAt),
    policy: pgPolicy("tenant_isolation", {
      for: "all",
      to: "public",
      using: sql`${table.tenantId} = current_setting('app.current_tenant_id')`,
      withCheck: sql`${table.tenantId} = current_setting('app.current_tenant_id')`,
    }),
  }),
);

export const enableMenuRls = sql`ALTER TABLE menus ENABLE ROW LEVEL SECURITY; ALTER TABLE menus FORCE ROW LEVEL SECURITY;`;

export const menusSchema = createSelectSchema(menus);
export const menusInsertSchema = createInsertSchema(menus);
export const menusUpdateSchema = createUpdateSchema(menus);

export type TMenu = zod.infer<typeof menusSchema>;
export type TMenuInsert = zod.infer<typeof menusSchema>;
export type TMenuUpdate = zod.infer<typeof menusSchema>;
