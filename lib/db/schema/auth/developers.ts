import { relations } from 'drizzle-orm';
import { index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import type zod from 'zod';
import { users } from './user';

export const developers = pgTable(
  'developers',
  {
    userId: varchar('user_id', { length: 20 })
      .primaryKey()
      .references(() => users.id, { onDelete: 'cascade' }),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    // Add index for soft delete queries
    index('developers_deleted_at_idx').on(table.deletedAt),
    // Add index for timestamp based queries
    index('developers_created_at_idx').on(table.createdAt),
    index('developers_updated_at_idx').on(table.updatedAt),
  ]
);

export const administratorsRelations = relations(developers, ({ one }) => ({
  user: one(users, {
    fields: [developers.userId],
    references: [users.id],
  }),
}));

export const developersSchema = createSelectSchema(developers);
export const developersInsertSchema = createInsertSchema(developers);
export const developersUpdateSchema = createUpdateSchema(developers);

export type TDeveloper = zod.infer<typeof developersSchema>;
export type TDeveloperInsert = zod.infer<typeof developersInsertSchema>;
export type TDeveloperUpdate = zod.infer<typeof developersUpdateSchema>;
