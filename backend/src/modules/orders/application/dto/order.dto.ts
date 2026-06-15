import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';
import type { OrderStatus } from '../../domain/order.entity';

export class CreateOrderDto {
  @IsUUID()
  customerId: string;

  @IsString()
  @MinLength(3)
  deliveryAddress: string;

  @IsUUID()
  materialTypeId: string;

  @IsNumber()
  @Min(1)
  orderedQty: number;

  @IsNumber()
  @Min(0)
  rate: number;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['draft', 'confirmed'])
  status?: OrderStatus;
}

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  deliveryAddress?: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string | null;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(['draft', 'confirmed', 'partial', 'fulfilled', 'cancelled'])
  status?: OrderStatus;
}

export class ListOrdersQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsEnum(['draft', 'confirmed', 'partial', 'fulfilled', 'cancelled'])
  status?: OrderStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  dispatchedOnly?: boolean;
}
