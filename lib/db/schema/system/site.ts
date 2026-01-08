import { index, json, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type zod from "zod";

export const siteSettings = pgTable(
  "site_settings",
  {
    name: varchar("name", { length: 100 }).primaryKey(),
    value: json("value").notNull(),
    description: varchar("description", { length: 255 }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("site_settings_deleted_at_idx").on(t.deletedAt)],
);

export const siteSettingsSchema = createSelectSchema(siteSettings);
export const siteSettingsInsertSchema = createInsertSchema(siteSettings);
export const siteSettingsUpdateSchema = createUpdateSchema(siteSettings);

export type TSiteSetting = zod.infer<typeof siteSettingsSchema>;
export type TSiteSettingInsert = zod.infer<typeof siteSettingsInsertSchema>;
export type TSiteSettingUpdate = zod.infer<typeof siteSettingsUpdateSchema>;
