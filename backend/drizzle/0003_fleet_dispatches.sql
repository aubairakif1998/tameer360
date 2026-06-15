DO $$ BEGIN
  CREATE TYPE "vehicle_type" AS ENUM ('truck', 'loader', 'tractor', 'dumper');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "vehicle_owner_type" AS ENUM ('owned', 'rented');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "dispatch_status" AS ENUM (
    'scheduled', 'loaded', 'in_transit', 'delivered', 'cancelled'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "vehicles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "registration_number" varchar(20) NOT NULL,
  "type" "vehicle_type" DEFAULT 'truck' NOT NULL,
  "owner_type" "vehicle_owner_type" DEFAULT 'owned' NOT NULL,
  "driver_name" varchar(255),
  "capacity" numeric(15, 3),
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  UNIQUE ("tenant_id", "registration_number")
);

CREATE TABLE IF NOT EXISTS "dispatches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "dispatch_number" varchar(50) NOT NULL,
  "order_id" uuid REFERENCES "orders"("id"),
  "customer_id" uuid NOT NULL REFERENCES "customers"("id"),
  "customer_site_id" uuid REFERENCES "customer_sites"("id"),
  "vehicle_id" uuid NOT NULL REFERENCES "vehicles"("id"),
  "driver_name" varchar(255),
  "material_type_id" uuid NOT NULL REFERENCES "material_types"("id"),
  "quantity" numeric(15, 3) NOT NULL,
  "rate" numeric(15, 2) NOT NULL,
  "amount" numeric(15, 2) NOT NULL,
  "delivery_location" text NOT NULL,
  "dispatch_date" date NOT NULL,
  "status" "dispatch_status" DEFAULT 'delivered' NOT NULL,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  UNIQUE ("tenant_id", "dispatch_number")
);

CREATE INDEX IF NOT EXISTS "vehicles_tenant_id_idx" ON "vehicles" ("tenant_id");
CREATE INDEX IF NOT EXISTS "dispatches_tenant_id_idx" ON "dispatches" ("tenant_id");
CREATE INDEX IF NOT EXISTS "dispatches_order_id_idx" ON "dispatches" ("order_id");
CREATE INDEX IF NOT EXISTS "dispatches_dispatch_date_idx" ON "dispatches" ("dispatch_date");
