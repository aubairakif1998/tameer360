import type { Tenant } from '../domain/tenant.entity';

export interface TenantOwnerSummary {
  id: string;
  email: string;
  fullName: string;
}

export interface TenantOwnerCredentials {
  tenantSlug: string;
  loginUrl: string;
  email: string;
  password: string;
}

export interface CreateTenantWithOwnerResult {
  tenant: Tenant;
  owner: TenantOwnerSummary;
  credentials: TenantOwnerCredentials;
}
