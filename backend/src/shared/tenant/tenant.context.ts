import { Injectable, Scope } from '@nestjs/common';
import { TenantRecord } from '../database/schema/tenants';

@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  private tenant: TenantRecord | null = null;

  setTenant(tenant: TenantRecord): void {
    this.tenant = tenant;
  }

  getTenant(): TenantRecord {
    if (!this.tenant) {
      throw new Error('Tenant context not set');
    }
    return this.tenant;
  }

  getTenantId(): string {
    return this.getTenant().id;
  }

  getTenantSlug(): string {
    return this.getTenant().slug;
  }

  hasTenant(): boolean {
    return this.tenant !== null;
  }
}
