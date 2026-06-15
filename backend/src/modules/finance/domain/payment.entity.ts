import type { DispatchStatus } from '../../dispatches/domain/dispatch.entity';

export type PaymentMethod =
  | 'cash'
  | 'bank'
  | 'cheque'
  | 'jazzcash'
  | 'easypaisa';

export interface Payment {
  id: string;
  tenantId: string;
  receiptNumber: string;
  customerId: string;
  orderId: string;
  dispatchId: string | null;
  amount: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentListItem extends Payment {
  customerName: string;
  orderNumber: string;
  dispatchNumber: string | null;
  dispatchStatus: DispatchStatus | null;
  orderTotalAmount: string;
  orderReceivedAmount: string;
  orderPaymentPercent: number;
  orderRemainingPayment: string;
}

export interface CreatePaymentInput {
  dispatchId: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface ListPaymentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  orderId?: string;
  dispatchId?: string;
  paymentMethod?: PaymentMethod;
  dateFrom?: string;
  dateTo?: string;
}

export const PAYMENT_REPOSITORY = Symbol('PAYMENT_REPOSITORY');

export interface PaymentRepository {
  findMany(
    tenantId: string,
    query: ListPaymentsQuery,
  ): Promise<{ items: PaymentListItem[]; total: number }>;
  findById(tenantId: string, id: string): Promise<PaymentListItem | null>;
  create(tenantId: string, input: CreatePaymentInput): Promise<PaymentListItem>;
  delete(tenantId: string, id: string): Promise<boolean>;
  getNextReceiptNumber(tenantId: string): Promise<string>;
}
