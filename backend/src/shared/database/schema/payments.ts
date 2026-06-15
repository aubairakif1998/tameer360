import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { paymentMethodEnum } from './enums';
import { customers } from './customers';
import { dispatches } from './dispatches';
import { orders } from './orders';
import { tenants } from './tenants';

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  receiptNumber: varchar('receipt_number', { length: 50 }).notNull(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  dispatchId: uuid('dispatch_id').references(() => dispatches.id),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('cash'),
  paymentDate: date('payment_date').notNull(),
  referenceNumber: varchar('reference_number', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type PaymentRecord = typeof payments.$inferSelect;
export type NewPaymentRecord = typeof payments.$inferInsert;
