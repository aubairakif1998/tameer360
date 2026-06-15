import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import type {
  VehicleOwnerType,
  VehicleType,
} from '../../domain/vehicle.entity';

export class CreateVehicleDto {
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  registrationNumber: string;

  @IsOptional()
  @IsEnum(['truck', 'loader', 'tractor', 'dumper'])
  type?: VehicleType;

  @IsOptional()
  @IsEnum(['owned', 'rented'])
  ownerType?: VehicleOwnerType;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  registrationNumber?: string;

  @IsOptional()
  @IsEnum(['truck', 'loader', 'tractor', 'dumper'])
  type?: VehicleType;

  @IsOptional()
  @IsEnum(['owned', 'rented'])
  ownerType?: VehicleOwnerType;

  @IsOptional()
  @IsString()
  driverName?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListVehiclesQueryDto {
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
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}
