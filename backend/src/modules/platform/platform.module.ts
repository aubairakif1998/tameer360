import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { tenantRepositoryProvider } from './infrastructure/drizzle-tenant.repository';
import { CreateTenantWithOwnerUseCase } from './application/create-tenant-with-owner.use-case';
import { LIST_TENANTS_USE_CASE } from './application/list-tenants.port';
import {
  CheckSlugAvailabilityUseCase,
  CreateTenantUseCase,
  GetTenantBrandingUseCase,
  GetTenantUseCase,
  HealthCheckUseCase,
  ListTenantsUseCase,
  UpdateTenantStatusUseCase,
} from './application/platform.use-cases';
import { PlatformController } from './presentation/platform.controller';

@Module({
  imports: [AuthModule],
  controllers: [PlatformController],
  providers: [
    tenantRepositoryProvider,
    GetTenantBrandingUseCase,
    GetTenantUseCase,
    CheckSlugAvailabilityUseCase,
    UpdateTenantStatusUseCase,
    { provide: LIST_TENANTS_USE_CASE, useClass: ListTenantsUseCase },
    CreateTenantUseCase,
    CreateTenantWithOwnerUseCase,
    HealthCheckUseCase,
  ],
  exports: [HealthCheckUseCase],
})
export class PlatformModule {}
