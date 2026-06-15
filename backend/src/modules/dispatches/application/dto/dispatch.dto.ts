import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import type {
  DispatchPaymentStatus,
  DispatchStatus,
} from '../../domain/dispatch.entity';

export class CreateDispatchDto {
  @IsUUID()
  orderId: string;

  @IsUUID()
  vehicleId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsDateString()
  scheduledStartAt?: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryAt?: string;

  @IsOptional()
  @IsDateString()
  dispatchDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  journeyKm?: number;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDispatchDto {
  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsDateString()
  scheduledStartAt?: string;

  @IsOptional()
  @IsDateString()
  expectedDeliveryAt?: string;

  @IsOptional()
  @IsDateString()
  dispatchDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  journeyKm?: number | null;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  dropoffLocation?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'loaded', 'in_transit', 'delivered', 'cancelled'])
  status?: DispatchStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListDispatchesQueryDto {
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
  @IsUUID()
  orderId?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'loaded', 'in_transit', 'delivered', 'cancelled'])
  status?: DispatchStatus;

  @IsOptional()
  @IsEnum(['unpaid', 'paid'])
  paymentStatus?: DispatchPaymentStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  payableOnly?: boolean;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
