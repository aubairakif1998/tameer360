import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  exists,
  ilike,
  inArray,
  ne,
  or,
  sql,
} from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { formatOrderNumber } from '../../../shared/common/order-number';
import { parsePagination } from '../../../shared/common/pagination';
import {
  BRICK_ONLY_MESSAGE,
  isBrickInventoryMaterial,
} from '../../../shared/stock/brick-inventory.constants';
import { StockLedgerService } from '../../../shared/stock/stock-ledger.service';
import { customers } from '../../../shared/database/schema/customers';
import { dispatches } from '../../../shared/database/schema/dispatches';
import { materialTypes } from '../../../shared/database/schema/material-types';
import { orders } from '../../../shared/database/schema/orders';
import type {
  CreateOrderInput,
  FulfillmentSummaryItem,
  ListOrdersQuery,
  OrderDetail,
  OrderListItem,
  OrderRepository,
  UpdateOrderInput,
} from '../domain/order.entity';
import { ORDER_REPOSITORY } from '../domain/order.entity';
import {
  calcFulfillmentPercent,
  calcRemaining,
  toOrderListItem,
} from '../domain/order.mapper';

@Injectable()
export class DrizzleOrderRepository implements OrderRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly stock: StockLedgerService,
  ) {}

  async getNextOrderNumber(tenantId: string): Promise<string> {
    const [result] = await this.db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.tenantId, tenantId));
    const next = Number(result?.count ?? 0) + 1;
    return formatOrderNumber(next);
  }

  private buildWhere(tenantId: string, query: ListOrdersQuery) {
    const conditions = [eq(orders.tenantId, tenantId)];

    if (query.customerId) {
      conditions.push(eq(orders.customerId, query.customerId));
    }

    if (query.status) {
      conditions.push(eq(orders.status, query.status));
    } else {
      conditions.push(ne(orders.status, 'cancelled'));
    }

    if (query.dispatchedOnly) {
      conditions.push(
        exists(
          this.db
            .select({ one: sql`1` })
            .from(dispatches)
            .where(
              and(
                eq(dispatches.orderId, orders.id),
                eq(dispatches.status, 'delivered'),
              ),
            ),
        ),
      );
    }

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(orders.orderNumber, term),
          ilike(customers.name, term),
          ilike(materialTypes.name, term),
        )!,
      );
    }

    return and(...conditions);
  }

  async findMany(
    tenantId: string,
    query: ListOrdersQuery,
  ): Promise<{ items: OrderListItem[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const where = this.buildWhere(tenantId, query);

    const rows = await this.db
      .select({
        order: orders,
        customerName: customers.name,
        materialName: materialTypes.name,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .innerJoin(materialTypes, eq(orders.materialTypeId, materialTypes.id))
      .where(where)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .innerJoin(materialTypes, eq(orders.materialTypeId, materialTypes.id))
      .where(where);

    return {
      items: rows.map((r) =>
        toOrderListItem(r.order, r.customerName, r.materialName),
      ),
      total: Number(totalResult?.count ?? 0),
    };
  }

  async findById(tenantId: string, id: string): Promise<OrderDetail | null> {
    const [row] = await this.db
      .select({
        order: orders,
        customerName: customers.name,
        customerPhone: customers.phone,
        materialName: materialTypes.name,
        materialCode: materialTypes.code,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .innerJoin(materialTypes, eq(orders.materialTypeId, materialTypes.id))
      .where(and(eq(orders.tenantId, tenantId), eq(orders.id, id)))
      .limit(1);

    if (!row) return null;

    const base = toOrderListItem(row.order, row.customerName, row.materialName);

    return {
      ...base,
      customerPhone: row.customerPhone,
      materialCode: row.materialCode,
    };
  }

  async create(
    tenantId: string,
    input: CreateOrderInput,
  ): Promise<OrderDetail> {
    const [customer] = await this.db
      .select({ id: customers.id })
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, tenantId),
          eq(customers.id, input.customerId),
        ),
      )
      .limit(1);

    if (!customer) {
      throw new BadRequestException({
        code: 'CUSTOMER_NOT_FOUND',
        message: 'Customer not found',
      });
    }

    const [material] = await this.db
      .select({
        id: materialTypes.id,
        category: materialTypes.category,
        unit: materialTypes.unit,
        isActive: materialTypes.isActive,
      })
      .from(materialTypes)
      .where(
        and(
          eq(materialTypes.tenantId, tenantId),
          eq(materialTypes.id, input.materialTypeId),
        ),
      )
      .limit(1);

    if (!material) {
      throw new BadRequestException({
        code: 'MATERIAL_NOT_FOUND',
        message: 'Material type not found',
      });
    }

    if (!isBrickInventoryMaterial(material)) {
      throw new BadRequestException({
        code: 'BRICK_INVENTORY_ONLY',
        message: BRICK_ONLY_MESSAGE,
      });
    }

    await this.stock.assertOrderStockAvailable(
      tenantId,
      input.materialTypeId,
      input.orderedQty,
    );

    const orderNumber = await this.getNextOrderNumber(tenantId);
    const totalAmount = (input.orderedQty * input.rate).toFixed(2);

    const [created] = await this.db
      .insert(orders)
      .values({
        tenantId,
        orderNumber,
        customerId: input.customerId,
        deliveryAddress: input.deliveryAddress.trim(),
        materialTypeId: input.materialTypeId,
        orderedQty: String(input.orderedQty),
        deliveredQty: '0',
        rate: String(input.rate),
        totalAmount,
        expectedDeliveryDate: input.expectedDeliveryDate,
        status: input.status ?? 'confirmed',
        notes: input.notes,
      })
      .returning();

    const detail = await this.findById(tenantId, created.id);
    return detail!;
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateOrderInput,
  ): Promise<OrderDetail | null> {
    const updateData: Record<string, unknown> = {};
    if (input.deliveryAddress !== undefined) {
      updateData.deliveryAddress = input.deliveryAddress.trim();
    }
    if (input.expectedDeliveryDate !== undefined) {
      updateData.expectedDeliveryDate = input.expectedDeliveryDate;
    }
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.status !== undefined) updateData.status = input.status;

    if (Object.keys(updateData).length === 0) {
      return this.findById(tenantId, id);
    }

    const [updated] = await this.db
      .update(orders)
      .set(updateData)
      .where(and(eq(orders.tenantId, tenantId), eq(orders.id, id)))
      .returning();

    if (!updated) return null;
    return this.findById(tenantId, id);
  }

  async getFulfillmentSummary(
    tenantId: string,
  ): Promise<FulfillmentSummaryItem[]> {
    const rows = await this.db
      .select({
        order: orders,
        customerName: customers.name,
        materialName: materialTypes.name,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .innerJoin(materialTypes, eq(orders.materialTypeId, materialTypes.id))
      .where(
        and(
          eq(orders.tenantId, tenantId),
          inArray(orders.status, ['confirmed', 'partial']),
        ),
      )
      .orderBy(desc(orders.createdAt))
      .limit(50);

    return rows.map((r) => ({
      orderId: r.order.id,
      orderNumber: r.order.orderNumber,
      customerName: r.customerName,
      materialName: r.materialName,
      orderedQty: r.order.orderedQty,
      deliveredQty: r.order.deliveredQty,
      remainingQty: calcRemaining(r.order.orderedQty, r.order.deliveredQty),
      fulfillmentPercent: calcFulfillmentPercent(
        r.order.orderedQty,
        r.order.deliveredQty,
      ),
      status: r.order.status,
    }));
  }
}

export const orderRepositoryProvider = {
  provide: ORDER_REPOSITORY,
  useClass: DrizzleOrderRepository,
};
