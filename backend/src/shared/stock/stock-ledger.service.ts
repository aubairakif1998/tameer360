import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, inArray, ne, sql } from 'drizzle-orm';
import type { DrizzleDB } from '../database/database.types';
import { DRIZZLE } from '../database/database.constants';
import { customers } from '../database/schema/customers';
import { dispatches } from '../database/schema/dispatches';
import { materialTypes } from '../database/schema/material-types';
import { orders } from '../database/schema/orders';
import { stockLedger } from '../database/schema/stock-ledger';
import {
  BRICK_INVENTORY_UNIT,
  BRICK_ONLY_MESSAGE,
  isBrickInventoryMaterial,
} from './brick-inventory.constants';

export type StockTransactionType =
  | 'opening'
  | 'production'
  | 'dispatch'
  | 'adjustment';

export interface RecordStockEntryInput {
  materialTypeId: string;
  transactionType: StockTransactionType;
  quantity: number;
  transactionDate: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
}

export interface StockSummaryItem {
  materialTypeId: string;
  materialName: string;
  materialCode: string;
  unit: string;
  currentStock: string;
}

export interface StockLedgerItem {
  id: string;
  materialTypeId: string;
  materialName: string;
  materialCode: string;
  transactionType: StockTransactionType;
  quantity: string;
  referenceType: string | null;
  referenceId: string | null;
  notes: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface StockReservationItem {
  dispatchId: string;
  dispatchNumber: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  quantity: string;
  status: 'scheduled' | 'loaded' | 'in_transit';
  dispatchDate: string;
}

export interface StockAvailabilityItem {
  materialTypeId: string;
  materialName: string;
  materialCode: string;
  unit: string;
  physicalStock: string;
  committedQty: string;
  availableQty: string;
  reservations: StockReservationItem[];
}

@Injectable()
export class StockLedgerService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async recordEntry(
    tenantId: string,
    input: RecordStockEntryInput,
  ): Promise<StockLedgerItem> {
    if (input.quantity === 0) {
      throw new BadRequestException({
        code: 'INVALID_QUANTITY',
        message: 'Quantity cannot be zero',
      });
    }

    const [material] = await this.db
      .select({
        id: materialTypes.id,
        name: materialTypes.name,
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
        message: 'Material type not found for this organization',
      });
    }

    if (
      input.transactionType === 'production' ||
      input.transactionType === 'dispatch' ||
      input.transactionType === 'opening' ||
      input.transactionType === 'adjustment'
    ) {
      if (!isBrickInventoryMaterial(material)) {
        throw new BadRequestException({
          code: 'BRICK_INVENTORY_ONLY',
          message: BRICK_ONLY_MESSAGE,
        });
      }
    }

    if (
      input.transactionType === 'opening' ||
      (input.transactionType === 'adjustment' &&
        input.referenceType !== 'dispatch_reversal')
    ) {
      throw new BadRequestException({
        code: 'MANUAL_STOCK_DISABLED',
        message:
          'Manual stock entries are disabled. Record production to add stock to the yard.',
      });
    }

    const signedQty =
      input.transactionType === 'dispatch'
        ? -Math.abs(input.quantity)
        : Math.abs(input.quantity);

    if (signedQty < 0) {
      const summary = await this.getSummaryForMaterial(
        tenantId,
        input.materialTypeId,
      );
      const available = Number(summary.currentStock);
      if (available + signedQty < 0) {
        throw new BadRequestException({
          code: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for ${summary.materialName}. Available: ${available.toFixed(0)}`,
        });
      }
    }

    const [created] = await this.db
      .insert(stockLedger)
      .values({
        tenantId,
        materialTypeId: input.materialTypeId,
        transactionType: input.transactionType,
        quantity: String(signedQty),
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        notes: input.notes,
        transactionDate: input.transactionDate,
      })
      .returning();

    const summary = await this.getSummaryForMaterial(
      tenantId,
      input.materialTypeId,
    );

    return this.toLedgerItem(
      created,
      summary.materialName,
      summary.materialCode,
    );
  }

  async recordDispatchStock(
    tenantId: string,
    dispatch: {
      id: string;
      materialTypeId: string;
      quantity: string;
      dispatchDate: string;
      dispatchNumber: string;
      status: string;
    },
  ): Promise<void> {
    if (dispatch.status !== 'delivered') return;

    const existing = await this.db
      .select({ id: stockLedger.id })
      .from(stockLedger)
      .where(
        and(
          eq(stockLedger.tenantId, tenantId),
          eq(stockLedger.referenceType, 'dispatch'),
          eq(stockLedger.referenceId, dispatch.id),
        ),
      )
      .limit(1);

    if (existing.length > 0) return;

    await this.recordEntry(tenantId, {
      materialTypeId: dispatch.materialTypeId,
      transactionType: 'dispatch',
      quantity: Number(dispatch.quantity),
      transactionDate: dispatch.dispatchDate,
      referenceType: 'dispatch',
      referenceId: dispatch.id,
      notes: `Dispatch ${dispatch.dispatchNumber}`,
    });
  }

  async reverseDispatchStock(
    tenantId: string,
    dispatchId: string,
  ): Promise<void> {
    const [entry] = await this.db
      .select()
      .from(stockLedger)
      .where(
        and(
          eq(stockLedger.tenantId, tenantId),
          eq(stockLedger.referenceType, 'dispatch'),
          eq(stockLedger.referenceId, dispatchId),
        ),
      )
      .limit(1);

    if (!entry) return;

    await this.recordEntry(tenantId, {
      materialTypeId: entry.materialTypeId,
      transactionType: 'adjustment',
      quantity: Math.abs(Number(entry.quantity)),
      transactionDate: entry.transactionDate,
      referenceType: 'dispatch_reversal',
      referenceId: dispatchId,
      notes: 'Dispatch cancelled — stock restored',
    });
  }

  async getSummary(tenantId: string): Promise<StockSummaryItem[]> {
    const availability = await this.getAvailability(tenantId);
    return availability.map((item) => ({
      materialTypeId: item.materialTypeId,
      materialName: item.materialName,
      materialCode: item.materialCode,
      unit: item.unit,
      currentStock: item.physicalStock,
    }));
  }

  async getAvailability(tenantId: string): Promise<StockAvailabilityItem[]> {
    const rows = await this.db
      .select({
        materialTypeId: materialTypes.id,
        materialName: materialTypes.name,
        materialCode: materialTypes.code,
        unit: materialTypes.unit,
        physicalStock: sql<string>`COALESCE(SUM(${stockLedger.quantity}), 0)`,
      })
      .from(materialTypes)
      .leftJoin(
        stockLedger,
        and(
          eq(stockLedger.materialTypeId, materialTypes.id),
          eq(stockLedger.tenantId, tenantId),
        ),
      )
      .where(
        and(
          eq(materialTypes.tenantId, tenantId),
          eq(materialTypes.isActive, true),
          eq(materialTypes.category, 'brick'),
          eq(materialTypes.unit, BRICK_INVENTORY_UNIT),
        ),
      )
      .groupBy(
        materialTypes.id,
        materialTypes.name,
        materialTypes.code,
        materialTypes.unit,
      )
      .orderBy(materialTypes.name);

    const committedByMaterial = await this.getReservedByDispatches(tenantId);
    const reservationsByMaterial =
      await this.getReservationDetailsByMaterial(tenantId);

    return rows.map((r) => {
      const physical = Number(r.physicalStock);
      const committed = committedByMaterial.get(r.materialTypeId) ?? 0;
      const available = Math.max(0, physical - committed);
      return {
        materialTypeId: r.materialTypeId,
        materialName: r.materialName,
        materialCode: r.materialCode,
        unit: r.unit,
        physicalStock: physical.toFixed(0),
        committedQty: committed.toFixed(0),
        availableQty: available.toFixed(0),
        reservations: reservationsByMaterial.get(r.materialTypeId) ?? [],
      };
    });
  }

  private async getReservationDetailsByMaterial(
    tenantId: string,
  ): Promise<Map<string, StockReservationItem[]>> {
    const rows = await this.db
      .select({
        materialTypeId: dispatches.materialTypeId,
        dispatchId: dispatches.id,
        dispatchNumber: dispatches.dispatchNumber,
        orderId: dispatches.orderId,
        orderNumber: orders.orderNumber,
        customerName: customers.name,
        quantity: dispatches.quantity,
        status: dispatches.status,
        dispatchDate: dispatches.dispatchDate,
      })
      .from(dispatches)
      .innerJoin(orders, eq(dispatches.orderId, orders.id))
      .innerJoin(customers, eq(dispatches.customerId, customers.id))
      .where(
        and(
          eq(dispatches.tenantId, tenantId),
          inArray(dispatches.status, ['scheduled', 'loaded', 'in_transit']),
        ),
      )
      .orderBy(asc(dispatches.scheduledStartAt), asc(dispatches.dispatchNumber));

    const map = new Map<string, StockReservationItem[]>();
    for (const row of rows) {
      const status = row.status as StockReservationItem['status'];
      if (
        status !== 'scheduled' &&
        status !== 'loaded' &&
        status !== 'in_transit'
      ) {
        continue;
      }

      const item: StockReservationItem = {
        dispatchId: row.dispatchId,
        dispatchNumber: row.dispatchNumber,
        orderId: row.orderId,
        orderNumber: row.orderNumber,
        customerName: row.customerName,
        quantity: row.quantity,
        status,
        dispatchDate: row.dispatchDate,
      };

      const list = map.get(row.materialTypeId) ?? [];
      list.push(item);
      map.set(row.materialTypeId, list);
    }

    return map;
  }

  async getAvailableForDispatch(
    tenantId: string,
    materialTypeId: string,
    excludeDispatchId?: string,
  ): Promise<number> {
    const [physicalRow] = await this.db
      .select({
        physicalStock: sql<string>`COALESCE(SUM(${stockLedger.quantity}), 0)`,
      })
      .from(stockLedger)
      .where(
        and(
          eq(stockLedger.tenantId, tenantId),
          eq(stockLedger.materialTypeId, materialTypeId),
        ),
      );

    const physical = Number(physicalRow?.physicalStock ?? 0);
    const reserved = await this.getReservedForMaterial(
      tenantId,
      materialTypeId,
      excludeDispatchId,
    );
    return Math.max(0, physical - reserved);
  }

  async assertDispatchStockAvailable(
    tenantId: string,
    materialTypeId: string,
    quantity: number,
    excludeDispatchId?: string,
  ): Promise<void> {
    const available = await this.getAvailableForDispatch(
      tenantId,
      materialTypeId,
      excludeDispatchId,
    );
    if (quantity > available) {
      const [material] = await this.db
        .select({ name: materialTypes.name })
        .from(materialTypes)
        .where(
          and(
            eq(materialTypes.tenantId, tenantId),
            eq(materialTypes.id, materialTypeId),
          ),
        )
        .limit(1);

      throw new BadRequestException({
        code: 'INSUFFICIENT_STOCK',
        message: `Insufficient yard stock for ${material?.name ?? 'material'}. Available: ${available.toFixed(0)} pieces, requested: ${quantity.toFixed(0)}`,
      });
    }
  }

  async getAvailableForOrder(
    tenantId: string,
    materialTypeId: string,
  ): Promise<number> {
    const items = await this.getAvailability(tenantId);
    const item = items.find((i) => i.materialTypeId === materialTypeId);
    return Number(item?.availableQty ?? 0);
  }

  async assertOrderStockAvailable(
    tenantId: string,
    materialTypeId: string,
    orderedQty: number,
  ): Promise<void> {
    const available = await this.getAvailableForOrder(tenantId, materialTypeId);
    if (orderedQty > available) {
      const [material] = await this.db
        .select({ name: materialTypes.name })
        .from(materialTypes)
        .where(
          and(
            eq(materialTypes.tenantId, tenantId),
            eq(materialTypes.id, materialTypeId),
          ),
        )
        .limit(1);

      throw new BadRequestException({
        code: 'INSUFFICIENT_STOCK',
        message: `Insufficient stock for ${material?.name ?? 'material'}. Available: ${available.toFixed(0)} pieces, requested: ${orderedQty.toFixed(0)}`,
      });
    }
  }

  private async getReservedByDispatches(
    tenantId: string,
    excludeDispatchId?: string,
  ): Promise<Map<string, number>> {
    const conditions = [
      eq(dispatches.tenantId, tenantId),
      inArray(dispatches.status, ['scheduled', 'loaded', 'in_transit']),
    ];
    if (excludeDispatchId) {
      conditions.push(ne(dispatches.id, excludeDispatchId));
    }

    const rows = await this.db
      .select({
        materialTypeId: dispatches.materialTypeId,
        reserved: sql<string>`COALESCE(SUM(${dispatches.quantity}::numeric), 0)`,
      })
      .from(dispatches)
      .where(and(...conditions))
      .groupBy(dispatches.materialTypeId);

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.materialTypeId, Math.max(0, Number(row.reserved)));
    }
    return map;
  }

  private async getReservedForMaterial(
    tenantId: string,
    materialTypeId: string,
    excludeDispatchId?: string,
  ): Promise<number> {
    const conditions = [
      eq(dispatches.tenantId, tenantId),
      eq(dispatches.materialTypeId, materialTypeId),
      inArray(dispatches.status, ['scheduled', 'loaded', 'in_transit']),
    ];
    if (excludeDispatchId) {
      conditions.push(ne(dispatches.id, excludeDispatchId));
    }

    const [row] = await this.db
      .select({
        reserved: sql<string>`COALESCE(SUM(${dispatches.quantity}::numeric), 0)`,
      })
      .from(dispatches)
      .where(and(...conditions));

    return Math.max(0, Number(row?.reserved ?? 0));
  }

  async listTransactions(
    tenantId: string,
    options: { materialTypeId?: string; limit?: number } = {},
  ): Promise<StockLedgerItem[]> {
    const conditions = [eq(stockLedger.tenantId, tenantId)];
    if (options.materialTypeId) {
      conditions.push(eq(stockLedger.materialTypeId, options.materialTypeId));
    }

    const rows = await this.db
      .select({
        ledger: stockLedger,
        materialName: materialTypes.name,
        materialCode: materialTypes.code,
      })
      .from(stockLedger)
      .innerJoin(
        materialTypes,
        eq(stockLedger.materialTypeId, materialTypes.id),
      )
      .where(and(...conditions))
      .orderBy(desc(stockLedger.transactionDate), desc(stockLedger.createdAt))
      .limit(options.limit ?? 50);

    return rows.map((r) => ({
      id: r.ledger.id,
      materialTypeId: r.ledger.materialTypeId,
      materialName: r.materialName,
      materialCode: r.materialCode,
      transactionType: r.ledger.transactionType,
      quantity: r.ledger.quantity,
      referenceType: r.ledger.referenceType,
      referenceId: r.ledger.referenceId,
      notes: r.ledger.notes,
      transactionDate: r.ledger.transactionDate,
      createdAt: r.ledger.createdAt.toISOString(),
    }));
  }

  async getTotalStock(tenantId: string): Promise<string> {
    const [row] = await this.db
      .select({
        total: sql<string>`COALESCE(SUM(${stockLedger.quantity}), 0)`,
      })
      .from(stockLedger)
      .where(eq(stockLedger.tenantId, tenantId));

    return Number(row?.total ?? 0).toFixed(0);
  }

  private async getSummaryForMaterial(
    tenantId: string,
    materialTypeId: string,
  ) {
    const [row] = await this.db
      .select({
        materialName: materialTypes.name,
        materialCode: materialTypes.code,
        currentStock: sql<string>`COALESCE(SUM(${stockLedger.quantity}), 0)`,
      })
      .from(materialTypes)
      .leftJoin(
        stockLedger,
        and(
          eq(stockLedger.materialTypeId, materialTypes.id),
          eq(stockLedger.tenantId, tenantId),
        ),
      )
      .where(
        and(
          eq(materialTypes.tenantId, tenantId),
          eq(materialTypes.id, materialTypeId),
        ),
      )
      .groupBy(materialTypes.name, materialTypes.code);

    return {
      materialName: row?.materialName ?? 'Material',
      materialCode: row?.materialCode ?? '',
      currentStock: row?.currentStock ?? '0',
    };
  }

  private async toLedgerItem(
    record: typeof stockLedger.$inferSelect,
    materialName?: string,
    materialCode?: string,
  ): Promise<StockLedgerItem> {
    let name = materialName;
    let code = materialCode;
    if (!name || !code) {
      const [mat] = await this.db
        .select({ name: materialTypes.name, code: materialTypes.code })
        .from(materialTypes)
        .where(eq(materialTypes.id, record.materialTypeId))
        .limit(1);
      name = mat?.name ?? 'Unknown';
      code = mat?.code ?? '';
    }

    return {
      id: record.id,
      materialTypeId: record.materialTypeId,
      materialName: name,
      materialCode: code,
      transactionType: record.transactionType,
      quantity: record.quantity,
      referenceType: record.referenceType,
      referenceId: record.referenceId,
      notes: record.notes,
      transactionDate: record.transactionDate,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
