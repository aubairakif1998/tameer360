import { pgEnum } from 'drizzle-orm/pg-core';

export const businessTypeEnum = pgEnum('business_type', [
  'brick_kiln',
  'sand',
  'crush',
  'cement',
  'steel',
  'general',
]);

export const userRoleEnum = pgEnum('user_role', [
  'platform_admin',
  'owner',
  'manager',
  'accountant',
  'viewer',
]);

export const customerTypeEnum = pgEnum('customer_type', [
  'vendor',
  'contractor',
  'builder',
  'individual',
]);

export const materialUnitEnum = pgEnum('material_unit', [
  'piece',
  'ton',
  'cft',
  'bag',
]);

export const materialCategoryEnum = pgEnum('material_category', [
  'brick',
  'sand',
  'crush',
  'cement',
  'steel',
  'other',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'draft',
  'confirmed',
  'partial',
  'fulfilled',
  'cancelled',
]);

export const dispatchStatusEnum = pgEnum('dispatch_status', [
  'scheduled',
  'loaded',
  'in_transit',
  'delivered',
  'cancelled',
]);

export const dispatchPaymentStatusEnum = pgEnum('dispatch_payment_status', [
  'unpaid',
  'paid',
]);

export const vehicleTypeEnum = pgEnum('vehicle_type', [
  'truck',
  'loader',
  'tractor',
  'dumper',
]);

export const vehicleOwnerTypeEnum = pgEnum('vehicle_owner_type', [
  'owned',
  'rented',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'cash',
  'bank',
  'cheque',
  'jazzcash',
  'easypaisa',
]);

export const stockTransactionTypeEnum = pgEnum('stock_transaction_type', [
  'opening',
  'production',
  'dispatch',
  'adjustment',
]);

export { vehicleExpenseCategoryEnum } from './vehicle-expense-category.enum';
