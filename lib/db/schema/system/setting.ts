import {
  boolean,
  index,
  json,
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

export const settings = pgTable(
  "settings",
  {
    name: varchar("name", { length: 100 }).primaryKey(),
    value: json("value").notNull(),
    isKey: boolean("is_key").notNull().default(false),
    description: varchar("description", { length: 255 }),
    group: varchar("group", { length: 20 }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("settings_group_idx").on(t.group),
    index("settings_is_key_idx").on(t.isKey),
    index("settings_deleted_at_idx").on(t.deletedAt),
  ],
);

export const settingsSchema = createSelectSchema(settings);
export const settingsInsertSchema = createInsertSchema(settings);
export const settingsUpdateSchema = createUpdateSchema(settings);

export type TSettings = zod.infer<typeof settingsSchema>;
export type TSettingsInsert = zod.infer<typeof settingsInsertSchema>;
export type TSettingsUpdate = zod.infer<typeof settingsUpdateSchema>;
