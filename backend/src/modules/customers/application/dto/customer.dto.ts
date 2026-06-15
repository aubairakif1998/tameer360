import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  formatPakistanCnicForSubmit,
  isValidPakistanCnic,
} from '../../../../shared/validation/pakistan-cnic';
import {
  formatPakistanPhoneForSubmit,
  isValidPakistanPhone,
} from '../../../../shared/validation/pakistan-phone';
import type { CustomerType } from '../../domain/customer.entity';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(20)
  @Transform(({ value }: { value: unknown }): string =>
    typeof value === 'string' ? formatPakistanPhoneForSubmit(value) : '',
  )
  @Matches(/^\+92-\d{3}-\d{7}$/, {
    message: 'Phone must be in Pakistan format (+92-3XX-XXXXXXX)',
  })
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  @Transform(({ value }: { value: unknown }): string | undefined => {
    if (typeof value !== 'string') return undefined;
    return formatPakistanCnicForSubmit(value);
  })
  cnic?: string;

  @IsOptional()
  @IsEnum(['vendor', 'contractor', 'builder', 'individual'])
  type?: CustomerType;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }: { value: unknown }): string =>
    typeof value === 'string' ? formatPakistanPhoneForSubmit(value) : '',
  )
  @Matches(/^\+92-\d{3}-\d{7}$/, {
    message: 'Phone must be in Pakistan format (+92-3XX-XXXXXXX)',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  @Transform(({ value }: { value: unknown }): string | null | undefined => {
    if (value === null) return null;
    if (typeof value !== 'string') return undefined;
    return formatPakistanCnicForSubmit(value);
  })
  cnic?: string | null;

  @IsOptional()
  @IsEnum(['vendor', 'contractor', 'builder', 'individual'])
  type?: CustomerType;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListCustomersQueryDto {
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
  @IsEnum(['vendor', 'contractor', 'builder', 'individual'])
  type?: CustomerType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}

export function validateOptionalCnic(cnic?: string | null): void {
  if (cnic && !isValidPakistanCnic(cnic)) {
    throw new Error('Invalid CNIC format');
  }
}

export function validatePhone(phone: string): void {
  if (!isValidPakistanPhone(phone)) {
    throw new Error('Invalid phone format');
  }
}
