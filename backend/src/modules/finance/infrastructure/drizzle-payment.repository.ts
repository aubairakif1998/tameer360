import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { formatReceiptNumber } from '../../../shared/common/receipt-number';
import { parsePagination } from '../../../shared/common/pagination';
import { PaymentSyncService } from '../../../shared/ledger/payment-sync.service';
import { customers } from '../../../shared/database/schema/customers';
import { dispatches } from '../../../shared/database/schema/dispatches';
import { orders } from '../../../shared/database/schema/orders';
import { payments } from '../../../shared/database/schema/payments';
import type {
  CreatePaymentInput,
  ListPaymentsQuery,
  PaymentListItem,
  PaymentRepository,
} from '../domain/payment.entity';
import { PAYMENT_REPOSITORY } from '../domain/payment.entity';
import { toPaymentListItem } from '../domain/payment.mapper';

@Injectable()
export class DrizzlePaymentRepository implements PaymentRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly paymentSync: PaymentSyncService,
  ) {}

  async getNextReceiptNumber(tenantId: string): Promise<string> {
    const [result] = await this.db
      .select({ count: count() })
      .from(payments)
      .where(eq(payments.tenantId, tenantId));
    return formatReceiptNumber(Number(result?.count ?? 0) + 1);
  }

  private buildWhere(tenantId: string, query: ListPaymentsQuery) {
    const conditions = [eq(payments.tenantId, tenantId)];

    if (query.customerId) {
      conditions.push(eq(payments.customerId, query.customerId));
    }
    if (query.orderId) {
      conditions.push(eq(payments.orderId, query.orderId));
    }
    if (query.dispatchId) {
      conditions.push(eq(payments.dispatchId, query.dispatchId));
    }
    if (query.paymentMethod) {
      conditions.push(eq(payments.paymentMethod, query.paymentMethod));
    }
    if (query.dateFrom) {
      conditions.push(gte(payments.paymentDate, query.dateFrom));
    }
    if (query.dateTo) {
      conditions.push(lte(payments.paymentDate, query.dateTo));
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(payments.receiptNumber, term),
          ilike(customers.name, term),
          ilike(payments.referenceNumber, term),
        )!,
      );
    }

    return and(...conditions);
  }

  async findMany(tenantId: string, query: ListPaymentsQuery) {
    const { limit, offset } = parsePagination(query);
    const where = this.buildWhere(tenantId, query);

    const rows = await this.db
      .select({
        payment: payments,
        customerName: customers.name,
        orderNumber: orders.orderNumber,
        dispatchNumber: dispatches.dispatchNumber,
        dispatchStatus: dispatches.status,
        orderTotalAmount: orders.totalAmount,
        orderReceivedAmount: orders.receivedAmount,
      })
      .from(payments)
      .innerJoin(customers, eq(payments.customerId, customers.id))
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(dispatches, eq(payments.dispatchId, dispatches.id))
      .where(where)
      .orderBy(desc(payments.paymentDate), desc(payments.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(payments)
      .innerJoin(customers, eq(payments.customerId, customers.id))
      .where(where);

    return {
      items: rows.map((r) =>
        toPaymentListItem(
          r.payment,
          r.customerName,
          r.orderNumber,
          r.dispatchNumber,
          r.orderTotalAmount,
          r.orderReceivedAmount,
          r.dispatchStatus ?? null,
        ),
      ),
      total: Number(totalResult?.count ?? 0),
    };
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<PaymentListItem | null> {
    const [row] = await this.db
      .select({
        payment: payments,
        customerName: customers.name,
        orderNumber: orders.orderNumber,
        dispatchNumber: dispatches.dispatchNumber,
        dispatchStatus: dispatches.status,
        orderTotalAmount: orders.totalAmount,
        orderReceivedAmount: orders.receivedAmount,
      })
      .from(payments)
      .innerJoin(customers, eq(payments.customerId, customers.id))
      .innerJoin(orders, eq(payments.orderId, orders.id))
      .leftJoin(dispatches, eq(payments.dispatchId, dispatches.id))
      .where(and(eq(payments.tenantId, tenantId), eq(payments.id, id)))
      .limit(1);

    return row
      ? toPaymentListItem(
          row.payment,
          row.customerName,
          row.orderNumber,
          row.dispatchNumber,
          row.orderTotalAmount,
          row.orderReceivedAmount,
          row.dispatchStatus ?? null,
        )
      : null;
  }

  async create(
    tenantId: string,
    input: CreatePaymentInput,
  ): Promise<PaymentListItem> {
    const [dispatch] = await this.db
      .select({
        id: dispatches.id,
        orderId: dispatches.orderId,
        customerId: dispatches.customerId,
        amount: dispatches.amount,
        status: dispatches.status,
        paymentStatus: dispatches.paymentStatus,
      })
      .from(dispatches)
      .where(
        and(
          eq(dispatches.tenantId, tenantId),
          eq(dispatches.id, input.dispatchId),
        ),
      )
      .limit(1);

    if (!dispatch) {
      throw new BadRequestException({
        code: 'DISPATCH_NOT_FOUND',
        message: 'Dispatch not found',
      });
    }

    if (dispatch.status !== 'delivered') {
      throw new BadRequestException({
        code: 'DISPATCH_NOT_DELIVERED',
        message: 'Payments can only be recorded for delivered dispatches',
      });
    }

    if (dispatch.paymentStatus === 'paid') {
      throw new BadRequestException({
        code: 'DISPATCH_ALREADY_PAID',
        message: 'This dispatch is already fully paid',
      });
    }

    const [paidAgg] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.dispatchId, input.dispatchId),
        ),
      );

    const alreadyPaid = Number(paidAgg?.total ?? 0);
    const dispatchAmount = Number(dispatch.amount);
    const remaining = Math.max(0, dispatchAmount - alreadyPaid);

    if (input.amount > remaining) {
      throw new BadRequestException({
        code: 'PAYMENT_EXCEEDS_REMAINING',
        message: `Payment amount exceeds dispatch remaining balance (Rs. ${remaining.toFixed(2)})`,
      });
    }

    const receiptNumber = await this.getNextReceiptNumber(tenantId);

    const created = await this.db.transaction(async (tx) => {
      const [payment] = await tx
        .insert(payments)
        .values({
          tenantId,
          receiptNumber,
          customerId: dispatch.customerId,
          orderId: dispatch.orderId,
          dispatchId: input.dispatchId,
          amount: String(input.amount),
          paymentMethod: input.paymentMethod ?? 'cash',
          paymentDate: input.paymentDate,
          referenceNumber: input.referenceNumber,
          notes: input.notes,
        })
        .returning();

      const [newPaidAgg] = await tx
        .select({
          total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.tenantId, tenantId),
            eq(payments.dispatchId, input.dispatchId),
          ),
        );

      const totalPaid = Number(newPaidAgg?.total ?? 0);
      if (totalPaid >= dispatchAmount) {
        await tx
          .update(dispatches)
          .set({ paymentStatus: 'paid' })
          .where(eq(dispatches.id, input.dispatchId));
      }

      const [orderAgg] = await tx
        .select({
          total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.tenantId, tenantId),
            eq(payments.orderId, dispatch.orderId),
          ),
        );

      await tx
        .update(orders)
        .set({
          receivedAmount: Number(orderAgg?.total ?? 0).toFixed(2),
        })
        .where(eq(orders.id, dispatch.orderId));

      return payment;
    });

    const detail = await this.findById(tenantId, created.id);
    return detail!;
  }

  async delete(tenantId: string, id: string): Promise<boolean> {
    const existing = await this.findById(tenantId, id);
    if (!existing) return false;

    await this.db.transaction(async (tx) => {
      await tx
        .delete(payments)
        .where(and(eq(payments.tenantId, tenantId), eq(payments.id, id)));

      if (existing.dispatchId) {
        const [dispatch] = await tx
          .select({ amount: dispatches.amount })
          .from(dispatches)
          .where(eq(dispatches.id, existing.dispatchId))
          .limit(1);

        if (dispatch) {
          const [paidAgg] = await tx
            .select({
              total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
            })
            .from(payments)
            .where(
              and(
                eq(payments.tenantId, tenantId),
                eq(payments.dispatchId, existing.dispatchId),
              ),
            );

          const totalPaid = Number(paidAgg?.total ?? 0);
          await tx
            .update(dispatches)
            .set({
              paymentStatus:
                totalPaid >= Number(dispatch.amount) ? 'paid' : 'unpaid',
            })
            .where(eq(dispatches.id, existing.dispatchId));
        }
      }

      const [orderAgg] = await tx
        .select({
          total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
        })
        .from(payments)
        .where(
          and(
            eq(payments.tenantId, tenantId),
            eq(payments.orderId, existing.orderId),
          ),
        );

      await tx
        .update(orders)
        .set({
          receivedAmount: Number(orderAgg?.total ?? 0).toFixed(2),
        })
        .where(eq(orders.id, existing.orderId));
    });

    return true;
  }
}

export const paymentRepositoryProvider = {
  provide: PAYMENT_REPOSITORY,
  useClass: DrizzlePaymentRepository,
};
