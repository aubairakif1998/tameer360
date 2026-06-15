import {
  boolean,
  numeric,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { materialCategoryEnum, materialUnitEnum } from './enums';
import { tenants } from './tenants';

export const materialTypes = pgTable(
  'material_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: varchar('name', { length: 255 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    category: materialCategoryEnum('category').notNull().default('brick'),
    unit: materialUnitEnum('unit').notNull().default('piece'),
    defaultRate: numeric('default_rate', { precision: 15, scale: 2 }),
    productionCost: numeric('production_cost', { precision: 15, scale: 2 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique('material_types_tenant_code_unique').on(t.tenantId, t.code)],
);

export type MaterialTypeRecord = typeof materialTypes.$inferSelect;
export type NewMaterialTypeRecord = typeof materialTypes.$inferInsert;
