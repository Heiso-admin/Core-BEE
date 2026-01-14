ALTER TABLE "api_key_usage_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "api_keys" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "file_storage_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "file_tag_relations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "file_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "files" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "api_key_access_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "general_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "navigation_menus" ALTER COLUMN "tenant_id" SET DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c';--> statement-breakpoint
ALTER TABLE "navigations" ALTER COLUMN "tenant_id" SET DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c';--> statement-breakpoint
ALTER TABLE "menus" ALTER COLUMN "tenant_id" SET DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c';--> statement-breakpoint
ALTER TABLE "roles" ALTER COLUMN "tenant_id" SET DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c';--> statement-breakpoint
ALTER TABLE "api_key_usage_logs" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
ALTER TABLE "api_keys" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
ALTER TABLE "file_storage_categories" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
ALTER TABLE "file_tag_relations" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
ALTER TABLE "file_tags" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key_access_logs" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
ALTER TABLE "general_settings" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "tenant_id" varchar(50) DEFAULT '74acd0b4-bea5-464b-b658-e9402a0b042c' NOT NULL;--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "api_key_usage_logs" AS PERMISSIVE FOR ALL TO public USING ("api_key_usage_logs"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("api_key_usage_logs"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "api_keys" AS PERMISSIVE FOR ALL TO public USING ("api_keys"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("api_keys"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "file_storage_categories" AS PERMISSIVE FOR ALL TO public USING ("file_storage_categories"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("file_storage_categories"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "file_tag_relations" AS PERMISSIVE FOR ALL TO public USING ("file_tag_relations"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("file_tag_relations"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "file_tags" AS PERMISSIVE FOR ALL TO public USING ("file_tags"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("file_tags"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "files" AS PERMISSIVE FOR ALL TO public USING ("files"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("files"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "api_key_access_logs" AS PERMISSIVE FOR ALL TO public USING ("api_key_access_logs"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("api_key_access_logs"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "general_settings" AS PERMISSIVE FOR ALL TO public USING ("general_settings"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("general_settings"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "settings" AS PERMISSIVE FOR ALL TO public USING ("settings"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("settings"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "site_settings" AS PERMISSIVE FOR ALL TO public USING ("site_settings"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("site_settings"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
ALTER TABLE "api_key_usage_logs" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "api_keys" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "file_storage_categories" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "file_tag_relations" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "file_tags" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "files" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "api_key_access_logs" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "general_settings" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "settings" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_settings" FORCE ROW LEVEL SECURITY;