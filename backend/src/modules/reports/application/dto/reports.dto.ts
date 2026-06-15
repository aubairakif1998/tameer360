import { IsDateString, IsOptional } from 'class-validator';

export class AgingReceivablesQueryDto {
  @IsOptional()
  @IsDateString()
  asOfDate?: string;
}

export class ProfitReportQueryDto {
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @IsOptional()
  @IsDateString()
  periodEnd?: string;
}
