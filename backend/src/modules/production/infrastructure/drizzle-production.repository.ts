import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gte, lte } from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { parsePagination } from '../../../shared/common/pagination';
import { StockLedgerService } from '../../../shared/stock/stock-ledger.service';
import {
  BRICK_ONLY_MESSAGE,
  isBrickInventoryMaterial,
} from '../../../shared/stock/brick-inventory.constants';
import { materialTypes } from '../../../shared/database/schema/material-types';
import { productionBatches } from '../../../shared/database/schema/production-batches';
import type {
  CreateProductionBatchInput,
  ListProductionBatchesQuery,
  ProductionBatchDetail,
  ProductionBatchListItem,
  ProductionRepository,
} from '../domain/production.entity';
import { PRODUCTION_REPOSITORY } from '../domain/production.entity';
import { calcNetQty, toProductionListItem } from '../domain/production.mapper';

@Injectable()
export class DrizzleProductionRepository implements ProductionRepository {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly stock: StockLedgerService,
  ) {}

  private async getNextBatchNumber(tenantId: string): Promise<string> {
    const [result] = await this.db
      .select({ count: count() })
      .from(productionBatches)
      .where(eq(productionBatches.tenantId, tenantId));
    const seq = Number(result?.count ?? 0) + 1;
    return `PROD-${String(seq).padStart(4, '0')}`;
  }

  async findMany(
    tenantId: string,
    query: ListProductionBatchesQuery,
  ): Promise<{ items: ProductionBatchListItem[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const conditions = [eq(productionBatches.tenantId, tenantId)];

    if (query.materialTypeId) {
      conditions.push(
        eq(productionBatches.materialTypeId, query.materialTypeId),
      );
    }
    if (query.fromDate) {
      conditions.push(gte(productionBatches.productionDate, query.fromDate));
    }
    if (query.toDate) {
      conditions.push(lte(productionBatches.productionDate, query.toDate));
    }

    const where = and(...conditions);

    const [totalRow, rows] = await Promise.all([
      this.db.select({ count: count() }).from(productionBatches).where(where),
      this.db
        .select({
          batch: productionBatches,
          materialName: materialTypes.name,
          materialCode: materialTypes.code,
        })
        .from(productionBatches)
        .innerJoin(
          materialTypes,
          eq(productionBatches.materialTypeId, materialTypes.id),
        )
        .where(where)
        .orderBy(
          desc(productionBatches.productionDate),
          desc(productionBatches.createdAt),
        )
        .limit(limit)
        .offset(offset),
    ]);

    return {
      items: rows.map((r) =>
        toProductionListItem(r.batch, r.materialName, r.materialCode),
      ),
      total: Number(totalRow[0]?.count ?? 0),
    };
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<ProductionBatchDetail | null> {
    const [row] = await this.db
      .select({
        batch: productionBatches,
        materialName: materialTypes.name,
        materialCode: materialTypes.code,
      })
      .from(productionBatches)
      .innerJoin(
        materialTypes,
        eq(productionBatches.materialTypeId, materialTypes.id),
      )
      .where(
        and(
          eq(productionBatches.tenantId, tenantId),
          eq(productionBatches.id, id),
        ),
      )
      .limit(1);

    if (!row) return null;

    const item = toProductionListItem(
      row.batch,
      row.materialName,
      row.materialCode,
    );
    return { ...item, updatedAt: row.batch.updatedAt.toISOString() };
  }

  async create(
    tenantId: string,
    input: CreateProductionBatchInput,
  ): Promise<ProductionBatchDetail> {
    const damaged = input.damagedQty ?? 0;
    if (damaged > input.producedQty) {
      throw new BadRequestException({
        code: 'INVALID_DAMAGED_QTY',
        message: 'Damaged quantity cannot exceed produced quantity',
      });
    }

    const [material] = await this.db
      .select()
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

    const batchNumber = await this.getNextBatchNumber(tenantId);
    const netQty = calcNetQty(String(input.producedQty), String(damaged));

    const [created] = await this.db
      .insert(productionBatches)
      .values({
        tenantId,
        batchNumber,
        materialTypeId: input.materialTypeId,
        producedQty: String(input.producedQty),
        damagedQty: String(damaged),
        productionDate: input.productionDate,
        notes: input.notes,
      })
      .returning();

    if (Number(netQty) > 0) {
      await this.stock.recordEntry(tenantId, {
        materialTypeId: input.materialTypeId,
        transactionType: 'production',
        quantity: Number(netQty),
        transactionDate: input.productionDate,
        referenceType: 'production_batch',
        referenceId: created.id,
        notes: `Production ${batchNumber}`,
      });
    }

    const detail = await this.findById(tenantId, created.id);
    return detail!;
  }
}

export const productionRepositoryProvider = {
  provide: PRODUCTION_REPOSITORY,
  useClass: DrizzleProductionRepository,
};
