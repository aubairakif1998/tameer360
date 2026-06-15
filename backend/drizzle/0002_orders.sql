DO $$ BEGIN
  CREATE TYPE "order_status" AS ENUM (
    'draft', 'confirmed', 'partial', 'fulfilled', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "order_number" varchar(50) NOT NULL,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id"),
  "customer_site_id" uuid REFERENCES "customer_sites"("id"),
  "material_type_id" uuid NOT NULL REFERENCES "material_types"("id"),
  "ordered_qty" numeric(15, 3) NOT NULL,
  "delivered_qty" numeric(15, 3) DEFAULT '0' NOT NULL,
  "rate" numeric(15, 2) NOT NULL,
  "total_amount" numeric(15, 2) NOT NULL,
  "received_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
  "expected_delivery_date" date,
  "status" "order_status" DEFAULT 'confirmed' NOT NULL,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  UNIQUE ("tenant_id", "order_number")
);

CREATE INDEX IF NOT EXISTS "orders_tenant_id_idx" ON "orders" ("tenant_id");
CREATE INDEX IF NOT EXISTS "orders_customer_id_idx" ON "orders" ("customer_id");
CREATE INDEX IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
