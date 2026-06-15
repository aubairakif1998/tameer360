export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export type BusinessType =
  | "brick_kiln"
  | "sand"
  | "crush"
  | "cement"
  | "steel"
  | "general";

export interface TenantBranding {
  slug: string;
  displayName: string;
  businessType: BusinessType;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  showPoweredBy: boolean;
}

export interface HealthStatus {
  status: "ok";
  service: string;
  timestamp: string;
}

export type CustomerType = "vendor" | "contractor" | "builder" | "individual";

export interface CustomerLedger {
  totalPurchase: string;
  totalReceived: string;
  remainingBalance: string;
  lastOrderDate: string | null;
}

export interface CustomerListItem {
  id: string;
  tenantId: string;
  name: string;
  phone: string | null;
  cnic: string | null;
  type: CustomerType;
  notes: string | null;
  isActive: boolean;
  ledger: CustomerLedger;
  createdAt: string;
  updatedAt: string;
}

export type CustomerDetail = CustomerListItem;

export interface ListCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: CustomerType;
  isActive?: boolean;
}

export interface PaginatedCustomers {
  items: CustomerListItem[];
  meta: { page: number; limit: number; total: number };
}

export interface CreateCustomerInput {
  name: string;
  phone: string;
  type?: CustomerType;
  cnic?: string;
  notes?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string;
  type?: CustomerType;
  cnic?: string | null;
  notes?: string;
  isActive?: boolean;
}

export type MaterialUnit = "piece" | "ton" | "cft" | "bag";

export type MaterialCategory =
  | "brick"
  | "sand"
  | "crush"
  | "cement"
  | "steel"
  | "other";

export interface MaterialType {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  defaultRate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListMaterialTypesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: MaterialCategory;
  isActive?: boolean;
}

export interface PaginatedMaterialTypes {
  items: MaterialType[];
  meta: { page: number; limit: number; total: number };
}

export interface CreateMaterialTypeInput {
  name: string;
  code?: string;
  category: MaterialCategory;
  unit?: MaterialUnit;
  defaultRate?: number;
}

export interface UpdateMaterialTypeInput {
  name?: string;
  code?: string;
  category?: MaterialCategory;
  unit?: MaterialUnit;
  defaultRate?: number | null;
  isActive?: boolean;
}

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "partial"
  | "fulfilled"
  | "cancelled";

export interface OrderListItem {
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
  customerName: string;
  materialName: string;
  remainingQty: string;
  fulfillmentPercent: number;
  paymentPercent: number;
  remainingPayment: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends OrderListItem {
  customerPhone: string | null;
  materialCode: string;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: OrderStatus;
  dispatchedOnly?: boolean;
}

export interface PaginatedOrders {
  items: OrderListItem[];
  meta: { page: number; limit: number; total: number };
}

export interface CreateOrderInput {
  customerId: string;
  deliveryAddress: string;
  materialTypeId: string;
  orderedQty: number;
  rate: number;
  expectedDeliveryDate?: string;
  notes?: string;
}

export type VehicleType = "truck" | "loader" | "tractor" | "dumper";
export type VehicleOwnerType = "owned" | "rented";

export interface Vehicle {
  id: string;
  tenantId: string;
  registrationNumber: string;
  type: VehicleType;
  ownerType: VehicleOwnerType;
  driverName: string | null;
  capacity: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleInput {
  registrationNumber: string;
  type?: VehicleType;
  ownerType?: VehicleOwnerType;
  driverName?: string;
  capacity?: number;
}

export type DispatchStatus =
  | "scheduled"
  | "loaded"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type DispatchPaymentStatus = 'unpaid' | 'paid';

export interface DispatchListItem {
  id: string;
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
  scheduledStartAt: string;
  expectedDeliveryAt: string;
  travelTimeMinutes: number | null;
  journeyKm: string | null;
  status: DispatchStatus;
  paymentStatus: DispatchPaymentStatus;
  notes: string | null;
  customerName: string;
  materialName: string;
  vehicleNumber: string;
  orderNumber: string;
  paidAmount: string;
  remainingPayment: string;
  createdAt: string;
  updatedAt: string;
}

export interface DispatchDetail extends DispatchListItem {
  customerPhone: string | null;
  materialCode: string;
}

export interface CreateDispatchInput {
  orderId: string;
  vehicleId: string;
  quantity: number;
  scheduledStartAt: string;
  expectedDeliveryAt: string;
  dispatchDate?: string;
  journeyKm?: number;
  pickupLocation?: string;
  dropoffLocation?: string;
  driverName?: string;
  notes?: string;
}

export interface UpdateDispatchInput {
  driverName?: string;
  scheduledStartAt?: string;
  expectedDeliveryAt?: string;
  dispatchDate?: string;
  journeyKm?: number | null;
  pickupLocation?: string;
  dropoffLocation?: string;
  status?: DispatchStatus;
  notes?: string;
}

export interface ListDispatchesParams {
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

export interface PaginatedDispatches {
  items: DispatchListItem[];
  meta: { page: number; limit: number; total: number };
}

export type PaymentMethod =
  | "cash"
  | "bank"
  | "cheque"
  | "jazzcash"
  | "easypaisa";

export interface PaymentListItem {
  id: string;
  receiptNumber: string;
  customerId: string;
  orderId: string;
  dispatchId: string | null;
  amount: string;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  referenceNumber: string | null;
  notes: string | null;
  customerName: string;
  orderNumber: string;
  dispatchNumber: string | null;
  dispatchStatus: DispatchStatus | null;
  orderTotalAmount: string;
  orderReceivedAmount: string;
  orderPaymentPercent: number;
  orderRemainingPayment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  dispatchId: string;
  amount: number;
  paymentMethod?: PaymentMethod;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface StockSummaryItem {
  materialTypeId: string;
  materialName: string;
  materialCode: string;
  unit: string;
  currentStock: string;
}

export interface StockReservationItem {
  dispatchId: string;
  dispatchNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  quantity: string;
  status: Extract<DispatchStatus, "scheduled" | "loaded" | "in_transit">;
  dispatchDate: string;
}

export interface StockAvailabilityItem {
  materialTypeId: string;
  materialName: string;
  materialCode: string;
  unit: string;
  physicalStock: string;
  committedQty: string;
  availableQty: string;
  reservations: StockReservationItem[];
}

export type StockTransactionType =
  | "opening"
  | "production"
  | "dispatch"
  | "adjustment";

export interface StockLedgerItem {
  id: string;
  materialTypeId: string;
  materialName: string;
  materialCode: string;
  transactionType: StockTransactionType;
  quantity: string;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface CreateStockEntryInput {
  materialTypeId: string;
  transactionType: "opening" | "adjustment";
  quantity: number;
  transactionDate: string;
  notes?: string;
}

export interface ProductionBatchListItem {
  id: string;
  batchNumber: string;
  materialTypeId: string;
  materialName: string;
  materialCode: string;
  producedQty: string;
  damagedQty: string;
  netQty: string;
  productionDate: string;
  notes: string | null;
  createdAt: string;
}

export interface ProductionBatchDetail extends ProductionBatchListItem {
  updatedAt: string;
}

export interface PaginatedProductionBatches {
  items: ProductionBatchListItem[];
  meta: { page: number; limit: number; total: number };
}

export interface CreateProductionBatchInput {
  materialTypeId: string;
  producedQty: number;
  damagedQty?: number;
  productionDate: string;
  notes?: string;
}

export interface AgingBucket {
  bucket: "current" | "31-60" | "61-90" | "90+";
  label: string;
  amount: string;
  customerCount: number;
}

export interface AgingCustomerItem {
  customerId: string;
  customerName: string;
  totalOutstanding: string;
  current: string;
  days31to60: string;
  days61to90: string;
  days90plus: string;
  oldestInvoiceDate: string | null;
}

export interface AgingReceivablesReport {
  asOfDate: string;
  totalOutstanding: string;
  buckets: AgingBucket[];
  customers: AgingCustomerItem[];
}

export interface ProfitReport {
  periodStart: string;
  periodEnd: string;
  summary: {
    revenue: string;
    collections: string;
    cogs: string;
    vehicleExpenses: string;
    grossProfit: string;
    netProfit: string;
    dispatchCount: number;
    totalQuantity: string;
  };
  byCustomer: Array<{
    customerId: string;
    customerName: string;
    revenue: string;
    collections: string;
    outstanding: string;
    dispatchCount: number;
    quantity: string;
  }>;
  byVehicle: Array<{
    vehicleId: string;
    vehicleNumber: string;
    revenue: string;
    expenses: string;
    netProfit: string;
    dispatchCount: number;
    quantity: string;
  }>;
  monthly: Array<{
    month: string;
    revenue: string;
    collections: string;
    cogs: string;
    vehicleExpenses: string;
    grossProfit: string;
    netProfit: string;
  }>;
}

export interface DashboardKpis {
  asOfDate: string;
  today: {
    dispatchCount: number;
    dispatchQuantity: string;
    dispatchAmount: string;
    paymentsReceived: string;
  };
  month: {
    dispatchQuantity: string;
    dispatchAmount: string;
    paymentsReceived: string;
  };
  outstanding: {
    totalBalance: string;
    customerCount: number;
  };
  orders: {
    openCount: number;
    pendingDeliveryQty: string;
  };
  stock: {
    totalStock: string;
    materials: Array<{
      materialTypeId: string;
      materialName: string;
      currentStock: string;
    }>;
  };
  fleet: {
    totalVehicles: number;
    activeToday: number;
  };
  customers: { totalActive: number };
  recentDispatches: Array<{
    id: string;
    dispatchNumber: string;
    customerName: string;
    vehicleNumber: string;
    quantity: string;
    amount: string;
    dispatchDate: string;
  }>;
  topOutstanding: Array<{
    customerId: string;
    customerName: string;
    remainingBalance: string;
  }>;
  pendingFulfillment: Array<{
    orderId: string;
    orderNumber: string;
    customerName: string;
    remainingQty: string;
    fulfillmentPercent: number;
  }>;
  dailyTrend: Array<{
    date: string;
    dispatchAmount: string;
    paymentAmount: string;
  }>;
}

export interface OutstandingItem {
  customerId: string;
  customerName: string;
  totalPurchase: string;
  totalReceived: string;
  remainingBalance: string;
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
