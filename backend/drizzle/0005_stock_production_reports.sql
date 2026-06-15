DO $$ BEGIN
  CREATE TYPE "stock_transaction_type" AS ENUM (
    'opening', 'production', 'dispatch', 'adjustment'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "vehicle_expense_category" AS ENUM (
    'fuel', 'repair', 'rent', 'driver', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "material_types"
  ADD COLUMN IF NOT EXISTS "production_cost" numeric(15, 2);

CREATE TABLE IF NOT EXISTS "stock_ledger" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "material_type_id" uuid NOT NULL REFERENCES "material_types"("id"),
  "transaction_type" "stock_transaction_type" NOT NULL,
  "quantity" numeric(15, 3) NOT NULL,
  "reference_type" varchar(50),
  "reference_id" uuid,
  "notes" text,
  "transaction_date" date NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "stock_ledger_tenant_id_idx" ON "stock_ledger" ("tenant_id");
CREATE INDEX IF NOT EXISTS "stock_ledger_material_type_id_idx" ON "stock_ledger" ("material_type_id");
CREATE INDEX IF NOT EXISTS "stock_ledger_transaction_date_idx" ON "stock_ledger" ("transaction_date");

CREATE TABLE IF NOT EXISTS "production_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "batch_number" varchar(50) NOT NULL,
  "material_type_id" uuid NOT NULL REFERENCES "material_types"("id"),
  "produced_qty" numeric(15, 3) NOT NULL,
  "damaged_qty" numeric(15, 3) DEFAULT '0' NOT NULL,
  "production_date" date NOT NULL,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  UNIQUE ("tenant_id", "batch_number")
);

CREATE INDEX IF NOT EXISTS "production_batches_tenant_id_idx" ON "production_batches" ("tenant_id");
CREATE INDEX IF NOT EXISTS "production_batches_production_date_idx" ON "production_batches" ("production_date");

CREATE TABLE IF NOT EXISTS "vehicle_expenses" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "vehicle_id" uuid NOT NULL REFERENCES "vehicles"("id"),
  "category" "vehicle_expense_category" DEFAULT 'other' NOT NULL,
  "amount" numeric(15, 2) NOT NULL,
  "expense_date" date NOT NULL,
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "vehicle_expenses_tenant_id_idx" ON "vehicle_expenses" ("tenant_id");
CREATE INDEX IF NOT EXISTS "vehicle_expenses_vehicle_id_idx" ON "vehicle_expenses" ("vehicle_id");
CREATE INDEX IF NOT EXISTS "vehicle_expenses_expense_date_idx" ON "vehicle_expenses" ("expense_date");
