import { Module } from '@nestjs/common';
import { paymentRepositoryProvider } from './infrastructure/drizzle-payment.repository';
import {
  CreatePaymentUseCase,
  DeletePaymentUseCase,
  GetOutstandingUseCase,
  GetPaymentUseCase,
  ListPaymentsUseCase,
} from './application/payment.use-cases';
import { PaymentsController } from './presentation/payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [
    paymentRepositoryProvider,
    ListPaymentsUseCase,
    GetPaymentUseCase,
    CreatePaymentUseCase,
    DeletePaymentUseCase,
    GetOutstandingUseCase,
  ],
})
export class FinanceModule {}
