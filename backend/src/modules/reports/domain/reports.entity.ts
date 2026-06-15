export interface AgingBucket {
  bucket: 'current' | '31-60' | '61-90' | '90+';
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

export interface ProfitByCustomer {
  customerId: string;
  customerName: string;
  revenue: string;
  collections: string;
  outstanding: string;
  dispatchCount: number;
  quantity: string;
}

export interface ProfitByVehicle {
  vehicleId: string;
  vehicleNumber: string;
  revenue: string;
  expenses: string;
  netProfit: string;
  dispatchCount: number;
  quantity: string;
}

export interface ProfitMonthly {
  month: string;
  revenue: string;
  collections: string;
  cogs: string;
  vehicleExpenses: string;
  grossProfit: string;
  netProfit: string;
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
  byCustomer: ProfitByCustomer[];
  byVehicle: ProfitByVehicle[];
  monthly: ProfitMonthly[];
}

export const REPORTS_REPOSITORY = Symbol('REPORTS_REPOSITORY');

export interface ReportsRepository {
  getAgingReceivables(
    tenantId: string,
    asOfDate: string,
  ): Promise<AgingReceivablesReport>;
  getProfitReport(
    tenantId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<ProfitReport>;
}
