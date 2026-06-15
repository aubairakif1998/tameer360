import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import {
  VEHICLE_REPOSITORY,
  type VehicleRepository,
} from '../domain/vehicle.entity';
import type {
  CreateVehicleDto,
  ListVehiclesQueryDto,
  UpdateVehicleDto,
} from './dto/vehicle.dto';

@Injectable()
export class ListVehiclesUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly repo: VehicleRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(query: ListVehiclesQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const { items, total } = await this.repo.findMany(tenantId, query);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { items, meta: { page, limit, total } };
  }
}

@Injectable()
export class GetVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly repo: VehicleRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const item = await this.repo.findById(this.tenantContext.getTenantId(), id);
    if (!item) {
      throw new NotFoundException({
        code: 'VEHICLE_NOT_FOUND',
        message: 'Vehicle not found',
      });
    }
    return item;
  }
}

@Injectable()
export class CreateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly repo: VehicleRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(dto: CreateVehicleDto) {
    return this.repo.create(this.tenantContext.getTenantId(), dto);
  }
}

@Injectable()
export class UpdateVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly repo: VehicleRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string, dto: UpdateVehicleDto) {
    const item = await this.repo.update(
      this.tenantContext.getTenantId(),
      id,
      dto,
    );
    if (!item) {
      throw new NotFoundException({
        code: 'VEHICLE_NOT_FOUND',
        message: 'Vehicle not found',
      });
    }
    return item;
  }
}

@Injectable()
export class DeleteVehicleUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY) private readonly repo: VehicleRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const deleted = await this.repo.softDelete(
      this.tenantContext.getTenantId(),
      id,
    );
    if (!deleted) {
      throw new NotFoundException({
        code: 'VEHICLE_NOT_FOUND',
        message: 'Vehicle not found',
      });
    }
  }
}
