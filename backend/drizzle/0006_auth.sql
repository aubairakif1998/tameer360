DO $$ BEGIN
  CREATE TYPE "user_role" AS ENUM(
    'owner',
    'manager',
    'accountant',
    'viewer'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TYPE "user_role" ADD VALUE IF NOT EXISTS 'platform_admin';

CREATE TABLE IF NOT EXISTS "users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid REFERENCES "tenants"("id") ON DELETE CASCADE,
  "email" varchar(255) NOT NULL,
  "password_hash" varchar(255) NOT NULL,
  "full_name" varchar(255) NOT NULL,
  "role" "user_role" DEFAULT 'owner' NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_platform_admin_email_idx"
  ON "users" ("email")
  WHERE "tenant_id" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "users_tenant_email_idx"
  ON "users" ("tenant_id", "email")
  WHERE "tenant_id" IS NOT NULL;
