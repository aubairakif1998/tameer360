import type { OrderRecord } from '../../../shared/database/schema/orders';
import type { Order, OrderListItem } from './order.entity';

export function calcRemaining(
  orderedQty: string,
  deliveredQty: string,
): string {
  const remaining = Math.max(0, Number(orderedQty) - Number(deliveredQty));
  return remaining.toFixed(3);
}

export function calcFulfillmentPercent(
  orderedQty: string,
  deliveredQty: string,
): number {
  const ordered = Number(orderedQty);
  if (ordered <= 0) return 0;
  return Math.min(100, Math.round((Number(deliveredQty) / ordered) * 100));
}

export function calcPaymentPercent(
  receivedAmount: string,
  totalAmount: string,
): number {
  const total = Number(totalAmount);
  if (total <= 0) return 0;
  return Math.min(100, Math.round((Number(receivedAmount) / total) * 100));
}

export function calcRemainingPayment(
  receivedAmount: string,
  totalAmount: string,
): string {
  const remaining = Math.max(0, Number(totalAmount) - Number(receivedAmount));
  return remaining.toFixed(2);
}

export function toOrder(record: OrderRecord): Order {
  return {
    id: record.id,
    tenantId: record.tenantId,
    orderNumber: record.orderNumber,
    customerId: record.customerId,
    deliveryAddress: record.deliveryAddress,
    materialTypeId: record.materialTypeId,
    orderedQty: record.orderedQty,
    deliveredQty: record.deliveredQty,
    rate: record.rate,
    totalAmount: record.totalAmount,
    receivedAmount: record.receivedAmount,
    expectedDeliveryDate: record.expectedDeliveryDate,
    status: record.status,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toOrderListItem(
  record: OrderRecord,
  customerName: string,
  materialName: string,
): OrderListItem {
  const order = toOrder(record);
  return {
    ...order,
    customerName,
    materialName,
    remainingQty: calcRemaining(order.orderedQty, order.deliveredQty),
    fulfillmentPercent: calcFulfillmentPercent(
      order.orderedQty,
      order.deliveredQty,
    ),
    paymentPercent: calcPaymentPercent(order.receivedAmount, order.totalAmount),
    remainingPayment: calcRemainingPayment(
      order.receivedAmount,
      order.totalAmount,
    ),
  };
}
