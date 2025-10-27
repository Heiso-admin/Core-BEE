import { relations } from "drizzle-orm";
import {
  boolean,
  index,
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
import { users } from "../auth";
import { roles } from "./role";

export const members = pgTable(
  "members",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$default(() => generateId()),
    userId: varchar("user_id", { length: 20 }).references(() => users.id),
    email: varchar("email", { length: 100 }).notNull(),
    roleId: varchar("role_id", { length: 20 }).references(() => roles.id),
    inviteToken: varchar("invite_token", { length: 20 }),
    tokenExpiredAt: timestamp("token_expired_at"),
    isOwner: boolean("is_owner").notNull().default(false),
    status: varchar("status", { length: 20 }).default("invited"),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    // Index for foreign key lookups
    index("org_members_user_id_idx").on(table.userId),
    index("org_members_role_id_idx").on(table.roleId),
    // Index for email lookups
    index("org_members_email_idx").on(table.email),
    // Index for invite token lookups
    index("org_members_invite_token_idx").on(table.inviteToken),
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
