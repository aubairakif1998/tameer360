import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gte, inArray, lte, ne, sql } from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import {
  getLast7Days,
  getPakistanMonthRange,
} from '../../../shared/common/pakistan-date';
import {
  OUTSTANDING_LEDGER,
  type OutstandingLedgerPort,
  type OutstandingSummaryItem,
} from '../../../shared/ledger/ledger.types';
import { StockLedgerService } from '../../../shared/stock/stock-ledger.service';
import { customers } from '../../../shared/database/schema/customers';
import { dispatches } from '../../../shared/database/schema/dispatches';
import { orders } from '../../../shared/database/schema/orders';
import { payments } from '../../../shared/database/schema/payments';
import { vehicles } from '../../../shared/database/schema/vehicles';
import type {
  DashboardDailyTrend,
  DashboardKpis,
  DashboardRepository,
} from '../domain/dashboard.entity';
import { DASHBOARD_REPOSITORY } from '../domain/dashboard.entity';
import { calcFulfillmentPercent } from '../../orders/domain/order.mapper';

type DispatchTodayAggregate = {
  count: number;
  qty: string;
  amount: string;
};

type DispatchMonthAggregate = {
  qty: string;
  amount: string;
};

type PaymentAggregate = {
  amount: string;
};

type OpenOrdersAggregate = {
  count: number;
  pendingQty: string;
};

type CountAggregate = {
  count: number;
};

type FleetTodayAggregate = {
  count: string;
};

type RecentDispatchRow = {
  id: string;
  dispatchNumber: string;
  customerName: string;
  vehicleNumber: string;
  quantity: string;
  amount: string;
  dispatchDate: string;
};

type PendingOrderRow = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  orderedQty: string;
  deliveredQty: string;
};

@Injectable()
export class DrizzleDashboardRepository implements DashboardRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    @Inject(OUTSTANDING_LEDGER)
    private readonly ledger: OutstandingLedgerPort,
    @Inject(StockLedgerService)
    private readonly stock: StockLedgerService,
  ) {}

  async getKpis(tenantId: string, asOfDate: string): Promise<DashboardKpis> {
    const { monthStart, monthEnd } = getPakistanMonthRange(asOfDate);

    const todayDispatchWhere = and(
      eq(dispatches.tenantId, tenantId),
      eq(dispatches.dispatchDate, asOfDate),
      ne(dispatches.status, 'cancelled'),
    );

    const monthDispatchWhere = and(
      eq(dispatches.tenantId, tenantId),
      gte(dispatches.dispatchDate, monthStart),
      lte(dispatches.dispatchDate, monthEnd),
      ne(dispatches.status, 'cancelled'),
    );

    const todayPaymentWhere = and(
      eq(payments.tenantId, tenantId),
      eq(payments.paymentDate, asOfDate),
    );

    const monthPaymentWhere = and(
      eq(payments.tenantId, tenantId),
      gte(payments.paymentDate, monthStart),
      lte(payments.paymentDate, monthEnd),
    );

    const outstanding: OutstandingSummaryItem[] =
      await this.ledger.getOutstandingSummary(tenantId);

    const [
      todayDispatch,
      monthDispatch,
      todayPayments,
      monthPayments,
      openOrders,
      fleetTotal,
      fleetToday,
      customerCount,
      recentRows,
      pendingRows,
    ] = (await Promise.all([
      this.db
        .select({
          count: count(),
          qty: sql<string>`COALESCE(SUM(${dispatches.quantity}), 0)`,
          amount: sql<string>`COALESCE(SUM(${dispatches.amount}), 0)`,
        })
        .from(dispatches)
        .where(todayDispatchWhere),

      this.db
        .select({
          qty: sql<string>`COALESCE(SUM(${dispatches.quantity}), 0)`,
          amount: sql<string>`COALESCE(SUM(${dispatches.amount}), 0)`,
        })
        .from(dispatches)
        .where(monthDispatchWhere),

      this.db
        .select({
          amount: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(todayPaymentWhere),

      this.db
        .select({
          amount: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(monthPaymentWhere),

      this.db
        .select({
          count: count(),
          pendingQty: sql<string>`COALESCE(SUM(${orders.orderedQty} - ${orders.deliveredQty}), 0)`,
        })
        .from(orders)
        .where(
          and(
            eq(orders.tenantId, tenantId),
            inArray(orders.status, ['confirmed', 'partial']),
          ),
        ),

      this.db
        .select({ count: count() })
        .from(vehicles)
        .where(
          and(eq(vehicles.tenantId, tenantId), eq(vehicles.isActive, true)),
        ),

      this.db
        .select({
          count: sql<string>`COUNT(DISTINCT ${dispatches.vehicleId})`,
        })
        .from(dispatches)
        .where(todayDispatchWhere),

      this.db
        .select({ count: count() })
        .from(customers)
        .where(
          and(eq(customers.tenantId, tenantId), eq(customers.isActive, true)),
        ),

      this.db
        .select({
          id: dispatches.id,
          dispatchNumber: dispatches.dispatchNumber,
          customerName: customers.name,
          vehicleNumber: vehicles.registrationNumber,
          quantity: dispatches.quantity,
          amount: dispatches.amount,
          dispatchDate: dispatches.dispatchDate,
        })
        .from(dispatches)
        .innerJoin(customers, eq(dispatches.customerId, customers.id))
        .innerJoin(vehicles, eq(dispatches.vehicleId, vehicles.id))
        .where(
          and(
            eq(dispatches.tenantId, tenantId),
            ne(dispatches.status, 'cancelled'),
          ),
        )
        .orderBy(desc(dispatches.dispatchDate), desc(dispatches.createdAt))
        .limit(5),

      this.db
        .select({
          orderId: orders.id,
          orderNumber: orders.orderNumber,
          customerName: customers.name,
          orderedQty: orders.orderedQty,
          deliveredQty: orders.deliveredQty,
        })
        .from(orders)
        .innerJoin(customers, eq(orders.customerId, customers.id))
        .where(
          and(
            eq(orders.tenantId, tenantId),
            inArray(orders.status, ['confirmed', 'partial']),
          ),
        )
        .orderBy(desc(orders.createdAt))
        .limit(5),
    ])) as [
      DispatchTodayAggregate[],
      DispatchMonthAggregate[],
      PaymentAggregate[],
      PaymentAggregate[],
      OpenOrdersAggregate[],
      CountAggregate[],
      FleetTodayAggregate[],
      CountAggregate[],
      RecentDispatchRow[],
      PendingOrderRow[],
    ];

    const [dailyTrend, stockSummary] = await Promise.all([
      this.buildDailyTrend(tenantId, asOfDate),
      this.stock.getSummary(tenantId),
    ]);

    const totalOutstanding = outstanding.reduce(
      (sum, o) => sum + Number(o.remainingBalance),
      0,
    );

    return {
      asOfDate,
      today: {
        dispatchCount: Number(todayDispatch[0]?.count ?? 0),
        dispatchQuantity: Number(todayDispatch[0]?.qty ?? 0).toFixed(0),
        dispatchAmount: Number(todayDispatch[0]?.amount ?? 0).toFixed(2),
        paymentsReceived: Number(todayPayments[0]?.amount ?? 0).toFixed(2),
      },
      month: {
        dispatchQuantity: Number(monthDispatch[0]?.qty ?? 0).toFixed(0),
        dispatchAmount: Number(monthDispatch[0]?.amount ?? 0).toFixed(2),
        paymentsReceived: Number(monthPayments[0]?.amount ?? 0).toFixed(2),
      },
      outstanding: {
        totalBalance: totalOutstanding.toFixed(2),
        customerCount: outstanding.length,
      },
      orders: {
        openCount: Number(openOrders[0]?.count ?? 0),
        pendingDeliveryQty: Math.max(
          0,
          Number(openOrders[0]?.pendingQty ?? 0),
        ).toFixed(0),
      },
      stock: {
        totalStock: stockSummary
          .reduce((s, m) => s + Number(m.currentStock), 0)
          .toFixed(0),
        materials: stockSummary.map((m) => ({
          materialTypeId: m.materialTypeId,
          materialName: m.materialName,
          currentStock: m.currentStock,
        })),
      },
      fleet: {
        totalVehicles: Number(fleetTotal[0]?.count ?? 0),
        activeToday: Number(fleetToday[0]?.count ?? 0),
      },
      customers: {
        totalActive: Number(customerCount[0]?.count ?? 0),
      },
      recentDispatches: recentRows.map((r) => ({
        id: r.id,
        dispatchNumber: r.dispatchNumber,
        customerName: r.customerName,
        vehicleNumber: r.vehicleNumber,
        quantity: r.quantity,
        amount: r.amount,
        dispatchDate: r.dispatchDate,
      })),
      topOutstanding: outstanding.slice(0, 5).map((o) => ({
        customerId: o.customerId,
        customerName: o.customerName,
        remainingBalance: o.remainingBalance,
      })),
      pendingFulfillment: pendingRows.map((r) => {
        const remaining = Math.max(
          0,
          Number(r.orderedQty) - Number(r.deliveredQty),
        );
        return {
          orderId: r.orderId,
          orderNumber: r.orderNumber,
          customerName: r.customerName,
          remainingQty: remaining.toFixed(0),
          fulfillmentPercent: calcFulfillmentPercent(
            r.orderedQty,
            r.deliveredQty,
          ),
        };
      }),
      dailyTrend,
    };
  }

  private async buildDailyTrend(
    tenantId: string,
    asOfDate: string,
  ): Promise<DashboardDailyTrend[]> {
    const days = getLast7Days(asOfDate);
    const start = days[0];
    const end = days[days.length - 1];

    const [dispatchRows, paymentRows] = await Promise.all([
      this.db
        .select({
          date: dispatches.dispatchDate,
          amount: sql<string>`COALESCE(SUM(${dispatches.amount}), 0)`,
        })
        .from(dispatches)
        .where(
          and(
            eq(dispatches.tenantId, tenantId),
            gte(dispatches.dispatchDate, start),
            lte(dispatches.dispatchDate, end),
            ne(dispatches.status, 'cancelled'),
          ),
        )
        .groupBy(dispatches.dispatchDate),

      this.db
        .select({
          date: payments.paymentDate,
          amount: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.tenantId, tenantId),
            gte(payments.paymentDate, start),
            lte(payments.paymentDate, end),
          ),
        )
        .groupBy(payments.paymentDate),
    ]);

    const dispatchMap = new Map(
      dispatchRows.map((r) => [r.date, Number(r.amount).toFixed(2)]),
    );
    const paymentMap = new Map(
      paymentRows.map((r) => [r.date, Number(r.amount).toFixed(2)]),
    );

    return days.map((date) => ({
      date,
      dispatchAmount: dispatchMap.get(date) ?? '0.00',
      paymentAmount: paymentMap.get(date) ?? '0.00',
    }));
  }
}

export const dashboardRepositoryProvider = {
  provide: DASHBOARD_REPOSITORY,
  useClass: DrizzleDashboardRepository,
};
