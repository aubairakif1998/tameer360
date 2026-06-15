import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import {
  PRODUCTION_REPOSITORY,
  type ProductionRepository,
} from '../domain/production.entity';
import type {
  CreateProductionBatchDto,
  ListProductionBatchesQueryDto,
} from './dto/production.dto';

@Injectable()
export class ListProductionBatchesUseCase {
  constructor(
    @Inject(PRODUCTION_REPOSITORY) private readonly repo: ProductionRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(query: ListProductionBatchesQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const { items, total } = await this.repo.findMany(tenantId, query);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { items, meta: { page, limit, total } };
  }
}

@Injectable()
export class GetProductionBatchUseCase {
  constructor(
    @Inject(PRODUCTION_REPOSITORY) private readonly repo: ProductionRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const item = await this.repo.findById(this.tenantContext.getTenantId(), id);
    if (!item) {
      throw new NotFoundException({
        code: 'PRODUCTION_BATCH_NOT_FOUND',
        message: 'Production batch not found',
      });
    }
    return item;
  }
}

@Injectable()
export class CreateProductionBatchUseCase {
  constructor(
    @Inject(PRODUCTION_REPOSITORY) private readonly repo: ProductionRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(dto: CreateProductionBatchDto) {
    return this.repo.create(this.tenantContext.getTenantId(), dto);
  }
}
