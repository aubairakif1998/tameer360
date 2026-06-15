export type DispatchStatus =
  | 'scheduled'
  | 'loaded'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export type DispatchPaymentStatus = 'unpaid' | 'paid';

export interface Dispatch {
  id: string;
  tenantId: string;
  dispatchNumber: string;
  orderId: string;
  customerId: string;
  vehicleId: string;
  driverName: string | null;
  materialTypeId: string;
  quantity: string;
  rate: string;
  amount: string;
  deliveryLocation: string;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  dispatchDate: string;
  scheduledStartAt: Date;
  expectedDeliveryAt: Date;
  travelTimeMinutes: number | null;
  journeyKm: string | null;
  status: DispatchStatus;
  paymentStatus: DispatchPaymentStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DispatchListItem extends Dispatch {
  customerName: string;
  materialName: string;
  vehicleNumber: string;
  orderNumber: string;
  paidAmount: string;
  remainingPayment: string;
}

export interface DispatchDetail extends DispatchListItem {
  customerPhone: string | null;
  materialCode: string;
}

export interface CreateDispatchInput {
  orderId: string;
  vehicleId: string;
  quantity: number;
  scheduledStartAt?: string;
  expectedDeliveryAt?: string;
  dispatchDate?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  journeyKm?: number;
  driverName?: string;
  notes?: string;
}

export interface UpdateDispatchInput {
  driverName?: string;
  dispatchDate?: string;
  scheduledStartAt?: string;
  expectedDeliveryAt?: string;
  journeyKm?: number | null;
  pickupLocation?: string;
  dropoffLocation?: string;
  status?: DispatchStatus;
  notes?: string;
}

export interface ListDispatchesQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  orderId?: string;
  status?: DispatchStatus;
  paymentStatus?: DispatchPaymentStatus;
  payableOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export const DISPATCH_REPOSITORY = Symbol('DISPATCH_REPOSITORY');

export interface DispatchRepository {
  findMany(
    tenantId: string,
    query: ListDispatchesQuery,
  ): Promise<{ items: DispatchListItem[]; total: number }>;
  findById(tenantId: string, id: string): Promise<DispatchDetail | null>;
  create(tenantId: string, input: CreateDispatchInput): Promise<DispatchDetail>;
  update(
    tenantId: string,
    id: string,
    input: UpdateDispatchInput,
  ): Promise<DispatchDetail | null>;
  getNextDispatchNumber(tenantId: string): Promise<string>;
}
