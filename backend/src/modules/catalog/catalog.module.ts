import { Module } from '@nestjs/common';
import { materialTypeRepositoryProvider } from './infrastructure/drizzle-material-type.repository';
import {
  CreateMaterialTypeUseCase,
  DeleteMaterialTypeUseCase,
  GetMaterialTypeUseCase,
  ListMaterialTypesUseCase,
  SuggestMaterialCodeUseCase,
  UpdateMaterialTypeUseCase,
} from './application/material-type.use-cases';
import { MaterialTypesController } from './presentation/material-types.controller';

@Module({
  controllers: [MaterialTypesController],
  providers: [
    materialTypeRepositoryProvider,
    ListMaterialTypesUseCase,
    GetMaterialTypeUseCase,
    SuggestMaterialCodeUseCase,
    CreateMaterialTypeUseCase,
    UpdateMaterialTypeUseCase,
    DeleteMaterialTypeUseCase,
  ],
  exports: [materialTypeRepositoryProvider],
})
export class CatalogModule {}
