import { Controller, Get, Query } from '@nestjs/common';
import { IsDateString, IsOptional } from 'class-validator';
import { successResponse } from '../../../shared/common/api-response';
import { GetDashboardKpisUseCase } from '../application/dashboard.use-cases';

class DashboardQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;
}

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly getKpis: GetDashboardKpisUseCase) {}

  @Get('kpis')
  async kpis(@Query() query: DashboardQueryDto) {
    const data = await this.getKpis.execute(query.date);
    return successResponse(data);
  }
}
