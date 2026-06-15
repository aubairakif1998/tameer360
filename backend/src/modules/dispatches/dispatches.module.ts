import { Module } from '@nestjs/common';
import { dispatchRepositoryProvider } from './infrastructure/drizzle-dispatch.repository';
import {
  CreateDispatchUseCase,
  GetDispatchUseCase,
  ListDispatchesUseCase,
  UpdateDispatchUseCase,
} from './application/dispatch.use-cases';
import { DispatchesController } from './presentation/dispatches.controller';

@Module({
  controllers: [DispatchesController],
  providers: [
    dispatchRepositoryProvider,
    ListDispatchesUseCase,
    GetDispatchUseCase,
    CreateDispatchUseCase,
    UpdateDispatchUseCase,
  ],
})
export class DispatchesModule {}
