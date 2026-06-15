DO $$ BEGIN
  CREATE TYPE "dispatch_payment_status" AS ENUM ('unpaid', 'paid');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "dispatches"
  ADD COLUMN IF NOT EXISTS "payment_status" "dispatch_payment_status" NOT NULL DEFAULT 'unpaid';

ALTER TABLE "dispatches"
  ALTER COLUMN "status" SET DEFAULT 'scheduled';

ALTER TABLE "payments"
  ADD COLUMN IF NOT EXISTS "dispatch_id" uuid REFERENCES "dispatches"("id");

CREATE INDEX IF NOT EXISTS "payments_dispatch_id_idx" ON "payments" ("dispatch_id");
