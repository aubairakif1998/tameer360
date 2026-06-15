export interface OutstandingSummaryItem {
  customerId: string;
  customerName: string;
  totalPurchase: string;
  totalReceived: string;
  remainingBalance: string;
}

export const OUTSTANDING_LEDGER = Symbol('OUTSTANDING_LEDGER');

export interface OutstandingLedgerPort {
  getOutstandingSummary(tenantId: string): Promise<OutstandingSummaryItem[]>;
}
