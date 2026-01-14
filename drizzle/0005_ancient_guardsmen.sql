ALTER TABLE "navigation_menus" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "navigations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "members" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "menus" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
DROP INDEX "org_members_tenant_id_idx";--> statement-breakpoint
DROP INDEX "org_members_user_id_idx";--> statement-breakpoint
DROP INDEX "org_members_role_id_idx";--> statement-breakpoint
DROP INDEX "org_members_email_idx";--> statement-breakpoint
ALTER TABLE "navigation_menus" ADD COLUMN "tenant_id" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "navigations" ADD COLUMN "tenant_id" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "tenant_id" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "tenant_id" varchar(50) NOT NULL;--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "navigation_menus" AS PERMISSIVE FOR ALL TO public USING ("navigation_menus"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("navigation_menus"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "navigations" AS PERMISSIVE FOR ALL TO public USING ("navigations"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("navigations"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "members" AS PERMISSIVE FOR ALL TO public USING (tenant_id = current_setting('app.current_tenant_id', true)) WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "menus" AS PERMISSIVE FOR ALL TO public USING ("menus"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("menus"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "roles" AS PERMISSIVE FOR ALL TO public USING ("roles"."tenant_id" = current_setting('app.current_tenant_id')) WITH CHECK ("roles"."tenant_id" = current_setting('app.current_tenant_id'));--> statement-breakpoint
ALTER TABLE "navigation_menus" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "navigations" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "menus" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roles" FORCE ROW LEVEL SECURITY;