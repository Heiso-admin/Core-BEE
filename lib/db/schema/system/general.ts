import {
  index,
  json,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type zod from "zod";

export const generalSettings = pgTable(
  "general_settings",
  {
    name: varchar("name", { length: 100 }).primaryKey(),
    value: json("value").notNull(),
    description: varchar("description", { length: 255 }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("general_settings_deleted_at_idx").on(t.deletedAt)],
);

export const generalSettingsSchema = createSelectSchema(generalSettings);
export const generalSettingsInsertSchema = createInsertSchema(generalSettings);
export const generalSettingsUpdateSchema = createUpdateSchema(generalSettings);

export type TGeneralSetting = zod.infer<typeof generalSettingsSchema>;
export type TGeneralSettingInsert = zod.infer<
  typeof generalSettingsInsertSchema
>;
export type TGeneralSettingUpdate = zod.infer<
  typeof generalSettingsUpdateSchema
>;
