import { Module } from '@nestjs/common';
import { reportsRepositoryProvider } from './infrastructure/drizzle-reports.repository';
import {
  GetAgingReceivablesUseCase,
  GetProfitReportUseCase,
} from './application/reports.use-cases';
import { ReportsController } from './presentation/reports.controller';

@Module({
  controllers: [ReportsController],
  providers: [
    reportsRepositoryProvider,
    GetAgingReceivablesUseCase,
    GetProfitReportUseCase,
  ],
})
export class ReportsModule {}
