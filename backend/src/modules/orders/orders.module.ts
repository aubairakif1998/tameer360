import { Module } from '@nestjs/common';
import { StockModule } from '../../shared/stock/stock.module';
import { orderRepositoryProvider } from './infrastructure/drizzle-order.repository';
import {
  CreateOrderUseCase,
  GetFulfillmentSummaryUseCase,
  GetOrderUseCase,
  ListOrdersUseCase,
  UpdateOrderUseCase,
} from './application/order.use-cases';
import { OrdersController } from './presentation/orders.controller';

@Module({
  imports: [StockModule],
  controllers: [OrdersController],
  providers: [
    orderRepositoryProvider,
    ListOrdersUseCase,
    GetOrderUseCase,
    CreateOrderUseCase,
    UpdateOrderUseCase,
    GetFulfillmentSummaryUseCase,
  ],
  exports: [orderRepositoryProvider],
})
export class OrdersModule {}
