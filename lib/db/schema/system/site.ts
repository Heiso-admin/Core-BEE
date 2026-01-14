import { index, json, pgPolicy, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tenantSchema } from "../utils";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type zod from "zod";

export const siteSettings = pgTable(
  "site_settings",
  {
    ...tenantSchema,
    name: varchar("name", { length: 100 }).notNull(),
    value: json("value").notNull(),
    description: varchar("description", { length: 255 }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.tenantId, t.name] }),
    siteSettingsDeletedAtIdx: index("site_settings_deleted_at_idx").on(t.deletedAt),
    policy: pgPolicy("tenant_isolation", {
      for: "all",
      to: "public",
      using: sql`${t.tenantId} = current_setting('app.current_tenant_id')`,
      withCheck: sql`${t.tenantId} = current_setting('app.current_tenant_id')`,
    }),
  }),
);

export const enableSiteSettingRls = sql`
  ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" FORCE ROW LEVEL SECURITY;
`;

export const siteSettingsSchema = createSelectSchema(siteSettings);
export const siteSettingsInsertSchema = createInsertSchema(siteSettings);
export const siteSettingsUpdateSchema = createUpdateSchema(siteSettings);

export type TSiteSetting = zod.infer<typeof siteSettingsSchema>;
export type TSiteSettingInsert = zod.infer<typeof siteSettingsInsertSchema>;
export type TSiteSettingUpdate = zod.infer<typeof siteSettingsUpdateSchema>;
