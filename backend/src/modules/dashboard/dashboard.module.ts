import { Module } from '@nestjs/common';
import { LedgerModule } from '../../shared/ledger/ledger.module';
import { StockModule } from '../../shared/stock/stock.module';
import { dashboardRepositoryProvider } from './infrastructure/drizzle-dashboard.repository';
import { GetDashboardKpisUseCase } from './application/dashboard.use-cases';
import { DashboardController } from './presentation/dashboard.controller';

@Module({
  imports: [LedgerModule, StockModule],
  controllers: [DashboardController],
  providers: [dashboardRepositoryProvider, GetDashboardKpisUseCase],
})
export class DashboardModule {}
