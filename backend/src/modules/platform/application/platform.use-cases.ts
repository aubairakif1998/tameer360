import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import type {
  Tenant,
  TenantBranding,
  TenantRepository,
} from '../domain/tenant.entity';
import { TENANT_REPOSITORY } from '../domain/tenant.entity';
import { toTenant, toTenantBranding } from '../domain/tenant.mapper';
import type { ListTenantsUseCasePort } from './list-tenants.port';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { tenants } from '../../../shared/database/schema/tenants';
import { eq } from 'drizzle-orm';

@Injectable()
export class GetTenantBrandingUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepo: TenantRepository,
  ) {}

  async execute(slug: string): Promise<TenantBranding> {
    const tenant = await this.tenantRepo.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant "${slug}" not found`,
      });
    }
    return toTenantBranding(tenant);
  }
}

@Injectable()
export class GetTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepo: TenantRepository,
  ) {}

  async execute(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant "${slug}" not found`,
      });
    }
    return tenant;
  }
}

@Injectable()
export class ListTenantsUseCase implements ListTenantsUseCasePort {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async execute(): Promise<Tenant[]> {
    const records = await this.db.select().from(tenants);
    return records.map((record) => toTenant(record));
  }
}

@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepo: TenantRepository,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  async execute(dto: CreateTenantDto): Promise<Tenant> {
    const existing = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, dto.slug))
      .limit(1);

    if (existing.length > 0) {
      throw new ConflictException({
        code: 'TENANT_SLUG_EXISTS',
        message: `Tenant slug "${dto.slug}" already exists`,
      });
    }

    return this.tenantRepo.create(dto);
  }
}

@Injectable()
export class CheckSlugAvailabilityUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepo: TenantRepository,
  ) {}

  async execute(slug: string): Promise<{ slug: string; available: boolean }> {
    const normalized = slug.trim().toLowerCase();
    const exists = await this.tenantRepo.slugExists(normalized);
    return { slug: normalized, available: !exists };
  }
}

@Injectable()
export class UpdateTenantStatusUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY)
    private readonly tenantRepo: TenantRepository,
  ) {}

  async execute(slug: string, isActive: boolean): Promise<Tenant> {
    const tenant = await this.tenantRepo.findBySlug(slug);
    if (!tenant) {
      throw new NotFoundException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant "${slug}" not found`,
      });
    }

    return this.tenantRepo.updateStatus(slug, isActive);
  }
}

@Injectable()
export class HealthCheckUseCase {
  execute() {
    return {
      status: 'ok' as const,
      service: 'tameer360-api',
      timestamp: new Date().toISOString(),
    };
  }
}
