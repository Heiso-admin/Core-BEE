import {
  pgTable,
  varchar,
  text,
  timestamp,
  integer,
  json,
  boolean,
} from 'drizzle-orm/pg-core';
import { generateId } from '@/lib/id-generator';
import { users } from '../auth';
import { relations } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

// API Keys table
export const apiKeys = pgTable('api_keys', {
  id: varchar('id', { length: 20 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  userId: varchar('user_id', { length: 20 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  rateLimit: json('rate_limit').default({ requests: 100, window: 60 }),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// API Key access log table
export const apiKeyAccessLogs = pgTable('api_key_access_logs', {
  id: varchar('id', { length: 20 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  apiKeyId: varchar('api_key_id', { length: 20 })
    .notNull()
    .references(() => apiKeys.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 20 })
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: integer('status_code').notNull(),
  responseTime: integer('response_time').notNull(), // in milliseconds
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations for access logs
export const apiKeyAccessLogsRelations = relations(
  apiKeyAccessLogs,
  ({ one }) => ({
    apiKey: one(apiKeys, {
      fields: [apiKeyAccessLogs.apiKeyId],
      references: [apiKeys.id],
    }),
    user: one(users, {
      fields: [apiKeyAccessLogs.userId],
      references: [users.id],
    }),
  })
);

// Zod schemas for access logs
export const insertApiKeyAccessLogSchema = createInsertSchema(
  apiKeyAccessLogs,
  {
    endpoint: z.string().min(1, 'Endpoint is required').max(255),
    method: z.string().min(1, 'Method is required').max(10),
    statusCode: z.number().int().min(100).max(599),
    responseTime: z.number().int().min(0),
    ipAddress: z.string().max(45).optional(),
    userAgent: z.string().optional(),
    errorMessage: z.string().optional(),
  }
);

export const selectApiKeyAccessLogSchema = createSelectSchema(apiKeyAccessLogs);

// Types for access logs
export type TApiKeyAccessLog = typeof apiKeyAccessLogs.$inferSelect;
export type TInsertApiKeyAccessLog = typeof apiKeyAccessLogs.$inferInsert;

// Relations
export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, { fields: [apiKeys.userId], references: [users.id] }),
}));

// Zod schemas
export const insertApiKeySchema = createInsertSchema(apiKeys, {
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  expiresAt: z.date().optional(),
});

export const selectApiKeySchema = createSelectSchema(apiKeys);

// Types
export type TApiKey = typeof apiKeys.$inferSelect;
export type TInsertApiKey = typeof apiKeys.$inferInsert;

// Create API Key data type (without sensitive fields)
export type TCreateApiKey = Omit<
  TInsertApiKey,
  'id' | 'userId' | 'key' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;
export type TUpdateApiKey = Partial<
  Pick<TApiKey, 'name' | 'description' | 'isActive' | 'expiresAt'>
>;

// Public API Key type (without sensitive key field)
export type TPublicApiKey = Omit<TApiKey, 'key' | 'deletedAt'>;
