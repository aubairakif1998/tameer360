import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import { ORDER_REPOSITORY, type OrderRepository } from '../domain/order.entity';
import type {
  CreateOrderDto,
  ListOrdersQueryDto,
  UpdateOrderDto,
} from './dto/order.dto';

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(query: ListOrdersQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const { items, total } = await this.repo.findMany(tenantId, query);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { items, meta: { page, limit, total } };
  }
}

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    const order = await this.repo.findById(tenantId, id);
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      });
    }
    return order;
  }
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(dto: CreateOrderDto) {
    const tenantId = this.tenantContext.getTenantId();
    return this.repo.create(tenantId, dto);
  }
}

@Injectable()
export class UpdateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string, dto: UpdateOrderDto) {
    const tenantId = this.tenantContext.getTenantId();
    const order = await this.repo.update(tenantId, id, dto);
    if (!order) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      });
    }
    return order;
  }
}

@Injectable()
export class GetFulfillmentSummaryUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute() {
    const tenantId = this.tenantContext.getTenantId();
    return this.repo.getFulfillmentSummary(tenantId);
  }
}
