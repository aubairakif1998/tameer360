import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import type { DocumentTemplatesConfig } from '../../document-templates/document-templates.types';
import { businessTypeEnum } from './enums';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 63 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  businessType: businessTypeEnum('business_type')
    .notNull()
    .default('brick_kiln'),
  logoUrl: text('logo_url'),
  primaryColor: varchar('primary_color', { length: 7 })
    .notNull()
    .default('#1e40af'),
  accentColor: varchar('accent_color', { length: 7 })
    .notNull()
    .default('#f59e0b'),
  showPoweredBy: boolean('show_powered_by').notNull().default(true),
  documentTemplates: jsonb('document_templates').$type<DocumentTemplatesConfig>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type TenantRecord = typeof tenants.$inferSelect;
export type NewTenantRecord = typeof tenants.$inferInsert;
