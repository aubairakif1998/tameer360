import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, ilike, or } from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { dispatches } from '../../../shared/database/schema/dispatches';
import {
  materialTypes,
  type MaterialTypeRecord,
} from '../../../shared/database/schema/material-types';
import { orders } from '../../../shared/database/schema/orders';
import { productionBatches } from '../../../shared/database/schema/production-batches';
import { stockLedger } from '../../../shared/database/schema/stock-ledger';
import { parsePagination } from '../../../shared/common/pagination';
import {
  isUnitAllowedForCategory,
  resolveMaterialUnit,
  type MaterialCategory,
} from '../domain/material-category.constants';
import { slugifyMaterialCode } from '../domain/material-code.util';
import type {
  CreateMaterialTypeInput,
  ListMaterialTypesQuery,
  MaterialType,
  MaterialTypeReferences,
  MaterialTypeRepository,
  MaterialUnit,
  UpdateMaterialTypeInput,
} from '../domain/material-type.entity';
import { MATERIAL_TYPE_REPOSITORY } from '../domain/material-type.entity';
import { toMaterialType } from '../domain/material-type.mapper';

@Injectable()
export class DrizzleMaterialTypeRepository implements MaterialTypeRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  private buildWhere(tenantId: string, query: ListMaterialTypesQuery) {
    const conditions = [eq(materialTypes.tenantId, tenantId)];

    if (query.isActive !== undefined) {
      conditions.push(eq(materialTypes.isActive, query.isActive));
    } else {
      conditions.push(eq(materialTypes.isActive, true));
    }

    if (query.category) {
      conditions.push(eq(materialTypes.category, query.category));
    }

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        or(ilike(materialTypes.name, term), ilike(materialTypes.code, term))!,
      );
    }

    return and(...conditions);
  }

  async findMany(
    tenantId: string,
    query: ListMaterialTypesQuery,
  ): Promise<{ items: MaterialType[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const where = this.buildWhere(tenantId, query);

    const [rows, totalResult] = await Promise.all([
      this.db
        .select()
        .from(materialTypes)
        .where(where)
        .orderBy(desc(materialTypes.createdAt))
        .limit(limit)
        .offset(offset),
      this.db.select({ count: count() }).from(materialTypes).where(where),
    ]);

    return {
      items: rows.map(toMaterialType),
      total: Number(totalResult[0]?.count ?? 0),
    };
  }

  async findById(tenantId: string, id: string): Promise<MaterialType | null> {
    const [row] = await this.db
      .select()
      .from(materialTypes)
      .where(
        and(eq(materialTypes.tenantId, tenantId), eq(materialTypes.id, id)),
      )
      .limit(1);
    return row ? toMaterialType(row) : null;
  }

  async findByCode(
    tenantId: string,
    code: string,
  ): Promise<MaterialType | null> {
    const [row] = await this.db
      .select()
      .from(materialTypes)
      .where(
        and(eq(materialTypes.tenantId, tenantId), eq(materialTypes.code, code)),
      )
      .limit(1);
    return row ? toMaterialType(row) : null;
  }

  async generateUniqueCode(tenantId: string, name: string): Promise<string> {
    const base = slugifyMaterialCode(name);
    let code = base;
    let suffix = 2;

    while (await this.findByCode(tenantId, code)) {
      const suffixStr = `-${suffix}`;
      code = `${base.slice(0, 50 - suffixStr.length)}${suffixStr}`;
      suffix += 1;
    }

    return code;
  }

  async countReferences(
    tenantId: string,
    materialTypeId: string,
  ): Promise<MaterialTypeReferences> {
    const [orderRows, dispatchRows, productionRows, stockRows] =
      await Promise.all([
        this.db
          .select({ count: count() })
          .from(orders)
          .where(
            and(
              eq(orders.tenantId, tenantId),
              eq(orders.materialTypeId, materialTypeId),
            ),
          ),
        this.db
          .select({ count: count() })
          .from(dispatches)
          .where(
            and(
              eq(dispatches.tenantId, tenantId),
              eq(dispatches.materialTypeId, materialTypeId),
            ),
          ),
        this.db
          .select({ count: count() })
          .from(productionBatches)
          .where(
            and(
              eq(productionBatches.tenantId, tenantId),
              eq(productionBatches.materialTypeId, materialTypeId),
            ),
          ),
        this.db
          .select({ count: count() })
          .from(stockLedger)
          .where(
            and(
              eq(stockLedger.tenantId, tenantId),
              eq(stockLedger.materialTypeId, materialTypeId),
            ),
          ),
      ]);

    const refs = {
      orders: Number(orderRows[0]?.count ?? 0),
      dispatches: Number(dispatchRows[0]?.count ?? 0),
      productionBatches: Number(productionRows[0]?.count ?? 0),
      stockLedger: Number(stockRows[0]?.count ?? 0),
    };

    return {
      ...refs,
      total:
        refs.orders +
        refs.dispatches +
        refs.productionBatches +
        refs.stockLedger,
    };
  }

  private assertUnitForCategory(
    category: MaterialCategory,
    unit: MaterialUnit,
  ) {
    if (!isUnitAllowedForCategory(category, unit)) {
      throw new BadRequestException({
        code: 'INVALID_MATERIAL_UNIT',
        message: `Unit "${unit}" is not allowed for category "${category}"`,
      });
    }
  }

  async create(
    tenantId: string,
    input: CreateMaterialTypeInput,
  ): Promise<MaterialType> {
    const unit = resolveMaterialUnit(input.category, input.unit);
    this.assertUnitForCategory(input.category, unit);

    const [row] = await this.db
      .insert(materialTypes)
      .values({
        tenantId,
        name: input.name.trim(),
        code: input.code.toUpperCase(),
        category: input.category,
        unit,
        defaultRate:
          input.defaultRate !== undefined
            ? String(input.defaultRate)
            : undefined,
      })
      .returning();
    return toMaterialType(row);
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateMaterialTypeInput,
  ): Promise<MaterialType | null> {
    const current = await this.findById(tenantId, id);
    if (!current) {
      return null;
    }

    const nextCategory = input.category ?? current.category;
    const nextUnit = input.unit
      ? resolveMaterialUnit(nextCategory, input.unit)
      : current.unit;

    if (input.category || input.unit) {
      this.assertUnitForCategory(nextCategory, nextUnit);
    }

    const updateData: Partial<
      Pick<
        MaterialTypeRecord,
        'name' | 'code' | 'category' | 'unit' | 'defaultRate' | 'isActive'
      >
    > = {};

    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.code !== undefined) updateData.code = input.code.toUpperCase();
    if (input.category !== undefined) updateData.category = input.category;
    if (input.unit !== undefined) updateData.unit = nextUnit;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;
    if (input.defaultRate !== undefined) {
      updateData.defaultRate =
        input.defaultRate === null ? null : String(input.defaultRate);
    }

    if (Object.keys(updateData).length === 0) {
      return current;
    }

    const [row] = await this.db
      .update(materialTypes)
      .set(updateData)
      .where(
        and(eq(materialTypes.tenantId, tenantId), eq(materialTypes.id, id)),
      )
      .returning();

    return row ? toMaterialType(row) : null;
  }

  async hardDelete(tenantId: string, id: string): Promise<boolean> {
    const result = await this.db
      .delete(materialTypes)
      .where(
        and(eq(materialTypes.tenantId, tenantId), eq(materialTypes.id, id)),
      )
      .returning({ id: materialTypes.id });
    return result.length > 0;
  }
}

export const materialTypeRepositoryProvider = {
  provide: MATERIAL_TYPE_REPOSITORY,
  useClass: DrizzleMaterialTypeRepository,
};
