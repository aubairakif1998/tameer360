import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import {
  MATERIAL_TYPE_REPOSITORY,
  type MaterialTypeRepository,
} from '../domain/material-type.entity';
import type {
  CreateMaterialTypeDto,
  ListMaterialTypesQueryDto,
  SuggestMaterialCodeQueryDto,
  UpdateMaterialTypeDto,
} from './dto/material-type.dto';

@Injectable()
export class ListMaterialTypesUseCase {
  constructor(
    @Inject(MATERIAL_TYPE_REPOSITORY)
    private readonly repo: MaterialTypeRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(query: ListMaterialTypesQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const { items, total } = await this.repo.findMany(tenantId, query);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    return { items, meta: { page, limit, total } };
  }
}

@Injectable()
export class GetMaterialTypeUseCase {
  constructor(
    @Inject(MATERIAL_TYPE_REPOSITORY)
    private readonly repo: MaterialTypeRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    const item = await this.repo.findById(tenantId, id);
    if (!item) {
      throw new NotFoundException({
        code: 'MATERIAL_TYPE_NOT_FOUND',
        message: 'Material type not found',
      });
    }
    return item;
  }
}

@Injectable()
export class SuggestMaterialCodeUseCase {
  constructor(
    @Inject(MATERIAL_TYPE_REPOSITORY)
    private readonly repo: MaterialTypeRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(query: SuggestMaterialCodeQueryDto) {
    const tenantId = this.tenantContext.getTenantId();
    const code = await this.repo.generateUniqueCode(tenantId, query.name);
    return { code };
  }
}

@Injectable()
export class CreateMaterialTypeUseCase {
  constructor(
    @Inject(MATERIAL_TYPE_REPOSITORY)
    private readonly repo: MaterialTypeRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(dto: CreateMaterialTypeDto) {
    const tenantId = this.tenantContext.getTenantId();
    const code = dto.code
      ? dto.code.toUpperCase()
      : await this.repo.generateUniqueCode(tenantId, dto.name);

    const existing = await this.repo.findByCode(tenantId, code);
    if (existing) {
      throw new ConflictException({
        code: 'MATERIAL_CODE_EXISTS',
        message: `Material code "${code}" already exists`,
      });
    }

    return this.repo.create(tenantId, {
      ...dto,
      code,
    });
  }
}

@Injectable()
export class UpdateMaterialTypeUseCase {
  constructor(
    @Inject(MATERIAL_TYPE_REPOSITORY)
    private readonly repo: MaterialTypeRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string, dto: UpdateMaterialTypeDto) {
    const tenantId = this.tenantContext.getTenantId();
    const current = await this.repo.findById(tenantId, id);
    if (!current) {
      throw new NotFoundException({
        code: 'MATERIAL_TYPE_NOT_FOUND',
        message: 'Material type not found',
      });
    }

    const refs = await this.repo.countReferences(tenantId, id);
    if (refs.total > 0) {
      if (dto.category && dto.category !== current.category) {
        throw new BadRequestException({
          code: 'MATERIAL_TYPE_IN_USE',
          message: 'Category cannot be changed while material is in use',
        });
      }
      if (dto.unit && dto.unit !== current.unit) {
        throw new BadRequestException({
          code: 'MATERIAL_TYPE_IN_USE',
          message: 'Unit cannot be changed while material is in use',
        });
      }
      if (dto.code && dto.code.toUpperCase() !== current.code) {
        throw new BadRequestException({
          code: 'MATERIAL_TYPE_IN_USE',
          message: 'Code cannot be changed while material is in use',
        });
      }
    }

    if (dto.code) {
      const code = dto.code.toUpperCase();
      const existing = await this.repo.findByCode(tenantId, code);
      if (existing && existing.id !== id) {
        throw new ConflictException({
          code: 'MATERIAL_CODE_EXISTS',
          message: `Material code "${code}" already exists`,
        });
      }
      dto = { ...dto, code };
    }

    const item = await this.repo.update(tenantId, id, dto);
    if (!item) {
      throw new NotFoundException({
        code: 'MATERIAL_TYPE_NOT_FOUND',
        message: 'Material type not found',
      });
    }
    return item;
  }
}

@Injectable()
export class DeleteMaterialTypeUseCase {
  constructor(
    @Inject(MATERIAL_TYPE_REPOSITORY)
    private readonly repo: MaterialTypeRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    const current = await this.repo.findById(tenantId, id);
    if (!current) {
      throw new NotFoundException({
        code: 'MATERIAL_TYPE_NOT_FOUND',
        message: 'Material type not found',
      });
    }

    const refs = await this.repo.countReferences(tenantId, id);
    if (refs.total > 0) {
      throw new ConflictException({
        code: 'MATERIAL_TYPE_IN_USE',
        message:
          'Material cannot be deleted because it is linked to orders, production, dispatches, or stock',
        references: refs,
      });
    }

    const deleted = await this.repo.hardDelete(tenantId, id);
    if (!deleted) {
      throw new NotFoundException({
        code: 'MATERIAL_TYPE_NOT_FOUND',
        message: 'Material type not found',
      });
    }
  }
}
