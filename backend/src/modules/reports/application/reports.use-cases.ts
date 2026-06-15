import { Inject, Injectable } from '@nestjs/common';
import { getPakistanMonthRange } from '../../../shared/common/pakistan-date';
import { TenantContext } from '../../../shared/tenant/tenant.context';
import {
  REPORTS_REPOSITORY,
  type ReportsRepository,
} from '../domain/reports.entity';
import type {
  AgingReceivablesQueryDto,
  ProfitReportQueryDto,
} from './dto/reports.dto';

@Injectable()
export class GetAgingReceivablesUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY) private readonly repo: ReportsRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  execute(query: AgingReceivablesQueryDto) {
    const asOfDate = query.asOfDate ?? new Date().toISOString().slice(0, 10);
    return this.repo.getAgingReceivables(
      this.tenantContext.getTenantId(),
      asOfDate,
    );
  }
}

@Injectable()
export class GetProfitReportUseCase {
  constructor(
    @Inject(REPORTS_REPOSITORY) private readonly repo: ReportsRepository,
    private readonly tenantContext: TenantContext,
  ) {}

  execute(query: ProfitReportQueryDto) {
    const today = new Date().toISOString().slice(0, 10);
    const { monthStart, monthEnd } = getPakistanMonthRange(today);
    const periodStart = query.periodStart ?? monthStart;
    const periodEnd = query.periodEnd ?? monthEnd;
    return this.repo.getProfitReport(
      this.tenantContext.getTenantId(),
      periodStart,
      periodEnd,
    );
  }
}
