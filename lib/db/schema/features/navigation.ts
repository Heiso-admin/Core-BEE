import { generateId, generateNavigationId } from "@heiso/core/lib/id-generator";
import { relations } from "drizzle-orm";
import {
  boolean,
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

export const navigations = pgTable(
  "navigations",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$default(() => generateNavigationId()),
    ...tenantSchema,
    userId: varchar("user_id", { length: 20 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    parentId: varchar("parent_id", { length: 20 }),
    description: varchar("description", { length: 255 }),
    // status: varchar('status', { length: 20 }).notNull().default('active'), // active, inactive
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    navigationsSlugIdx: index("navigations_slug_idx").on(table.slug),
    // Index for faster tree structure queries
    // Index for soft delete queries
    navigationsDeletedAtIdx: index("navigations_deleted_at_idx").on(table.deletedAt),
    policy: pgPolicy("tenant_isolation", {
      for: "all",
      to: "public",
      using: sql`${table.tenantId} = current_setting('app.current_tenant_id')`,
      withCheck: sql`${table.tenantId} = current_setting('app.current_tenant_id')`,
    }),
  }),
);

export const navigationMenus = pgTable(
  "navigation_menus",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$default(() => generateId()),
    ...tenantSchema,
    navigationId: varchar("navigation_id", { length: 20 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    group: varchar("group", { length: 100 }),
    title: varchar("title", { length: 100 }).notNull(),
    subTitle: varchar("sub_title", { length: 100 }),
    icon: varchar("icon", { length: 255 }),
    linkType: varchar("link_type", { length: 20 }).notNull().default("none"), // none, link, pages,  articles
    link: varchar("link", { length: 255 }).notNull(),
    enabled: boolean("enabled").notNull().default(true),
    parentId: varchar("parent_id", { length: 20 }),
    order: integer("order_number"),
    // status: varchar('status', { length: 20 }).notNull().default('active'), // active, inactive
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    navigationMenusSlugIdx: index("navigation_menus_slug_idx").on(table.slug),
    // Index for faster tree structure queries
    navigationMenusParentIdIdx: index("navigation_menus_parent_id_idx").on(table.parentId),
    // Index for soft delete queries
    navigationMenusDeletedAtIdx: index("navigation_menus_deleted_at_idx").on(table.deletedAt),
    policy: pgPolicy("tenant_isolation", {
      for: "all",
      to: "public",
      using: sql`${table.tenantId} = current_setting('app.current_tenant_id')`,
      withCheck: sql`${table.tenantId} = current_setting('app.current_tenant_id')`,
    }),
  }),
);

export const enableNavigationRls = sql`
  ALTER TABLE "navigations" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigations" FORCE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_menus" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_menus" FORCE ROW LEVEL SECURITY;
`;

export const navigationsRelations = relations(navigations, ({ many }) => ({
  menus: many(navigationMenus),
}));

export const navigationMenuRelations = relations(
  navigationMenus,
  ({ one }) => ({
    navigation: one(navigations, {
      fields: [navigationMenus.navigationId],
      references: [navigations.id],
    }),
  }),
);

export const navigationsSchema = createSelectSchema(navigations);
export const navigationInsertSchema = createInsertSchema(navigations);
export const navigationUpdateSchema = createUpdateSchema(navigations);

export const navigationMenusSchema = createSelectSchema(navigationMenus);
export const navigationMenuInsertSchema = createInsertSchema(navigationMenus);
export const navigationMenuUpdateSchema = createUpdateSchema(navigationMenus);

export type TNavigation = zod.infer<typeof navigationsSchema>;
export type TNavigationInsert = zod.infer<typeof navigationInsertSchema>;
export type TNavigationUpdate = zod.infer<typeof navigationUpdateSchema>;

export type TNavigationMenu = zod.infer<typeof navigationMenusSchema>;
export type TNavigationMenuInsert = zod.infer<
  typeof navigationMenuInsertSchema
>;
export type TNavigationMenuUpdate = zod.infer<
  typeof navigationMenuUpdateSchema
>;
