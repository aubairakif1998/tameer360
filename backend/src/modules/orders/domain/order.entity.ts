export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'partial'
  | 'fulfilled'
  | 'cancelled';

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerId: string;
  deliveryAddress: string;
  materialTypeId: string;
  orderedQty: string;
  deliveredQty: string;
  rate: string;
  totalAmount: string;
  receivedAmount: string;
  expectedDeliveryDate: string | null;
  status: OrderStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderListItem extends Order {
  customerName: string;
  materialName: string;
  remainingQty: string;
  fulfillmentPercent: number;
  paymentPercent: number;
  remainingPayment: string;
}

export interface OrderDetail extends OrderListItem {
  customerPhone: string | null;
  materialCode: string;
}

export interface CreateOrderInput {
  customerId: string;
  deliveryAddress: string;
  materialTypeId: string;
  orderedQty: number;
  rate: number;
  expectedDeliveryDate?: string;
  notes?: string;
  status?: OrderStatus;
}

export interface UpdateOrderInput {
  deliveryAddress?: string;
  expectedDeliveryDate?: string | null;
  notes?: string;
  status?: OrderStatus;
}

export interface ListOrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: OrderStatus;
  dispatchedOnly?: boolean;
}

export interface FulfillmentSummaryItem {
  orderId: string;
  orderNumber: string;
  customerName: string;
  materialName: string;
  orderedQty: string;
  deliveredQty: string;
  remainingQty: string;
  fulfillmentPercent: number;
  status: OrderStatus;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface OrderRepository {
  findMany(
    tenantId: string,
    query: ListOrdersQuery,
  ): Promise<{ items: OrderListItem[]; total: number }>;
  findById(tenantId: string, id: string): Promise<OrderDetail | null>;
  create(tenantId: string, input: CreateOrderInput): Promise<OrderDetail>;
  update(
    tenantId: string,
    id: string,
    input: UpdateOrderInput,
  ): Promise<OrderDetail | null>;
  getFulfillmentSummary(tenantId: string): Promise<FulfillmentSummaryItem[]>;
  getNextOrderNumber(tenantId: string): Promise<string>;
}
