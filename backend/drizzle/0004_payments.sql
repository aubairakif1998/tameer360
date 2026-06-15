DO $$ BEGIN
  CREATE TYPE "payment_method" AS ENUM (
    'cash', 'bank', 'cheque', 'jazzcash', 'easypaisa'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "payments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "receipt_number" varchar(50) NOT NULL,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id"),
  "order_id" uuid REFERENCES "orders"("id"),
  "amount" numeric(15, 2) NOT NULL,
  "payment_method" "payment_method" DEFAULT 'cash' NOT NULL,
  "payment_date" date NOT NULL,
  "reference_number" varchar(100),
  "notes" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  UNIQUE ("tenant_id", "receipt_number")
);

CREATE INDEX IF NOT EXISTS "payments_tenant_id_idx" ON "payments" ("tenant_id");
CREATE INDEX IF NOT EXISTS "payments_customer_id_idx" ON "payments" ("customer_id");
CREATE INDEX IF NOT EXISTS "payments_order_id_idx" ON "payments" ("order_id");
CREATE INDEX IF NOT EXISTS "payments_payment_date_idx" ON "payments" ("payment_date");
