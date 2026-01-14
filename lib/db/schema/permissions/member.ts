import { generateId } from "@heiso/core/lib/id-generator";
import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  timestamp,
  varchar,
  pgPolicy,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type zod from "zod";
import { sql } from "drizzle-orm";
import { users } from "../auth";
import { roles } from "./role";

export const members = pgTable(
  "members",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$default(() => generateId()),
    tenantId: varchar("tenant_id", { length: 50 }).notNull(), // Shared DB RLS discriminator
    userId: varchar("user_id", { length: 20 }).references(() => users.id),
    email: varchar("email", { length: 100 }).notNull(),
    roleId: varchar("role_id", { length: 20 }).references(() => roles.id),
    inviteToken: varchar("invite_token", { length: 20 }),
    tokenExpiredAt: timestamp("token_expired_at"),
    isOwner: boolean("is_owner").notNull().default(false),
    loginMethod: varchar("login_method", { length: 20 }),
    status: varchar("status", { length: 20 }).default("invited"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Index for invite token lookups
    index("org_members_invite_token_idx").on(table.inviteToken),
    // RLS Policy
    pgPolicy("tenant_isolation", {
      for: "all",
      to: "public",
      using: sql`tenant_id = current_setting('app.current_tenant_id', true)`,
      withCheck: sql`tenant_id = current_setting('app.current_tenant_id', true)`,
    }),
  ],
);

export const orgMembersRelations = relations(members, ({ one }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [members.roleId],
    references: [roles.id],
  }),
}));

export const membersSchema = createSelectSchema(members);
export const membersInsertSchema = createInsertSchema(members);
export const membersUpdateSchema = createUpdateSchema(members);

export type TMember = zod.infer<typeof membersSchema>;
export type TMemberInsert = zod.infer<typeof membersInsertSchema>;
export type TMemberUpdate = zod.infer<typeof membersUpdateSchema>;
