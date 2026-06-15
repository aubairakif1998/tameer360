import { pgEnum } from 'drizzle-orm/pg-core';

export const vehicleExpenseCategoryEnum = pgEnum('vehicle_expense_category', [
  'fuel',
  'repair',
  'rent',
  'driver',
  'other',
]);
