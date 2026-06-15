import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { orderStatusEnum } from './enums';
import { customers } from './customers';
import { materialTypes } from './material-types';
import { tenants } from './tenants';

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  orderNumber: varchar('order_number', { length: 50 }).notNull(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id),
  deliveryAddress: text('delivery_address').notNull(),
  materialTypeId: uuid('material_type_id')
    .notNull()
    .references(() => materialTypes.id),
  orderedQty: numeric('ordered_qty', { precision: 15, scale: 3 }).notNull(),
  deliveredQty: numeric('delivered_qty', { precision: 15, scale: 3 })
    .notNull()
    .default('0'),
  rate: numeric('rate', { precision: 15, scale: 2 }).notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 2 }).notNull(),
  receivedAmount: numeric('received_amount', { precision: 15, scale: 2 })
    .notNull()
    .default('0'),
  expectedDeliveryDate: date('expected_delivery_date'),
  status: orderStatusEnum('status').notNull().default('confirmed'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type OrderRecord = typeof orders.$inferSelect;
export type NewOrderRecord = typeof orders.$inferInsert;
