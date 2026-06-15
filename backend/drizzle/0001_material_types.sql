DO $$ BEGIN
  CREATE TYPE "material_unit" AS ENUM ('piece', 'ton', 'cft', 'bag');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "material_types" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "name" varchar(255) NOT NULL,
  "code" varchar(50) NOT NULL,
  "unit" "material_unit" DEFAULT 'piece' NOT NULL,
  "default_rate" numeric(15, 2),
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  UNIQUE ("tenant_id", "code")
);

CREATE INDEX IF NOT EXISTS "material_types_tenant_id_idx" ON "material_types" ("tenant_id");
