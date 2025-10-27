import {
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
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
    description: varchar("description", { length: 255 }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("settings_deleted_at_idx").on(table.deletedAt)],
);

export const settingsSchema = createSelectSchema(settings);
export const settingsInsertSchema = createInsertSchema(settings);
export const settingsUpdateSchema = createUpdateSchema(settings);

export type TSettings = zod.infer<typeof settingsSchema>;
export type TSettingsInsert = zod.infer<typeof settingsInsertSchema>;
export type TSettingsUpdate = zod.infer<typeof settingsUpdateSchema>;
