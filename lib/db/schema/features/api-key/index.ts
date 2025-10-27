import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import { generateId } from '@/lib/id-generator';
import { users } from '../../auth';

// API Key table
export const apiKeys = pgTable(
  'api_keys',
  {
    id: varchar('id', { length: 20 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    userId: varchar('user_id', { length: 20 })
      .notNull()
      .references(() => users.id),
    name: varchar('name', { length: 100 }).notNull(), // API Key name
    description: text('description'), // API Key description
    keyHash: varchar('key_hash', { length: 255 }).notNull(), // API Key hash (for verification)
    keyPrefix: varchar('key_prefix', { length: 10 }).notNull(), // API Key prefix (for display)
    permissions: json('permissions').notNull(), // Permission configuration (JSON format)
    isEnabled: boolean('is_enabled').notNull().default(true), // Whether enabled
    lastUsedAt: timestamp('last_used_at'), // Last used time
    expiresAt: timestamp('expires_at'), // Expiration time
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('api_keys_user_id_idx').on(table.userId),
    index('api_keys_key_hash_idx').on(table.keyHash),
    index('api_keys_key_prefix_idx').on(table.keyPrefix),
    index('api_keys_is_enabled_idx').on(table.isEnabled),
    index('api_keys_deleted_at_idx').on(table.deletedAt),
  ]
);

// API Key usage log table
export const apiKeyUsageLogs = pgTable(
  'api_key_usage_logs',
  {
    id: varchar('id', { length: 20 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    apiKeyId: varchar('api_key_id', { length: 20 })
      .notNull()
      .references(() => apiKeys.id),
    endpoint: varchar('endpoint', { length: 255 }).notNull(), // Accessed endpoint
    method: varchar('method', { length: 10 }).notNull(), // HTTP method
    ipAddress: varchar('ip_address', { length: 45 }), // IP address
    userAgent: text('user_agent'), // User agent
    responseStatus: integer('response_status'), // Response status code
    responseTime: varchar('response_time', { length: 20 }), // Response time (milliseconds)
    requestData: json('request_data'), // Request data (JSON format)
    responseData: json('response_data'), // Response data (JSON format)
    errorMessage: text('error_message'), // Error message
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('api_key_usage_logs_api_key_id_idx').on(table.apiKeyId),
    index('api_key_usage_logs_endpoint_idx').on(table.endpoint),
    index('api_key_usage_logs_created_at_idx').on(table.createdAt),
    index('api_key_usage_logs_response_status_idx').on(table.responseStatus),
  ]
);

// Define relationships
export const apiKeysRelations = relations(apiKeys, ({ one, many }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
  usageLogs: many(apiKeyUsageLogs),
}));

export const apiKeyUsageLogsRelations = relations(
  apiKeyUsageLogs,
  ({ one }) => ({
    apiKey: one(apiKeys, {
      fields: [apiKeyUsageLogs.apiKeyId],
      references: [apiKeys.id],
    }),
  })
);

// Create Zod schemas
export const apiKeysSchema = createSelectSchema(apiKeys);
export const apiKeysInsertSchema = createInsertSchema(apiKeys);
export const apiKeysUpdateSchema = createUpdateSchema(apiKeys);

export const apiKeyUsageLogsSchema = createSelectSchema(apiKeyUsageLogs);
export const apiKeyUsageLogsInsertSchema = createInsertSchema(apiKeyUsageLogs);
export const apiKeyUsageLogsUpdateSchema = createUpdateSchema(apiKeyUsageLogs);

// Export all tables and types
export type ApiKeys = typeof apiKeys.$inferSelect;
export type ApiKeysInsert = typeof apiKeys.$inferInsert;
export type ApiKeysUpdate = Partial<ApiKeysInsert>;

export type ApiKeyUsageLogs = typeof apiKeyUsageLogs.$inferSelect;
export type ApiKeyUsageLogsInsert = typeof apiKeyUsageLogs.$inferInsert;
export type ApiKeyUsageLogsUpdate = Partial<ApiKeyUsageLogsInsert>;

// API Key permission type definitions
export interface ApiKeyPermissions {
  endpoints: string[]; // Allowed endpoints
  rateLimit?: {
    requests: number; // Number of requests
    window: number; // Time window (seconds)
  };
  ipWhitelist?: string[]; // IP whitelist
  features?: string[]; // Allowed features
}

// API Key creation request type
export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  permissions?: ApiKeyPermissions;
  expiresAt?: Date;
}

// API Key response type
export interface ApiKeyResponse {
  id: string;
  name: string;
  description?: string;
  keyPrefix: string;
  permissions?: ApiKeyPermissions;
  isActive: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Key creation response type (includes full key)
export interface CreateApiKeyResponse extends ApiKeyResponse {
  key: string; // Full API Key (only returned on creation)
}
