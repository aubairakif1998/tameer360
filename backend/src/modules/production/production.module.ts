import { Module } from '@nestjs/common';
import { productionRepositoryProvider } from './infrastructure/drizzle-production.repository';
import {
  CreateProductionBatchUseCase,
  GetProductionBatchUseCase,
  ListProductionBatchesUseCase,
} from './application/production.use-cases';
import { ProductionController } from './presentation/production.controller';

@Module({
  controllers: [ProductionController],
  providers: [
    productionRepositoryProvider,
    ListProductionBatchesUseCase,
    GetProductionBatchUseCase,
    CreateProductionBatchUseCase,
  ],
})
export class ProductionModule {}
