import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { generateId } from "@/lib/id-generator";
import { users } from "./user";

export const userPasswordReset = pgTable(
  "user_password_reset",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$default(() => generateId()),
    userId: varchar("user_id", { length: 20 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    token: varchar("token", { length: 100 }).notNull(),
    used: boolean("used").default(false),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("user_password_reset_user_id_idx").on(table.userId),
    index("user_password_reset_valid_idx").on(table.used, table.expiresAt),
    index("user_password_reset_token_idx").on(table.token),
  ],
);

export const userPasswordResetRelations = relations(
  userPasswordReset,
  ({ one }) => ({
    user: one(users, {
      fields: [userPasswordReset.userId],
      references: [users.id],
    }),
  }),
);
