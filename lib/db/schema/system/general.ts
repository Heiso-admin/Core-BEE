import { index, json, pgPolicy, pgTable, primaryKey, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { tenantSchema } from "../utils";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type zod from "zod";

export const generalSettings = pgTable(
  "general_settings",
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
    generalSettingsDeletedAtIdx: index("general_settings_deleted_at_idx").on(t.deletedAt),
    policy: pgPolicy("tenant_isolation", {
      for: "all",
      to: "public",
      using: sql`${t.tenantId} = current_setting('app.current_tenant_id')`,
      withCheck: sql`${t.tenantId} = current_setting('app.current_tenant_id')`,
    }),
  }),
);

export const enableGeneralSettingRls = sql`
  ALTER TABLE "general_settings" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE "general_settings" FORCE ROW LEVEL SECURITY;
`;

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
