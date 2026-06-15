import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { successResponse } from '../../../shared/common/api-response';
import { PlatformRoute, Public } from '../../../shared/auth/public.decorator';
import { PlatformAdminGuard } from '../../auth/guards/platform-admin.guard';
import { CreateTenantWithOwnerUseCase } from '../application/create-tenant-with-owner.use-case';
import { UpdateTenantStatusDto } from '../application/dto/update-tenant-status.dto';
import { CreateTenantWithOwnerDto } from '../application/dto/create-tenant-with-owner.dto';
import type { CreateTenantWithOwnerResult } from '../application/platform.results';
import type { Tenant } from '../domain/tenant.entity';
import {
  LIST_TENANTS_USE_CASE,
  type ListTenantsUseCasePort,
} from '../application/list-tenants.port';
import {
  CheckSlugAvailabilityUseCase,
  GetTenantBrandingUseCase,
  GetTenantUseCase,
  UpdateTenantStatusUseCase,
} from '../application/platform.use-cases';

@PlatformRoute()
@Controller('platform/tenants')
export class PlatformController {
  constructor(
    private readonly getBrandingUseCase: GetTenantBrandingUseCase,
    private readonly getTenantUseCase: GetTenantUseCase,
    private readonly createTenantWithOwnerUseCase: CreateTenantWithOwnerUseCase,
    private readonly checkSlugAvailability: CheckSlugAvailabilityUseCase,
    private readonly updateTenantStatus: UpdateTenantStatusUseCase,
    @Inject(LIST_TENANTS_USE_CASE)
    private readonly listTenantsUseCase: ListTenantsUseCasePort,
  ) {}

  @Public()
  @Get(':slug/branding')
  async getBrandingBySlug(@Param('slug') slug: string) {
    const data = await this.getBrandingUseCase.execute(slug);
    return successResponse(data);
  }

  @UseGuards(PlatformAdminGuard)
  @Get('slug-availability/:slug')
  async checkSlug(@Param('slug') slug: string) {
    const data = await this.checkSlugAvailability.execute(slug);
    return successResponse(data);
  }

  @UseGuards(PlatformAdminGuard)
  @Get()
  async list() {
    const data: Tenant[] = await this.listTenantsUseCase.execute();
    return successResponse(data);
  }

  @UseGuards(PlatformAdminGuard)
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const data: Tenant = await this.getTenantUseCase.execute(slug);
    return successResponse(data);
  }

  @UseGuards(PlatformAdminGuard)
  @Post()
  async create(@Body() dto: CreateTenantWithOwnerDto) {
    const data: CreateTenantWithOwnerResult =
      await this.createTenantWithOwnerUseCase.execute(dto);
    return successResponse(data);
  }

  @UseGuards(PlatformAdminGuard)
  @Patch(':slug/status')
  async updateStatus(
    @Param('slug') slug: string,
    @Body() dto: UpdateTenantStatusDto,
  ) {
    const data = await this.updateTenantStatus.execute(slug, dto.isActive);
    return successResponse(data);
  }
}
