DO $$ BEGIN
  CREATE TYPE "material_category" AS ENUM (
    'brick',
    'sand',
    'crush',
    'cement',
    'steel',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "material_types"
  ADD COLUMN IF NOT EXISTS "category" "material_category" NOT NULL DEFAULT 'brick';
