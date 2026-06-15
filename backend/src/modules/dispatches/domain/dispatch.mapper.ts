import type { DispatchRecord } from '../../../shared/database/schema/dispatches';
import type { Dispatch, DispatchListItem } from './dispatch.entity';

export function toDispatch(record: DispatchRecord): Dispatch {
  return {
    id: record.id,
    tenantId: record.tenantId,
    dispatchNumber: record.dispatchNumber,
    orderId: record.orderId,
    customerId: record.customerId,
    vehicleId: record.vehicleId,
    driverName: record.driverName,
    materialTypeId: record.materialTypeId,
    quantity: record.quantity,
    rate: record.rate,
    amount: record.amount,
    deliveryLocation: record.deliveryLocation,
    pickupLocation: record.pickupLocation,
    dropoffLocation: record.dropoffLocation,
    dispatchDate: record.dispatchDate,
    scheduledStartAt: record.scheduledStartAt,
    expectedDeliveryAt: record.expectedDeliveryAt,
    travelTimeMinutes: record.travelTimeMinutes,
    journeyKm: record.journeyKm,
    status: record.status,
    paymentStatus: record.paymentStatus,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toDispatchListItem(
  record: DispatchRecord,
  customerName: string,
  materialName: string,
  vehicleNumber: string,
  orderNumber: string,
  paidAmount = '0',
): DispatchListItem {
  const amount = Number(record.amount);
  const paid = Number(paidAmount);
  const remaining = Math.max(0, amount - paid);

  return {
    ...toDispatch(record),
    customerName,
    materialName,
    vehicleNumber,
    orderNumber,
    paidAmount: paid.toFixed(2),
    remainingPayment: remaining.toFixed(2),
  };
}
