import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, gte, lte, ne, sql } from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { CustomerLedgerService } from '../../../shared/ledger/customer-ledger.service';
import { customers } from '../../../shared/database/schema/customers';
import { dispatches } from '../../../shared/database/schema/dispatches';
import { materialTypes } from '../../../shared/database/schema/material-types';
import { orders } from '../../../shared/database/schema/orders';
import { payments } from '../../../shared/database/schema/payments';
import { vehicles } from '../../../shared/database/schema/vehicles';
import { vehicleExpenses } from '../../../shared/database/schema/vehicle-expenses';
import type {
  AgingBucket,
  AgingCustomerItem,
  AgingReceivablesReport,
  ProfitReport,
  ReportsRepository,
} from '../domain/reports.entity';
import { REPORTS_REPOSITORY } from '../domain/reports.entity';

function daysBetween(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function bucketForDays(days: number): keyof AgingCustomerItem {
  if (days <= 30) return 'current';
  if (days <= 60) return 'days31to60';
  if (days <= 90) return 'days61to90';
  return 'days90plus';
}

@Injectable()
export class DrizzleReportsRepository implements ReportsRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly ledger: CustomerLedgerService,
  ) {}

  async getAgingReceivables(
    tenantId: string,
    asOfDate: string,
  ): Promise<AgingReceivablesReport> {
    const outstanding = await this.ledger.getOutstandingSummary(tenantId);
    const customerItems: AgingCustomerItem[] = [];

    for (const cust of outstanding) {
      const orderRows = await this.db
        .select({
          id: orders.id,
          totalAmount: orders.totalAmount,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(
          and(
            eq(orders.tenantId, tenantId),
            eq(orders.customerId, cust.customerId),
            ne(orders.status, 'cancelled'),
          ),
        )
        .orderBy(asc(orders.createdAt));

      const paymentRows = await this.db
        .select({ amount: payments.amount, paymentDate: payments.paymentDate })
        .from(payments)
        .where(
          and(
            eq(payments.tenantId, tenantId),
            eq(payments.customerId, cust.customerId),
          ),
        )
        .orderBy(asc(payments.paymentDate));

      let paymentPool = paymentRows.reduce((s, p) => s + Number(p.amount), 0);
      const buckets = {
        current: 0,
        days31to60: 0,
        days61to90: 0,
        days90plus: 0,
      };
      let oldestUnpaid: string | null = null;

      for (const order of orderRows) {
        const orderTotal = Number(order.totalAmount);
        const allocated = Math.min(paymentPool, orderTotal);
        const remaining = orderTotal - allocated;
        paymentPool -= allocated;

        if (remaining > 0) {
          const invoiceDate = order.createdAt.toISOString().slice(0, 10);
          const age = daysBetween(invoiceDate, asOfDate);
          const key = bucketForDays(age);
          if (key === 'current') buckets.current += remaining;
          else if (key === 'days31to60') buckets.days31to60 += remaining;
          else if (key === 'days61to90') buckets.days61to90 += remaining;
          else buckets.days90plus += remaining;

          if (!oldestUnpaid) oldestUnpaid = invoiceDate;
        }
      }

      const totalOutstanding = Number(cust.remainingBalance);
      if (totalOutstanding > 0) {
        customerItems.push({
          customerId: cust.customerId,
          customerName: cust.customerName,
          totalOutstanding: totalOutstanding.toFixed(2),
          current: buckets.current.toFixed(2),
          days31to60: buckets.days31to60.toFixed(2),
          days61to90: buckets.days61to90.toFixed(2),
          days90plus: buckets.days90plus.toFixed(2),
          oldestInvoiceDate: oldestUnpaid,
        });
      }
    }

    const bucketDefs: AgingBucket[] = [
      {
        bucket: 'current',
        label: '0–30 days',
        amount: '0.00',
        customerCount: 0,
      },
      {
        bucket: '31-60',
        label: '31–60 days',
        amount: '0.00',
        customerCount: 0,
      },
      {
        bucket: '61-90',
        label: '61–90 days',
        amount: '0.00',
        customerCount: 0,
      },
      { bucket: '90+', label: '90+ days', amount: '0.00', customerCount: 0 },
    ];

    for (const c of customerItems) {
      if (Number(c.current) > 0) {
        bucketDefs[0].amount = (
          Number(bucketDefs[0].amount) + Number(c.current)
        ).toFixed(2);
        bucketDefs[0].customerCount++;
      }
      if (Number(c.days31to60) > 0) {
        bucketDefs[1].amount = (
          Number(bucketDefs[1].amount) + Number(c.days31to60)
        ).toFixed(2);
        bucketDefs[1].customerCount++;
      }
      if (Number(c.days61to90) > 0) {
        bucketDefs[2].amount = (
          Number(bucketDefs[2].amount) + Number(c.days61to90)
        ).toFixed(2);
        bucketDefs[2].customerCount++;
      }
      if (Number(c.days90plus) > 0) {
        bucketDefs[3].amount = (
          Number(bucketDefs[3].amount) + Number(c.days90plus)
        ).toFixed(2);
        bucketDefs[3].customerCount++;
      }
    }

    const totalOutstanding = customerItems.reduce(
      (s, c) => s + Number(c.totalOutstanding),
      0,
    );

    return {
      asOfDate,
      totalOutstanding: totalOutstanding.toFixed(2),
      buckets: bucketDefs,
      customers: customerItems.sort(
        (a, b) => Number(b.totalOutstanding) - Number(a.totalOutstanding),
      ),
    };
  }

  async getProfitReport(
    tenantId: string,
    periodStart: string,
    periodEnd: string,
  ): Promise<ProfitReport> {
    const dispatchWhere = and(
      eq(dispatches.tenantId, tenantId),
      gte(dispatches.dispatchDate, periodStart),
      lte(dispatches.dispatchDate, periodEnd),
      ne(dispatches.status, 'cancelled'),
    );

    const paymentWhere = and(
      eq(payments.tenantId, tenantId),
      gte(payments.paymentDate, periodStart),
      lte(payments.paymentDate, periodEnd),
    );

    const expenseWhere = and(
      eq(vehicleExpenses.tenantId, tenantId),
      gte(vehicleExpenses.expenseDate, periodStart),
      lte(vehicleExpenses.expenseDate, periodEnd),
    );

    const [
      dispatchSummary,
      paymentSummary,
      expenseSummary,
      byCustomerRows,
      byVehicleRows,
      monthlyDispatchRows,
      monthlyPaymentRows,
      monthlyExpenseRows,
      monthlyCogsRows,
    ] = await Promise.all([
      this.db
        .select({
          revenue: sql<string>`COALESCE(SUM(${dispatches.amount}), 0)`,
          count: sql<string>`COUNT(*)`,
          qty: sql<string>`COALESCE(SUM(${dispatches.quantity}), 0)`,
        })
        .from(dispatches)
        .where(dispatchWhere),

      this.db
        .select({
          collections: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(paymentWhere),

      this.db
        .select({
          expenses: sql<string>`COALESCE(SUM(${vehicleExpenses.amount}), 0)`,
        })
        .from(vehicleExpenses)
        .where(expenseWhere),

      this.db
        .select({
          customerId: customers.id,
          customerName: customers.name,
          revenue: sql<string>`COALESCE(SUM(${dispatches.amount}), 0)`,
          qty: sql<string>`COALESCE(SUM(${dispatches.quantity}), 0)`,
          count: sql<string>`COUNT(*)`,
        })
        .from(dispatches)
        .innerJoin(customers, eq(dispatches.customerId, customers.id))
        .where(dispatchWhere)
        .groupBy(customers.id, customers.name)
        .orderBy(sql`SUM(${dispatches.amount}) DESC`),

      this.db
        .select({
          vehicleId: vehicles.id,
          vehicleNumber: vehicles.registrationNumber,
          revenue: sql<string>`COALESCE(SUM(${dispatches.amount}), 0)`,
          qty: sql<string>`COALESCE(SUM(${dispatches.quantity}), 0)`,
          count: sql<string>`COUNT(*)`,
        })
        .from(dispatches)
        .innerJoin(vehicles, eq(dispatches.vehicleId, vehicles.id))
        .where(dispatchWhere)
        .groupBy(vehicles.id, vehicles.registrationNumber)
        .orderBy(sql`SUM(${dispatches.amount}) DESC`),

      this.db
        .select({
          month: sql<string>`TO_CHAR(${dispatches.dispatchDate}, 'YYYY-MM')`,
          revenue: sql<string>`COALESCE(SUM(${dispatches.amount}), 0)`,
        })
        .from(dispatches)
        .where(dispatchWhere)
        .groupBy(sql`TO_CHAR(${dispatches.dispatchDate}, 'YYYY-MM')`),

      this.db
        .select({
          month: sql<string>`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`,
          collections: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(paymentWhere)
        .groupBy(sql`TO_CHAR(${payments.paymentDate}, 'YYYY-MM')`),

      this.db
        .select({
          month: sql<string>`TO_CHAR(${vehicleExpenses.expenseDate}, 'YYYY-MM')`,
          expenses: sql<string>`COALESCE(SUM(${vehicleExpenses.amount}), 0)`,
        })
        .from(vehicleExpenses)
        .where(expenseWhere)
        .groupBy(sql`TO_CHAR(${vehicleExpenses.expenseDate}, 'YYYY-MM')`),

      this.db
        .select({
          month: sql<string>`TO_CHAR(${dispatches.dispatchDate}, 'YYYY-MM')`,
          cogs: sql<string>`COALESCE(SUM(${dispatches.quantity} * COALESCE(${materialTypes.productionCost}, 0)), 0)`,
        })
        .from(dispatches)
        .innerJoin(
          materialTypes,
          eq(dispatches.materialTypeId, materialTypes.id),
        )
        .where(dispatchWhere)
        .groupBy(sql`TO_CHAR(${dispatches.dispatchDate}, 'YYYY-MM')`),
    ]);

    const vehicleExpenseRows = await this.db
      .select({
        vehicleId: vehicleExpenses.vehicleId,
        expenses: sql<string>`COALESCE(SUM(${vehicleExpenses.amount}), 0)`,
      })
      .from(vehicleExpenses)
      .where(expenseWhere)
      .groupBy(vehicleExpenses.vehicleId);

    const vehicleExpenseMap = new Map(
      vehicleExpenseRows.map((r) => [r.vehicleId, Number(r.expenses)]),
    );

    const [cogsRow] = await this.db
      .select({
        cogs: sql<string>`COALESCE(SUM(${dispatches.quantity} * COALESCE(${materialTypes.productionCost}, 0)), 0)`,
      })
      .from(dispatches)
      .innerJoin(materialTypes, eq(dispatches.materialTypeId, materialTypes.id))
      .where(dispatchWhere);

    const revenue = Number(dispatchSummary[0]?.revenue ?? 0);
    const collections = Number(paymentSummary[0]?.collections ?? 0);
    const cogs = Number(cogsRow?.cogs ?? 0);
    const vehicleExpensesTotal = Number(expenseSummary[0]?.expenses ?? 0);
    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - vehicleExpensesTotal;

    const customerLedgers = await Promise.all(
      byCustomerRows.map(async (r) => {
        const ledger = await this.ledger.getLedgerForCustomer(
          tenantId,
          r.customerId,
        );
        const customerPayments = await this.db
          .select({
            total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
          })
          .from(payments)
          .where(
            and(
              eq(payments.tenantId, tenantId),
              eq(payments.customerId, r.customerId),
              gte(payments.paymentDate, periodStart),
              lte(payments.paymentDate, periodEnd),
            ),
          );
        return {
          customerId: r.customerId,
          customerName: r.customerName,
          revenue: Number(r.revenue).toFixed(2),
          collections: Number(customerPayments[0]?.total ?? 0).toFixed(2),
          outstanding: ledger.remainingBalance,
          dispatchCount: Number(r.count),
          quantity: Number(r.qty).toFixed(0),
        };
      }),
    );

    const byVehicle = byVehicleRows.map((r) => {
      const expenses = vehicleExpenseMap.get(r.vehicleId) ?? 0;
      const rev = Number(r.revenue);
      return {
        vehicleId: r.vehicleId,
        vehicleNumber: r.vehicleNumber,
        revenue: rev.toFixed(2),
        expenses: expenses.toFixed(2),
        netProfit: (rev - expenses).toFixed(2),
        dispatchCount: Number(r.count),
        quantity: Number(r.qty).toFixed(0),
      };
    });

    const monthSet = new Set<string>();
    for (const r of monthlyDispatchRows) monthSet.add(r.month);
    for (const r of monthlyPaymentRows) monthSet.add(r.month);
    for (const r of monthlyExpenseRows) monthSet.add(r.month);

    const dispatchMonthMap = new Map(
      monthlyDispatchRows.map((r) => [r.month, Number(r.revenue)]),
    );
    const paymentMonthMap = new Map(
      monthlyPaymentRows.map((r) => [r.month, Number(r.collections)]),
    );
    const expenseMonthMap = new Map(
      monthlyExpenseRows.map((r) => [r.month, Number(r.expenses)]),
    );
    const cogsMonthMap = new Map(
      monthlyCogsRows.map((r) => [r.month, Number(r.cogs)]),
    );

    const monthly = [...monthSet].sort().map((month) => {
      const rev = dispatchMonthMap.get(month) ?? 0;
      const coll = paymentMonthMap.get(month) ?? 0;
      const cogsM = cogsMonthMap.get(month) ?? 0;
      const exp = expenseMonthMap.get(month) ?? 0;
      const gross = rev - cogsM;
      return {
        month,
        revenue: rev.toFixed(2),
        collections: coll.toFixed(2),
        cogs: cogsM.toFixed(2),
        vehicleExpenses: exp.toFixed(2),
        grossProfit: gross.toFixed(2),
        netProfit: (gross - exp).toFixed(2),
      };
    });

    return {
      periodStart,
      periodEnd,
      summary: {
        revenue: revenue.toFixed(2),
        collections: collections.toFixed(2),
        cogs: cogs.toFixed(2),
        vehicleExpenses: vehicleExpensesTotal.toFixed(2),
        grossProfit: grossProfit.toFixed(2),
        netProfit: netProfit.toFixed(2),
        dispatchCount: Number(dispatchSummary[0]?.count ?? 0),
        totalQuantity: Number(dispatchSummary[0]?.qty ?? 0).toFixed(0),
      },
      byCustomer: customerLedgers,
      byVehicle,
      monthly,
    };
  }
}

export const reportsRepositoryProvider = {
  provide: REPORTS_REPOSITORY,
  useClass: DrizzleReportsRepository,
};
