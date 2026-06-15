ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS document_templates JSONB;
