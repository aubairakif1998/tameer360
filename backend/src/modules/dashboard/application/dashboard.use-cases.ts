import { Inject, Injectable } from '@nestjs/common';
import { getPakistanDate } from '../../../shared/common/pakistan-date';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import {
  DASHBOARD_REPOSITORY,
  type DashboardRepository,
} from '../domain/dashboard.entity';

@Injectable()
export class GetDashboardKpisUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY) private readonly repo: DashboardRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  async execute(asOfDate?: string) {
    const tenantId = this.tenantContext.getTenantId();
    const date = asOfDate ?? getPakistanDate();
    return this.repo.getKpis(tenantId, date);
  }
}
