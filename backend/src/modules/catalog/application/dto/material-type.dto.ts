import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  MATERIAL_CATEGORIES,
  type MaterialCategory,
} from '../../domain/material-category.constants';
import type { MaterialUnit } from '../../domain/material-unit';

export class CreateMaterialTypeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/, {
    message: 'Code must be uppercase alphanumeric with hyphens (e.g. A-GRADE)',
  })
  code?: string;

  @IsEnum(MATERIAL_CATEGORIES)
  category: MaterialCategory;

  @IsOptional()
  @IsEnum(['piece', 'ton', 'cft', 'bag'])
  unit?: MaterialUnit;

  @IsOptional()
  @IsNumber()
  defaultRate?: number;
}

export class UpdateMaterialTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/)
  code?: string;

  @IsOptional()
  @IsEnum(MATERIAL_CATEGORIES)
  category?: MaterialCategory;

  @IsOptional()
  @IsEnum(['piece', 'ton', 'cft', 'bag'])
  unit?: MaterialUnit;

  @IsOptional()
  @IsNumber()
  defaultRate?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListMaterialTypesQueryDto {
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
  @IsEnum(MATERIAL_CATEGORIES)
  category?: MaterialCategory;

  @IsOptional()
  @Transform(
    ({ value, obj }: { value: unknown; obj?: Record<string, unknown> }) => {
      const raw = value ?? obj?.is_active;
      if (raw === 'true' || raw === true) return true;
      if (raw === 'false' || raw === false) return false;
      return undefined;
    },
  )
  @IsBoolean()
  isActive?: boolean;
}

export class SuggestMaterialCodeQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;
}
