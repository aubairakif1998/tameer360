import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateProductionBatchDto {
  @IsUUID()
  materialTypeId!: string;

  @IsNumber()
  @Min(1)
  producedQty!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  damagedQty?: number;

  @IsDateString()
  productionDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListProductionBatchesQueryDto {
  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsUUID()
  materialTypeId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}
