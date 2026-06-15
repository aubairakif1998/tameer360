import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { tenants } from '../../../shared/database/schema/tenants';
import {
  CreateTenantInput,
  Tenant,
  TenantRepository,
  TENANT_REPOSITORY,
} from '../domain/tenant.entity';
import { toTenant } from '../domain/tenant.mapper';

@Injectable()
export class DrizzleTenantRepository implements TenantRepository {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  async findAll(): Promise<Tenant[]> {
    const records = await this.db.select().from(tenants);
    return records.map(toTenant);
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const [record] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    return record ? toTenant(record) : null;
  }

  async create(input: CreateTenantInput): Promise<Tenant> {
    const [record] = await this.db
      .insert(tenants)
      .values({
        slug: input.slug,
        displayName: input.displayName,
        businessType: input.businessType ?? 'brick_kiln',
        logoUrl: input.logoUrl,
        primaryColor: input.primaryColor ?? '#1e40af',
        accentColor: input.accentColor ?? '#f59e0b',
        showPoweredBy: input.showPoweredBy ?? true,
      })
      .returning();

    return toTenant(record);
  }

  async updateStatus(slug: string, isActive: boolean): Promise<Tenant> {
    const [record] = await this.db
      .update(tenants)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(tenants.slug, slug))
      .returning();

    return toTenant(record);
  }

  async slugExists(slug: string): Promise<boolean> {
    const [record] = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    return Boolean(record);
  }
}

export const tenantRepositoryProvider = {
  provide: TENANT_REPOSITORY,
  useClass: DrizzleTenantRepository,
};
