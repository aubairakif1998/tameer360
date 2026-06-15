ALTER TABLE "customers"
  ADD COLUMN IF NOT EXISTS "cnic" varchar(15);

ALTER TABLE "customers"
  DROP COLUMN IF EXISTS "credit_limit";

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "delivery_address" text;

UPDATE "orders" o
SET "delivery_address" = COALESCE(
  (
    SELECT cs.address
    FROM "customer_sites" cs
    WHERE cs.id = o.customer_site_id
  ),
  (
    SELECT cs.address
    FROM "customer_sites" cs
    WHERE cs.customer_id = o.customer_id
      AND cs.is_default = true
    LIMIT 1
  ),
  'Delivery address pending'
)
WHERE "delivery_address" IS NULL;

UPDATE "orders"
SET "delivery_address" = 'Delivery address pending'
WHERE "delivery_address" IS NULL OR trim("delivery_address") = '';

ALTER TABLE "orders"
  ALTER COLUMN "delivery_address" SET NOT NULL;

DELETE FROM "dispatches" WHERE "order_id" IS NULL;

ALTER TABLE "dispatches"
  ALTER COLUMN "order_id" SET NOT NULL;

DELETE FROM "payments" WHERE "order_id" IS NULL;

ALTER TABLE "payments"
  ALTER COLUMN "order_id" SET NOT NULL;
