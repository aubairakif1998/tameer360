import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  ne,
  or,
  sql,
} from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { formatDispatchNumber } from '../../../shared/common/dispatch-number';
import { parsePagination } from '../../../shared/common/pagination';
import { OrderFulfillmentService } from '../../../shared/fulfillment/order-fulfillment.service';
import { StockLedgerService } from '../../../shared/stock/stock-ledger.service';
import {
  BRICK_ONLY_MESSAGE,
  isBrickInventoryMaterial,
} from '../../../shared/stock/brick-inventory.constants';
import { calcRemaining } from '../../orders/domain/order.mapper';
import { customers } from '../../../shared/database/schema/customers';
import { dispatches } from '../../../shared/database/schema/dispatches';
import { payments } from '../../../shared/database/schema/payments';
import { materialTypes } from '../../../shared/database/schema/material-types';
import { orders } from '../../../shared/database/schema/orders';
import { vehicles } from '../../../shared/database/schema/vehicles';
import type {
  CreateDispatchInput,
  DispatchDetail,
  DispatchListItem,
  DispatchRepository,
  DispatchStatus,
  ListDispatchesQuery,
  UpdateDispatchInput,
} from '../domain/dispatch.entity';
import { DISPATCH_REPOSITORY } from '../domain/dispatch.entity';
import { canTransitionDispatchStatus } from '../domain/dispatch-lifecycle';
import { resolveDispatchSchedule } from '../domain/dispatch-schedule';
import { toDispatchListItem } from '../domain/dispatch.mapper';

@Injectable()
export class DrizzleDispatchRepository implements DispatchRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly fulfillment: OrderFulfillmentService,
    private readonly stock: StockLedgerService,
  ) {}

  async getNextDispatchNumber(tenantId: string): Promise<string> {
    const [result] = await this.db
      .select({ count: count() })
      .from(dispatches)
      .where(eq(dispatches.tenantId, tenantId));
    return formatDispatchNumber(Number(result?.count ?? 0) + 1);
  }

  private buildWhere(tenantId: string, query: ListDispatchesQuery) {
    const conditions = [eq(dispatches.tenantId, tenantId)];

    if (query.customerId) {
      conditions.push(eq(dispatches.customerId, query.customerId));
    }
    if (query.orderId) {
      conditions.push(eq(dispatches.orderId, query.orderId));
    }
    if (query.status) {
      conditions.push(eq(dispatches.status, query.status));
    } else {
      conditions.push(ne(dispatches.status, 'cancelled'));
    }
    if (query.paymentStatus) {
      conditions.push(eq(dispatches.paymentStatus, query.paymentStatus));
    }
    if (query.payableOnly) {
      conditions.push(eq(dispatches.status, 'delivered'));
      conditions.push(eq(dispatches.paymentStatus, 'unpaid'));
    }
    if (query.dateFrom) {
      conditions.push(gte(dispatches.dispatchDate, query.dateFrom));
    }
    if (query.dateTo) {
      conditions.push(lte(dispatches.dispatchDate, query.dateTo));
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(
          ilike(dispatches.dispatchNumber, term),
          ilike(customers.name, term),
          ilike(vehicles.registrationNumber, term),
          ilike(dispatches.deliveryLocation, term),
        )!,
      );
    }

    return and(...conditions);
  }

  async findMany(
    tenantId: string,
    query: ListDispatchesQuery,
  ): Promise<{ items: DispatchListItem[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const where = this.buildWhere(tenantId, query);

    const rows = await this.db
      .select({
        dispatch: dispatches,
        customerName: customers.name,
        materialName: materialTypes.name,
        vehicleNumber: vehicles.registrationNumber,
        orderNumber: orders.orderNumber,
        paidAmount: sql<string>`COALESCE((
          SELECT SUM(${payments.amount})
          FROM ${payments}
          WHERE ${payments.dispatchId} = ${dispatches.id}
        ), 0)`,
      })
      .from(dispatches)
      .innerJoin(customers, eq(dispatches.customerId, customers.id))
      .innerJoin(materialTypes, eq(dispatches.materialTypeId, materialTypes.id))
      .innerJoin(vehicles, eq(dispatches.vehicleId, vehicles.id))
      .innerJoin(orders, eq(dispatches.orderId, orders.id))
      .where(where)
      .orderBy(desc(dispatches.dispatchDate), desc(dispatches.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await this.db
      .select({ count: count() })
      .from(dispatches)
      .innerJoin(customers, eq(dispatches.customerId, customers.id))
      .innerJoin(vehicles, eq(dispatches.vehicleId, vehicles.id))
      .where(where);

    return {
      items: rows.map((r) =>
        toDispatchListItem(
          r.dispatch,
          r.customerName,
          r.materialName,
          r.vehicleNumber,
          r.orderNumber,
          r.paidAmount,
        ),
      ),
      total: Number(totalResult?.count ?? 0),
    };
  }

  async findById(tenantId: string, id: string): Promise<DispatchDetail | null> {
    const [row] = await this.db
      .select({
        dispatch: dispatches,
        customerName: customers.name,
        customerPhone: customers.phone,
        materialName: materialTypes.name,
        materialCode: materialTypes.code,
        vehicleNumber: vehicles.registrationNumber,
        orderNumber: orders.orderNumber,
        paidAmount: sql<string>`COALESCE((
          SELECT SUM(${payments.amount})
          FROM ${payments}
          WHERE ${payments.dispatchId} = ${dispatches.id}
        ), 0)`,
      })
      .from(dispatches)
      .innerJoin(customers, eq(dispatches.customerId, customers.id))
      .innerJoin(materialTypes, eq(dispatches.materialTypeId, materialTypes.id))
      .innerJoin(vehicles, eq(dispatches.vehicleId, vehicles.id))
      .innerJoin(orders, eq(dispatches.orderId, orders.id))
      .where(and(eq(dispatches.tenantId, tenantId), eq(dispatches.id, id)))
      .limit(1);

    if (!row) return null;

    return {
      ...toDispatchListItem(
        row.dispatch,
        row.customerName,
        row.materialName,
        row.vehicleNumber,
        row.orderNumber,
        row.paidAmount,
      ),
      customerPhone: row.customerPhone,
      materialCode: row.materialCode,
    };
  }

  private async validateOrderForDispatch(
    tenantId: string,
    orderId: string,
    quantity: number,
    excludeDispatchId?: string,
  ) {
    const [order] = await this.db
      .select({
        id: orders.id,
        customerId: orders.customerId,
        materialTypeId: orders.materialTypeId,
        orderedQty: orders.orderedQty,
        deliveredQty: orders.deliveredQty,
        rate: orders.rate,
        deliveryAddress: orders.deliveryAddress,
        expectedDeliveryDate: orders.expectedDeliveryDate,
        status: orders.status,
      })
      .from(orders)
      .where(and(eq(orders.tenantId, tenantId), eq(orders.id, orderId)))
      .limit(1);

    if (!order) {
      throw new BadRequestException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      });
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException({
        code: 'ORDER_CANCELLED',
        message: 'Cannot dispatch against a cancelled order',
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
          eq(materialTypes.id, order.materialTypeId),
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

    let deliveredQty = Number(order.deliveredQty);
    if (excludeDispatchId) {
      const [activeDispatch] = await this.db
        .select({ quantity: dispatches.quantity, status: dispatches.status })
        .from(dispatches)
        .where(
          and(
            eq(dispatches.tenantId, tenantId),
            eq(dispatches.id, excludeDispatchId),
          ),
        )
        .limit(1);

      if (
        activeDispatch?.status === 'delivered' &&
        Number(activeDispatch.quantity) > 0
      ) {
        deliveredQty = Math.max(
          0,
          deliveredQty - Number(activeDispatch.quantity),
        );
      }
    }

    const remaining = Math.max(
      0,
      Number(calcRemaining(order.orderedQty, String(deliveredQty))),
    );
    if (quantity > remaining) {
      throw new BadRequestException({
        code: 'DISPATCH_EXCEEDS_ORDER',
        message: `Dispatch quantity exceeds order remaining (${remaining.toFixed(0)} pieces)`,
      });
    }

    return order;
  }

  async create(
    tenantId: string,
    input: CreateDispatchInput,
  ): Promise<DispatchDetail> {
    const order = await this.validateOrderForDispatch(
      tenantId,
      input.orderId,
      input.quantity,
    );

    await this.stock.assertDispatchStockAvailable(
      tenantId,
      order.materialTypeId,
      input.quantity,
    );

    const [vehicle] = await this.db
      .select()
      .from(vehicles)
      .where(
        and(eq(vehicles.tenantId, tenantId), eq(vehicles.id, input.vehicleId)),
      )
      .limit(1);

    if (!vehicle) {
      throw new BadRequestException({
        code: 'VEHICLE_NOT_FOUND',
        message: 'Vehicle not found',
      });
    }

    const dispatchNumber = await this.getNextDispatchNumber(tenantId);
    const amount = (input.quantity * Number(order.rate)).toFixed(2);
    const schedule = resolveDispatchSchedule({
      scheduledStartAt: input.scheduledStartAt,
      expectedDeliveryAt: input.expectedDeliveryAt,
      dispatchDate: input.dispatchDate,
      orderExpectedDeliveryDate: order.expectedDeliveryDate,
    });

    const dropoffLocation =
      input.dropoffLocation?.trim() || order.deliveryAddress;
    const pickupLocation = input.pickupLocation?.trim() || 'Yard';

    const [created] = await this.db
      .insert(dispatches)
      .values({
        tenantId,
        dispatchNumber,
        orderId: order.id,
        customerId: order.customerId,
        vehicleId: input.vehicleId,
        driverName: input.driverName ?? vehicle.driverName,
        materialTypeId: order.materialTypeId,
        quantity: String(input.quantity),
        rate: order.rate,
        amount,
        deliveryLocation: dropoffLocation,
        pickupLocation,
        dropoffLocation,
        dispatchDate: schedule.dispatchDate,
        scheduledStartAt: schedule.scheduledStartAt,
        expectedDeliveryAt: schedule.expectedDeliveryAt,
        travelTimeMinutes: null,
        journeyKm: input.journeyKm != null ? String(input.journeyKm) : null,
        status: 'scheduled',
        paymentStatus: 'unpaid',
        notes: input.notes,
      })
      .returning();

    const detail = await this.findById(tenantId, created.id);
    return detail!;
  }

  private async applyStatusSideEffects(
    tenantId: string,
    dispatchId: string,
    orderId: string,
    prevStatus: DispatchStatus,
    nextStatus: DispatchStatus,
  ) {
    if (prevStatus === nextStatus) return;

    if (nextStatus === 'delivered' && prevStatus !== 'delivered') {
      const dispatch = await this.findById(tenantId, dispatchId);
      if (!dispatch) return;

      await this.stock.recordDispatchStock(tenantId, {
        id: dispatch.id,
        materialTypeId: dispatch.materialTypeId,
        quantity: dispatch.quantity,
        dispatchDate: dispatch.dispatchDate,
        dispatchNumber: dispatch.dispatchNumber,
        status: 'delivered',
      });
    }

    if (nextStatus === 'cancelled' && prevStatus === 'delivered') {
      await this.stock.reverseDispatchStock(tenantId, dispatchId);
    }

    await this.fulfillment.syncOrderFromDispatches(tenantId, orderId);
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateDispatchInput,
  ): Promise<DispatchDetail | null> {
    const existing = await this.findById(tenantId, id);
    if (!existing) return null;

    if (existing.paymentStatus === 'paid') {
      throw new BadRequestException({
        code: 'DISPATCH_ALREADY_PAID',
        message: 'Paid dispatches cannot be modified',
      });
    }

    const prevStatus = existing.status;
    const updateData: Record<string, unknown> = {};

    if (input.driverName !== undefined) {
      updateData.driverName = input.driverName;
    }
    if (input.notes !== undefined) {
      updateData.notes = input.notes;
    }
    if (input.journeyKm !== undefined) {
      updateData.journeyKm =
        input.journeyKm == null ? null : String(input.journeyKm);
    }
    if (input.pickupLocation !== undefined) {
      updateData.pickupLocation = input.pickupLocation.trim() || null;
    }
    if (input.dropoffLocation !== undefined) {
      const dropoff = input.dropoffLocation.trim();
      updateData.dropoffLocation = dropoff || null;
      if (dropoff) {
        updateData.deliveryLocation = dropoff;
      }
    }

    const scheduleInputProvided =
      input.scheduledStartAt !== undefined ||
      input.expectedDeliveryAt !== undefined ||
      input.dispatchDate !== undefined;

    if (scheduleInputProvided) {
      const schedule = resolveDispatchSchedule({
        scheduledStartAt:
          input.scheduledStartAt ?? existing.scheduledStartAt.toISOString(),
        expectedDeliveryAt:
          input.expectedDeliveryAt ?? existing.expectedDeliveryAt.toISOString(),
        dispatchDate: input.dispatchDate ?? existing.dispatchDate,
        orderExpectedDeliveryDate: null,
      });
      updateData.dispatchDate = schedule.dispatchDate;
      updateData.scheduledStartAt = schedule.scheduledStartAt;
      updateData.expectedDeliveryAt = schedule.expectedDeliveryAt;
    }

    if (input.status !== undefined) {
      if (!canTransitionDispatchStatus(prevStatus, input.status)) {
        throw new BadRequestException({
          code: 'INVALID_DISPATCH_STATUS_TRANSITION',
          message: `Cannot move dispatch from ${prevStatus} to ${input.status}`,
        });
      }

      if (input.status === 'delivered' && prevStatus !== 'delivered') {
        await this.validateOrderForDispatch(
          tenantId,
          existing.orderId,
          Number(existing.quantity),
          id,
        );
      }

      updateData.status = input.status;
    }

    if (Object.keys(updateData).length === 0) {
      return existing;
    }

    await this.db
      .update(dispatches)
      .set(updateData)
      .where(and(eq(dispatches.tenantId, tenantId), eq(dispatches.id, id)));

    if (input.status !== undefined && input.status !== prevStatus) {
      await this.applyStatusSideEffects(
        tenantId,
        id,
        existing.orderId,
        prevStatus,
        input.status,
      );
    }

    return this.findById(tenantId, id);
  }
}

export const dispatchRepositoryProvider = {
  provide: DISPATCH_REPOSITORY,
  useClass: DrizzleDispatchRepository,
};
