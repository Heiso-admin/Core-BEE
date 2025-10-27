CREATE TABLE "user_2fa_code" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"code" text NOT NULL,
	"used" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "developers" (
	"user_id" varchar(20) PRIMARY KEY NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_password_reset" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"token" varchar(100) NOT NULL,
	"used" boolean DEFAULT false,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"avatar" varchar(255),
	"active" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp,
	"two_factor_enabled" boolean DEFAULT false,
	"two_factor_secret" varchar(255),
	"must_change_password" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "file_storage_categories" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"icon" varchar(50) NOT NULL,
	"color" varchar(20) NOT NULL,
	"file_count" integer DEFAULT 0 NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_tag_relations" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"file_id" varchar(20) NOT NULL,
	"tag_id" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file_tags" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"color" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"size" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"extension" varchar(20) NOT NULL,
	"url" varchar(255),
	"path" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"metadata" jsonb,
	"storage_category_id" varchar(20),
	"owner_id" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "navigation_menus" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"navigation_id" varchar(20) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"group" varchar(100),
	"title" varchar(100) NOT NULL,
	"sub_title" varchar(100),
	"icon" varchar(255),
	"link_type" varchar(20) DEFAULT 'none' NOT NULL,
	"link" varchar(255) NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"parent_id" varchar(20),
	"order_number" integer,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigations" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"name" varchar(100) NOT NULL,
	"parent_id" varchar(20),
	"description" varchar(255),
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"user_id" varchar(20),
	"email" varchar(100) NOT NULL,
	"role_id" varchar(20),
	"invite_token" varchar(20),
	"token_expired_at" timestamp,
	"is_owner" boolean DEFAULT false NOT NULL,
	"status" varchar(20) DEFAULT 'invited',
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"path" varchar(255),
	"icon" varchar(50),
	"group" varchar(20),
	"parent_id" varchar(20),
	"order_number" integer,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"menu_id" varchar(20),
	"resource" varchar(100) NOT NULL,
	"action" varchar(20) NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" varchar(255),
	"full_access" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_menus" (
	"role_id" varchar(20) NOT NULL,
	"menu_id" varchar(20) NOT NULL,
	CONSTRAINT "role_menus_role_id_menu_id_pk" PRIMARY KEY("role_id","menu_id")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" varchar(20) NOT NULL,
	"permission_id" varchar(20) NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "general_settings" (
	"name" varchar(100) PRIMARY KEY NOT NULL,
	"value" json NOT NULL,
	"description" varchar(255),
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"name" varchar(100) PRIMARY KEY NOT NULL,
	"value" json NOT NULL,
	"is_key" boolean DEFAULT false NOT NULL,
	"description" varchar(255),
	"group" varchar(20),
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"name" varchar(100) PRIMARY KEY NOT NULL,
	"value" json NOT NULL,
	"description" varchar(255),
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_key_access_logs" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"api_key_id" varchar(20) NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" integer NOT NULL,
	"response_time" integer NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"user_id" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"key" varchar(255) NOT NULL,
	"rate_limit" json DEFAULT '{"requests":100,"window":60}'::json,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
ALTER TABLE "user_2fa_code" ADD CONSTRAINT "user_2fa_code_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "developers" ADD CONSTRAINT "developers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_password_reset" ADD CONSTRAINT "user_password_reset_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_tag_relations" ADD CONSTRAINT "file_tag_relations_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_tag_relations" ADD CONSTRAINT "file_tag_relations_tag_id_file_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."file_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_storage_category_id_file_storage_categories_id_fk" FOREIGN KEY ("storage_category_id") REFERENCES "public"."file_storage_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_menus" ADD CONSTRAINT "role_menus_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_access_logs" ADD CONSTRAINT "api_key_access_logs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_key_access_logs" ADD CONSTRAINT "api_key_access_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_2fa_code_user_id_idx" ON "user_2fa_code" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_2fa_code_valid_idx" ON "user_2fa_code" USING btree ("used","expires_at");--> statement-breakpoint
CREATE INDEX "developers_deleted_at_idx" ON "developers" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "developers_created_at_idx" ON "developers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "developers_updated_at_idx" ON "developers" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "user_password_reset_user_id_idx" ON "user_password_reset" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_password_reset_valid_idx" ON "user_password_reset" USING btree ("used","expires_at");--> statement-breakpoint
CREATE INDEX "user_password_reset_token_idx" ON "user_password_reset" USING btree ("token");--> statement-breakpoint
CREATE INDEX "email_index" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "name_index" ON "users" USING btree ("name");--> statement-breakpoint
CREATE INDEX "auth_index" ON "users" USING btree ("email","password");--> statement-breakpoint
CREATE INDEX "created_at_index" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "updated_at_index" ON "users" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "last_login_index" ON "users" USING btree ("last_login_at");--> statement-breakpoint
CREATE INDEX "file_tag_relations_file_tag_idx" ON "file_tag_relations" USING btree ("file_id","tag_id");--> statement-breakpoint
CREATE INDEX "file_tags_name_idx" ON "file_tags" USING btree ("name");--> statement-breakpoint
CREATE INDEX "files_name_idx" ON "files" USING btree ("name");--> statement-breakpoint
CREATE INDEX "files_type_idx" ON "files" USING btree ("type");--> statement-breakpoint
CREATE INDEX "files_owner_id_idx" ON "files" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "files_storage_category_id_idx" ON "files" USING btree ("storage_category_id");--> statement-breakpoint
CREATE INDEX "navigation_menus_slug_idx" ON "navigation_menus" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "navigation_menus_parent_id_idx" ON "navigation_menus" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "navigation_menus_deleted_at_idx" ON "navigation_menus" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "navigations_slug_idx" ON "navigations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "navigations_deleted_at_idx" ON "navigations" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "org_members_user_id_idx" ON "members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "org_members_role_id_idx" ON "members" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "org_members_email_idx" ON "members" USING btree ("email");--> statement-breakpoint
CREATE INDEX "org_members_invite_token_idx" ON "members" USING btree ("invite_token");--> statement-breakpoint
CREATE INDEX "parent_id_idx" ON "menus" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "group_order_idx" ON "menus" USING btree ("group","order_number");--> statement-breakpoint
CREATE INDEX "deleted_at_idx" ON "menus" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "permissions_menu_id_idx" ON "permissions" USING btree ("menu_id");--> statement-breakpoint
CREATE INDEX "permissions_resource_action_idx" ON "permissions" USING btree ("resource","action");--> statement-breakpoint
CREATE INDEX "roles_name_idx" ON "roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "roles_deleted_at_idx" ON "roles" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "role_menus_role_id_idx" ON "role_menus" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_menus_menu_id_idx" ON "role_menus" USING btree ("menu_id");--> statement-breakpoint
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions" USING btree ("role_id");--> statement-breakpoint
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX "general_settings_deleted_at_idx" ON "general_settings" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "settings_group_idx" ON "settings" USING btree ("group");--> statement-breakpoint
CREATE INDEX "settings_is_key_idx" ON "settings" USING btree ("is_key");--> statement-breakpoint
CREATE INDEX "settings_deleted_at_idx" ON "settings" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "site_settings_deleted_at_idx" ON "site_settings" USING btree ("deleted_at");