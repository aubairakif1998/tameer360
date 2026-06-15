import { Inject, Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import type { DrizzleDB } from '../database/database.types';
import { DRIZZLE } from '../database/database.constants';
import { dispatches } from '../database/schema/dispatches';
import { orders } from '../database/schema/orders';

@Injectable()
export class OrderFulfillmentService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async syncOrderFromDispatches(tenantId: string, orderId: string) {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.tenantId, tenantId), eq(orders.id, orderId)))
      .limit(1);

    if (!order) return;

    const [agg] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${dispatches.quantity}), 0)`,
      })
      .from(dispatches)
      .where(
        and(
          eq(dispatches.tenantId, tenantId),
          eq(dispatches.orderId, orderId),
          eq(dispatches.status, 'delivered'),
        ),
      );

    const deliveredQty = Number(agg?.total ?? 0).toFixed(3);
    const ordered = Number(order.orderedQty);
    const delivered = Number(deliveredQty);

    let status = order.status;
    if (order.status !== 'cancelled' && order.status !== 'draft') {
      if (delivered <= 0) status = 'confirmed';
      else if (delivered >= ordered) status = 'fulfilled';
      else status = 'partial';
    }

    await this.db
      .update(orders)
      .set({ deliveredQty, status })
      .where(eq(orders.id, orderId));
  }
}
