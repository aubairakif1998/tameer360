import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { stockTransactionTypeEnum } from './enums';
import { materialTypes } from './material-types';
import { tenants } from './tenants';

export const stockLedger = pgTable('stock_ledger', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  materialTypeId: uuid('material_type_id')
    .notNull()
    .references(() => materialTypes.id),
  transactionType: stockTransactionTypeEnum('transaction_type').notNull(),
  quantity: numeric('quantity', { precision: 15, scale: 3 }).notNull(),
  referenceType: varchar('reference_type', { length: 50 }),
  referenceId: uuid('reference_id'),
  notes: text('notes'),
  transactionDate: date('transaction_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type StockLedgerRecord = typeof stockLedger.$inferSelect;
export type NewStockLedgerRecord = typeof stockLedger.$inferInsert;
