import { Type } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';

export class ListStockLedgerQueryDto {
  @IsOptional()
  @IsUUID()
  materialTypeId?: string;

  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
