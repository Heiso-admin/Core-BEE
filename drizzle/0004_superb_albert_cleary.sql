CREATE TABLE "api_key_usage_logs" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"api_key_id" varchar(20) NOT NULL,
	"endpoint" varchar(255) NOT NULL,
	"method" varchar(10) NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"response_status" integer,
	"response_time" varchar(20),
	"request_data" json,
	"response_data" json,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "tenant_id" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "api_key_usage_logs" ADD CONSTRAINT "api_key_usage_logs_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_key_usage_logs_api_key_id_idx" ON "api_key_usage_logs" USING btree ("api_key_id");--> statement-breakpoint
CREATE INDEX "api_key_usage_logs_endpoint_idx" ON "api_key_usage_logs" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "api_key_usage_logs_created_at_idx" ON "api_key_usage_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "api_key_usage_logs_response_status_idx" ON "api_key_usage_logs" USING btree ("response_status");--> statement-breakpoint
CREATE INDEX "org_members_tenant_id_idx" ON "members" USING btree ("tenant_id");