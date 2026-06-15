import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import type { DrizzleDB } from '../database/database.types';
import { DRIZZLE } from '../database/database.constants';
import { dispatches } from '../database/schema/dispatches';
import { orders } from '../database/schema/orders';
import { payments } from '../database/schema/payments';

@Injectable()
export class PaymentSyncService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async syncOrderReceivedAmount(tenantId: string, orderId: string) {
    const [agg] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(eq(payments.tenantId, tenantId), eq(payments.orderId, orderId)),
      );

    await this.db
      .update(orders)
      .set({ receivedAmount: Number(agg?.total ?? 0).toFixed(2) })
      .where(eq(orders.id, orderId));
  }

  async syncDispatchPaymentStatus(tenantId: string, dispatchId: string) {
    const [dispatch] = await this.db
      .select({
        id: dispatches.id,
        amount: dispatches.amount,
      })
      .from(dispatches)
      .where(
        and(eq(dispatches.tenantId, tenantId), eq(dispatches.id, dispatchId)),
      )
      .limit(1);

    if (!dispatch) return;

    const [agg] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.dispatchId, dispatchId),
        ),
      );

    const paid = Number(agg?.total ?? 0) >= Number(dispatch.amount);

    await this.db
      .update(dispatches)
      .set({ paymentStatus: paid ? 'paid' : 'unpaid' })
      .where(eq(dispatches.id, dispatchId));
  }
}
