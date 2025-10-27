import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { generateId } from "@/lib/id-generator";
import { users } from "./user";

export const user2faCode = pgTable(
  "user_2fa_code",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$default(() => generateId()),
    userId: varchar("user_id", { length: 20 })
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    code: text("code").notNull(),
    used: boolean("used").default(false),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // Index for faster lookups by userId
    index("user_2fa_code_user_id_idx").on(table.userId),
    // Composite index for checking unused codes that haven't expired
    index("user_2fa_code_valid_idx").on(table.used, table.expiresAt),
  ],
);

export const user2faCodeRelations = relations(user2faCode, ({ one }) => ({
  user: one(users, {
    fields: [user2faCode.userId],
    references: [users.id],
  }),
}));
