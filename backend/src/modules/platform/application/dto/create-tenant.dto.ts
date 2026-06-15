import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import type { BusinessType } from '../../domain/tenant.entity';

export class CreateTenantDto {
  @IsString()
  @MinLength(3)
  @MaxLength(63)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug: string;

  @IsString()
  @MinLength(2)
  @MaxLength(255)
  displayName: string;

  @IsOptional()
  @IsEnum(['brick_kiln', 'sand', 'crush', 'cement', 'steel', 'general'])
  businessType?: BusinessType;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  primaryColor?: string;

  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/)
  accentColor?: string;

  @IsOptional()
  @IsBoolean()
  showPoweredBy?: boolean;
}
