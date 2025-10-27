import {
  index,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type zod from "zod";
import { generateId } from "@/lib/id-generator";

export const menus = pgTable(
  "menus",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$defaultFn(() => generateId()),
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
  (table) => [
    // Index for parent-child relationship lookup
    index("parent_id_idx").on(table.parentId),
    // Composite index for group and order for sorted menu items within groups
    index("group_order_idx").on(table.group, table.order),
    // Index for soft delete queries
    index("deleted_at_idx").on(table.deletedAt),
  ],
);

export const menusSchema = createSelectSchema(menus);
export const menusInsertSchema = createInsertSchema(menus);
export const menusUpdateSchema = createUpdateSchema(menus);

export type TMenu = zod.infer<typeof menusSchema>;
export type TMenuInsert = zod.infer<typeof menusSchema>;
export type TMenuUpdate = zod.infer<typeof menusSchema>;
