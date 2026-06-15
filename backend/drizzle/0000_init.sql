-- Tameer360 initial schema
-- Run via: npm run db:migrate

DO $$ BEGIN
  CREATE TYPE "business_type" AS ENUM (
    'brick_kiln', 'sand', 'crush', 'cement', 'steel', 'general'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "customer_type" AS ENUM (
    'vendor', 'contractor', 'builder', 'individual'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "tenants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(63) NOT NULL UNIQUE,
  "display_name" varchar(255) NOT NULL,
  "business_type" "business_type" DEFAULT 'brick_kiln' NOT NULL,
  "logo_url" text,
  "primary_color" varchar(7) DEFAULT '#1e40af' NOT NULL,
  "accent_color" varchar(7) DEFAULT '#f59e0b' NOT NULL,
  "show_powered_by" boolean DEFAULT true NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "customers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "name" varchar(255) NOT NULL,
  "phone" varchar(20),
  "address" text,
  "type" "customer_type" DEFAULT 'builder' NOT NULL,
  "credit_limit" numeric(15, 2),
  "notes" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "customer_sites" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
  "name" varchar(255) NOT NULL,
  "address" text,
  "is_default" boolean DEFAULT false NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "customers_tenant_id_idx" ON "customers" ("tenant_id");
CREATE INDEX IF NOT EXISTS "customer_sites_customer_id_idx" ON "customer_sites" ("customer_id");
