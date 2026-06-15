import {
  boolean,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { vehicleOwnerTypeEnum, vehicleTypeEnum } from './enums';
import { tenants } from './tenants';

export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  registrationNumber: varchar('registration_number', { length: 20 }).notNull(),
  type: vehicleTypeEnum('type').notNull().default('truck'),
  ownerType: vehicleOwnerTypeEnum('owner_type').notNull().default('owned'),
  driverName: varchar('driver_name', { length: 255 }),
  capacity: numeric('capacity', { precision: 15, scale: 3 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type VehicleRecord = typeof vehicles.$inferSelect;
export type NewVehicleRecord = typeof vehicles.$inferInsert;
