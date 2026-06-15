import {
  date,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { vehicleExpenseCategoryEnum } from './vehicle-expense-category.enum';
import { tenants } from './tenants';
import { vehicles } from './vehicles';

export const vehicleExpenses = pgTable('vehicle_expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  vehicleId: uuid('vehicle_id')
    .notNull()
    .references(() => vehicles.id),
  category: vehicleExpenseCategoryEnum('category').notNull().default('other'),
  amount: numeric('amount', { precision: 15, scale: 2 }).notNull(),
  expenseDate: date('expense_date').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type VehicleExpenseRecord = typeof vehicleExpenses.$inferSelect;
export type NewVehicleExpenseRecord = typeof vehicleExpenses.$inferInsert;
