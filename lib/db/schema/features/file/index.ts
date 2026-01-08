import { generateId } from "@heiso/core/lib/id-generator";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
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
import { users } from "../../auth/user";

// Storage categories table
export const fileStorageCategories = pgTable("file_storage_categories", {
  id: varchar("id", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  fileCount: integer("file_count").notNull().default(0),
  size: integer("size").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const storageCategoriesRelations = relations(
  fileStorageCategories,
  ({ many }) => ({
    files: many(files),
  }),
);

// Files table
export const files = pgTable(
  "files",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    name: varchar("name", { length: 255 }).notNull(),
    size: integer("size").notNull(), // Size in bytes
    type: varchar("type", { length: 20 }).notNull(), // document, image, video, audio, archive, other
    extension: varchar("extension", { length: 20 }).notNull(),
    url: varchar("url", { length: 255 }),
    path: varchar("path", { length: 255 }).notNull(), // File path in storage system
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    metadata: jsonb("metadata"), // Store additional metadata like image dimensions, video duration, etc.
    storageCategoryId: varchar("storage_category_id", {
      length: 20,
    }).references(() => fileStorageCategories.id),
    ownerId: varchar("owner_id", { length: 20 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"), // Soft delete
  },
  (table) => [
    index("files_name_idx").on(table.name),
    index("files_type_idx").on(table.type),
    index("files_owner_id_idx").on(table.ownerId),
    index("files_storage_category_id_idx").on(table.storageCategoryId),
  ],
);

export const filesRelations = relations(files, ({ one, many }) => ({
  storageCategory: one(fileStorageCategories, {
    fields: [files.storageCategoryId],
    references: [fileStorageCategories.id],
  }),
  owner: one(users, {
    fields: [files.ownerId],
    references: [users.id],
  }),
  tagRelations: many(fileTagRelations),
}));

// File tags table
export const fileTags = pgTable(
  "file_tags",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    name: varchar("name", { length: 50 }).notNull(),
    color: varchar("color", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("file_tags_name_idx").on(table.name)],
);

export const fileTagsRelations = relations(fileTags, ({ many }) => ({
  fileRelations: many(fileTagRelations),
}));

// File-tag relation table
export const fileTagRelations = pgTable(
  "file_tag_relations",
  {
    id: varchar("id", { length: 20 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    fileId: varchar("file_id", { length: 20 })
      .references(() => files.id)
      .notNull(),
    tagId: varchar("tag_id", { length: 20 })
      .references(() => fileTags.id)
      .notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("file_tag_relations_file_tag_idx").on(table.fileId, table.tagId),
  ],
);

export const fileTagRelationsRelations = relations(
  fileTagRelations,
  ({ one }) => ({
    file: one(files, {
      fields: [fileTagRelations.fileId],
      references: [files.id],
    }),
    tag: one(fileTags, {
      fields: [fileTagRelations.tagId],
      references: [fileTags.id],
    }),
  }),
);

// Create Zod schemas
export const filesSchema = createSelectSchema(files);
export const filesInsertSchema = createInsertSchema(files);
export const filesUpdateSchema = createUpdateSchema(files);

export const fileStorageCategoriesSchema = createSelectSchema(
  fileStorageCategories,
);

export type File = zod.infer<typeof filesSchema>;
export type FileInsert = zod.infer<typeof filesInsertSchema>;
export type FileUpdate = zod.infer<typeof filesUpdateSchema>;

export type FileStorageCategory = zod.infer<typeof fileStorageCategoriesSchema>;
