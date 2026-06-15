import { Controller, Get } from '@nestjs/common';
import { successResponse } from './shared/common/api-response';
import { Public } from './shared/auth/public.decorator';
import { HealthCheckUseCase } from './modules/platform/application/platform.use-cases';

@Controller('health')
export class HealthController {
  constructor(private readonly healthCheck: HealthCheckUseCase) {}

  @Public()
  @Get()
  getHealth() {
    return successResponse(this.healthCheck.execute());
  }
}
