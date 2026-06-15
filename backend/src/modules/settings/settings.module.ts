import { Module } from '@nestjs/common';
import {
  GetDocumentTemplatesUseCase,
  UpdateDocumentTemplatesUseCase,
} from './application/settings.use-cases';
import { SettingsController } from './presentation/settings.controller';

@Module({
  controllers: [SettingsController],
  providers: [GetDocumentTemplatesUseCase, UpdateDocumentTemplatesUseCase],
})
export class SettingsModule {}
