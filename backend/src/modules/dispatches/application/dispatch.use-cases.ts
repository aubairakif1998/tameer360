import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import {
  DISPATCH_REPOSITORY,
  type DispatchRepository,
} from '../domain/dispatch.entity';
import type {
  CreateDispatchDto,
  ListDispatchesQueryDto,
  UpdateDispatchDto,
} from './dto/dispatch.dto';

@Injectable()
export class ListDispatchesUseCase {
  constructor(
    @Inject(DISPATCH_REPOSITORY) private readonly repo: DispatchRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(query: ListDispatchesQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const { items, total } = await this.repo.findMany(tenantId, query);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { items, meta: { page, limit, total } };
  }
}

@Injectable()
export class GetDispatchUseCase {
  constructor(
    @Inject(DISPATCH_REPOSITORY) private readonly repo: DispatchRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const item = await this.repo.findById(this.tenantContext.getTenantId(), id);
    if (!item) {
      throw new NotFoundException({
        code: 'DISPATCH_NOT_FOUND',
        message: 'Dispatch not found',
      });
    }
    return item;
  }
}

@Injectable()
export class CreateDispatchUseCase {
  constructor(
    @Inject(DISPATCH_REPOSITORY) private readonly repo: DispatchRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(dto: CreateDispatchDto) {
    return this.repo.create(this.tenantContext.getTenantId(), dto);
  }
}

@Injectable()
export class UpdateDispatchUseCase {
  constructor(
    @Inject(DISPATCH_REPOSITORY) private readonly repo: DispatchRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string, dto: UpdateDispatchDto) {
    const item = await this.repo.update(
      this.tenantContext.getTenantId(),
      id,
      dto,
    );
    if (!item) {
      throw new NotFoundException({
        code: 'DISPATCH_NOT_FOUND',
        message: 'Dispatch not found',
      });
    }
    return item;
  }
}
