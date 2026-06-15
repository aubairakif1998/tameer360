import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { materialTypes } from './material-types';
import { tenants } from './tenants';

export const productionBatches = pgTable(
  'production_batches',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    batchNumber: varchar('batch_number', { length: 50 }).notNull(),
    materialTypeId: uuid('material_type_id')
      .notNull()
      .references(() => materialTypes.id),
    producedQty: numeric('produced_qty', { precision: 15, scale: 3 }).notNull(),
    damagedQty: numeric('damaged_qty', { precision: 15, scale: 3 })
      .notNull()
      .default('0'),
    productionDate: date('production_date').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    unique('production_batches_tenant_number_unique').on(
      t.tenantId,
      t.batchNumber,
    ),
  ],
);

export type ProductionBatchRecord = typeof productionBatches.$inferSelect;
export type NewProductionBatchRecord = typeof productionBatches.$inferInsert;
