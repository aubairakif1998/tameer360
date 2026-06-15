import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, ne, sql } from 'drizzle-orm';
import type { DrizzleDB } from '../database/database.types';
import { DRIZZLE } from '../database/database.constants';
import { customers } from '../database/schema/customers';
import { orders } from '../database/schema/orders';
import { payments } from '../database/schema/payments';
import type { CustomerLedger } from '../../modules/customers/domain/customer.entity';
import type {
  OutstandingLedgerPort,
  OutstandingSummaryItem,
} from './ledger.types';

export type { OutstandingSummaryItem } from './ledger.types';

@Injectable()
export class CustomerLedgerService implements OutstandingLedgerPort {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  private buildLedger(
    totalPurchase: number,
    totalReceived: number,
    lastOrderDate: string | null,
  ): CustomerLedger {
    return {
      totalPurchase: totalPurchase.toFixed(2),
      totalReceived: totalReceived.toFixed(2),
      remainingBalance: (totalPurchase - totalReceived).toFixed(2),
      lastOrderDate,
    };
  }

  async getLedgerForCustomer(
    tenantId: string,
    customerId: string,
  ): Promise<CustomerLedger> {
    const [purchase] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        lastOrderDate: sql<string | null>`MAX(${orders.createdAt})`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          eq(orders.customerId, customerId),
          ne(orders.status, 'cancelled'),
        ),
      );

    const [received] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.customerId, customerId),
        ),
      );

    return this.buildLedger(
      Number(purchase?.total ?? 0),
      Number(received?.total ?? 0),
      purchase?.lastOrderDate ?? null,
    );
  }

  async getLedgersForCustomers(
    tenantId: string,
    customerIds: string[],
  ): Promise<Map<string, CustomerLedger>> {
    if (customerIds.length === 0) return new Map();

    const purchaseRows = await this.db
      .select({
        customerId: orders.customerId,
        total: sql<string>`COALESCE(SUM(${orders.totalAmount}), 0)`,
        lastOrderDate: sql<string | null>`MAX(${orders.createdAt})`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.tenantId, tenantId),
          ne(orders.status, 'cancelled'),
          inArray(orders.customerId, customerIds),
        ),
      )
      .groupBy(orders.customerId);

    const receivedRows = await this.db
      .select({
        customerId: payments.customerId,
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          inArray(payments.customerId, customerIds),
        ),
      )
      .groupBy(payments.customerId);

    const purchaseMap = new Map(
      purchaseRows.map((r) => [
        r.customerId,
        { total: Number(r.total), lastOrderDate: r.lastOrderDate },
      ]),
    );
    const receivedMap = new Map(
      receivedRows.map((r) => [r.customerId, Number(r.total)]),
    );

    const map = new Map<string, CustomerLedger>();
    for (const id of customerIds) {
      const p = purchaseMap.get(id);
      map.set(
        id,
        this.buildLedger(
          p?.total ?? 0,
          receivedMap.get(id) ?? 0,
          p?.lastOrderDate ?? null,
        ),
      );
    }
    return map;
  }

  async getOutstandingSummary(
    tenantId: string,
  ): Promise<OutstandingSummaryItem[]> {
    const rows = await this.db
      .select({ id: customers.id, name: customers.name })
      .from(customers)
      .where(
        and(eq(customers.tenantId, tenantId), eq(customers.isActive, true)),
      );

    const results: OutstandingSummaryItem[] = [];

    for (const row of rows) {
      const ledger = await this.getLedgerForCustomer(tenantId, row.id);
      if (Number(ledger.remainingBalance) > 0) {
        results.push({
          customerId: row.id,
          customerName: row.name,
          totalPurchase: ledger.totalPurchase,
          totalReceived: ledger.totalReceived,
          remainingBalance: ledger.remainingBalance,
        });
      }
    }

    return results.sort(
      (a, b) => Number(b.remainingBalance) - Number(a.remainingBalance),
    );
  }
}
