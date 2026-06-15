import { Controller, Get, Query } from '@nestjs/common';
import { successResponse } from '../../../shared/common/api-response';
import {
  AgingReceivablesQueryDto,
  ProfitReportQueryDto,
} from '../application/dto/reports.dto';
import {
  GetAgingReceivablesUseCase,
  GetProfitReportUseCase,
} from '../application/reports.use-cases';

@Controller('reports')
export class ReportsController {
  constructor(
    private readonly getAging: GetAgingReceivablesUseCase,
    private readonly getProfit: GetProfitReportUseCase,
  ) {}

  @Get('aging-receivables')
  async agingReceivables(@Query() query: AgingReceivablesQueryDto) {
    return successResponse(await this.getAging.execute(query));
  }

  @Get('profit')
  async profit(@Query() query: ProfitReportQueryDto) {
    return successResponse(await this.getProfit.execute(query));
  }
}
