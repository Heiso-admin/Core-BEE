import {
  boolean,
  index,
  json,
  pgPolicy,
  pgTable,
  primaryKey,
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

export const settings = pgTable(
  "settings",
  {
    ...tenantSchema,
    name: varchar("name", { length: 100 }).notNull(),
    value: json("value").notNull(),
    isKey: boolean("is_key").notNull().default(false),
    description: varchar("description", { length: 255 }),
    group: varchar("group", { length: 20 }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.tenantId, t.name] }),
    settingsGroupIdx: index("settings_group_idx").on(t.group),
    settingsIsKeyIdx: index("settings_is_key_idx").on(t.isKey),
    settingsDeletedAtIdx: index("settings_deleted_at_idx").on(t.deletedAt),
    policy: pgPolicy("tenant_isolation", {
      for: "all",
      to: "public",
      using: sql`${t.tenantId} = current_setting('app.current_tenant_id')`,
      withCheck: sql`${t.tenantId} = current_setting('app.current_tenant_id')`,
    }),
  }),
);

export const enableSettingRls = sql`
  ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings" FORCE ROW LEVEL SECURITY;
`;

export const settingsSchema = createSelectSchema(settings);
export const settingsInsertSchema = createInsertSchema(settings);
export const settingsUpdateSchema = createUpdateSchema(settings);

export type TSettings = zod.infer<typeof settingsSchema>;
export type TSettingsInsert = zod.infer<typeof settingsInsertSchema>;
export type TSettingsUpdate = zod.infer<typeof settingsUpdateSchema>;
