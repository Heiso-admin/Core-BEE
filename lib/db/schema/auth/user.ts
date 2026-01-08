import { generateUserId } from "@heiso/core/lib/id-generator";
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
import { members } from "../permissions";
import { user2faCode } from "./2fa";
import { developers } from "./developers";

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$default(() => generateUserId()),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    avatar: varchar("avatar", { length: 255 }),
    active: boolean("active").notNull().default(false),
    lastLoginAt: timestamp("last_login_at"),
    loginMethod: varchar("login_method", { length: 20 }),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
    mustChangePassword: boolean("must_change_password").default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    // Index for email lookups
    index("email_index").on(t.email),
    // Index for name searches
    index("name_index").on(t.name),
    // Compound index for auth-related fields
    index("auth_index").on(t.email, t.password),
    // Index for timestamp-based queries
    index("created_at_index").on(t.createdAt),
    index("updated_at_index").on(t.updatedAt),
    index("last_login_index").on(t.lastLoginAt),
  ],
);

export const UsersRelations = relations(users, ({ one, many }) => ({
  developer: one(developers, {
    fields: [users.id],
    references: [developers.userId],
  }),
  membership: many(members),
  twoFactorCodes: many(user2faCode),
}));

export const usersSchema = createSelectSchema(users);
export const usersInsertSchema = createInsertSchema(users);
export const usersUpdateSchema = createUpdateSchema(users);

export type TUser = zod.infer<typeof usersSchema>;
export type TUserInsert = zod.infer<typeof usersInsertSchema>;
export type TUserUpdate = zod.infer<typeof usersUpdateSchema>;
