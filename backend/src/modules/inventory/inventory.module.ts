import { Module } from '@nestjs/common';
import { StockModule } from '../../shared/stock/stock.module';
import { InventoryController } from './presentation/inventory.controller';
import {
  GetStockAvailabilityUseCase,
  GetStockSummaryUseCase,
  ListStockLedgerUseCase,
} from './application/inventory.use-cases';

@Module({
  imports: [StockModule],
  controllers: [InventoryController],
  providers: [
    GetStockSummaryUseCase,
    GetStockAvailabilityUseCase,
    ListStockLedgerUseCase,
  ],
})
export class InventoryModule {}
