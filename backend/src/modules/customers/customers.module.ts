import { Module } from '@nestjs/common';
import { customerRepositoryProvider } from './infrastructure/drizzle-customer.repository';
import {
  CreateCustomerUseCase,
  DeleteCustomerUseCase,
  GetCustomerUseCase,
  ListCustomersUseCase,
  UpdateCustomerUseCase,
} from './application/customer.use-cases';
import { CustomersController } from './presentation/customers.controller';

@Module({
  controllers: [CustomersController],
  providers: [
    customerRepositoryProvider,
    ListCustomersUseCase,
    GetCustomerUseCase,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
  ],
})
export class CustomersModule {}
