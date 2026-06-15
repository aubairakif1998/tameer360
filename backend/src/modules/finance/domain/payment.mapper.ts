import type { PaymentRecord } from '../../../shared/database/schema/payments';
import type { Payment, PaymentListItem } from './payment.entity';
import {
  calcPaymentPercent,
  calcRemainingPayment,
} from '../../orders/domain/order.mapper';

export function toPayment(record: PaymentRecord): Payment {
  return {
    id: record.id,
    tenantId: record.tenantId,
    receiptNumber: record.receiptNumber,
    customerId: record.customerId,
    orderId: record.orderId,
    dispatchId: record.dispatchId,
    amount: record.amount,
    paymentMethod: record.paymentMethod,
    paymentDate: record.paymentDate,
    referenceNumber: record.referenceNumber,
    notes: record.notes,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toPaymentListItem(
  record: PaymentRecord,
  customerName: string,
  orderNumber: string,
  dispatchNumber: string | null,
  orderTotalAmount: string,
  orderReceivedAmount: string,
  dispatchStatus: PaymentListItem['dispatchStatus'] = null,
): PaymentListItem {
  return {
    ...toPayment(record),
    customerName,
    orderNumber,
    dispatchNumber,
    dispatchStatus,
    orderTotalAmount,
    orderReceivedAmount,
    orderPaymentPercent: calcPaymentPercent(
      orderReceivedAmount,
      orderTotalAmount,
    ),
    orderRemainingPayment: calcRemainingPayment(
      orderReceivedAmount,
      orderTotalAmount,
    ),
  };
}
