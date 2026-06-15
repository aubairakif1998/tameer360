export interface DashboardToday {
  dispatchCount: number;
  dispatchQuantity: string;
  dispatchAmount: string;
  paymentsReceived: string;
}

export interface DashboardMonth {
  dispatchQuantity: string;
  dispatchAmount: string;
  paymentsReceived: string;
}

export interface DashboardOutstanding {
  totalBalance: string;
  customerCount: number;
}

export interface DashboardOrders {
  openCount: number;
  pendingDeliveryQty: string;
}

export interface DashboardFleet {
  totalVehicles: number;
  activeToday: number;
}

export interface DashboardRecentDispatch {
  id: string;
  dispatchNumber: string;
  customerName: string;
  vehicleNumber: string;
  quantity: string;
  amount: string;
  dispatchDate: string;
}

export interface DashboardOutstandingCustomer {
  customerId: string;
  customerName: string;
  remainingBalance: string;
}

export interface DashboardPendingOrder {
  orderId: string;
  orderNumber: string;
  customerName: string;
  remainingQty: string;
  fulfillmentPercent: number;
}

export interface DashboardDailyTrend {
  date: string;
  dispatchAmount: string;
  paymentAmount: string;
}

export interface DashboardStock {
  totalStock: string;
  materials: Array<{
    materialTypeId: string;
    materialName: string;
    currentStock: string;
  }>;
}

export interface DashboardKpis {
  asOfDate: string;
  today: DashboardToday;
  month: DashboardMonth;
  outstanding: DashboardOutstanding;
  orders: DashboardOrders;
  stock: DashboardStock;
  fleet: DashboardFleet;
  customers: { totalActive: number };
  recentDispatches: DashboardRecentDispatch[];
  topOutstanding: DashboardOutstandingCustomer[];
  pendingFulfillment: DashboardPendingOrder[];
  dailyTrend: DashboardDailyTrend[];
}

export const DASHBOARD_REPOSITORY = Symbol('DASHBOARD_REPOSITORY');

export interface DashboardRepository {
  getKpis(tenantId: string, asOfDate: string): Promise<DashboardKpis>;
}
