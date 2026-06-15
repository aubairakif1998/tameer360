import type { Tenant } from '../domain/tenant.entity';

export const LIST_TENANTS_USE_CASE = Symbol('LIST_TENANTS_USE_CASE');

export interface ListTenantsUseCasePort {
  execute(): Promise<Tenant[]>;
}
