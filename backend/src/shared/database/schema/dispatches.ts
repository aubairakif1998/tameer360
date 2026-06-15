import {
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { dispatchPaymentStatusEnum, dispatchStatusEnum } from './enums';
import { customers, customerSites } from './customers';
import { materialTypes } from './material-types';
import { orders } from './orders';
import { tenants } from './tenants';
import { vehicles } from './vehicles';

export const dispatches = pgTable('dispatches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  dispatchNumber: varchar('dispatch_number', { length: 50 }).notNull(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id),
  customerSiteId: uuid('customer_site_id').references(() => customerSites.id),
  vehicleId: uuid('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  driverName: varchar('driver_name', { length: 255 }),
  materialTypeId: uuid('material_type_id')
    .notNull()
    .references(() => materialTypes.id),
  quantity: numeric('quantity', { precision: 15, scale: 3 }).notNull(),
  rate: numeric('rate', { precision: 15, scale: 2 }).notNull(),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  deliveryLocation: text('delivery_location').notNull(),
  pickupLocation: text('pickup_location'),
  dropoffLocation: text('dropoff_location'),
  dispatchDate: date('dispatch_date').notNull(),
  scheduledStartAt: timestamp('scheduled_start_at', {
    withTimezone: true,
  }).notNull(),
  expectedDeliveryAt: timestamp('expected_delivery_at', {
    withTimezone: true,
  }).notNull(),
  travelTimeMinutes: integer('travel_time_minutes'),
  journeyKm: numeric('journey_km', { precision: 10, scale: 2 }),
  status: dispatchStatusEnum('status').notNull().default('scheduled'),
  paymentStatus: dispatchPaymentStatusEnum('payment_status')
    .notNull()
    .default('unpaid'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type DispatchRecord = typeof dispatches.$inferSelect;
export type NewDispatchRecord = typeof dispatches.$inferInsert;
