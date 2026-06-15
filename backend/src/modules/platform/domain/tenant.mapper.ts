import { TenantRecord } from '../../../shared/database/schema/tenants';
import { Tenant, TenantBranding } from './tenant.entity';

export type { TenantRecord };

export function toTenant(record: TenantRecord): Tenant {
  return {
    id: record.id,
    slug: record.slug,
    displayName: record.displayName,
    businessType: record.businessType,
    logoUrl: record.logoUrl,
    primaryColor: record.primaryColor,
    accentColor: record.accentColor,
    showPoweredBy: record.showPoweredBy,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export function toTenantBranding(
  source: TenantRecord | Tenant,
): TenantBranding {
  return {
    slug: source.slug,
    displayName: source.displayName,
    businessType: source.businessType,
    logoUrl: source.logoUrl,
    primaryColor: source.primaryColor,
    accentColor: source.accentColor,
    showPoweredBy: source.showPoweredBy,
  };
}
