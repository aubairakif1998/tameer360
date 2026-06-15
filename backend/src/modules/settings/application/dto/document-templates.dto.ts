import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class InvoiceFieldsDto {
  @IsOptional() @IsBoolean() customerPhone?: boolean;
  @IsOptional() @IsBoolean() orderNumber?: boolean;
  @IsOptional() @IsBoolean() materialCode?: boolean;
  @IsOptional() @IsBoolean() lineItems?: boolean;
  @IsOptional() @IsBoolean() pickupLocation?: boolean;
  @IsOptional() @IsBoolean() dropoffLocation?: boolean;
  @IsOptional() @IsBoolean() journeyKm?: boolean;
  @IsOptional() @IsBoolean() expectedDelivery?: boolean;
  @IsOptional() @IsBoolean() vehicle?: boolean;
  @IsOptional() @IsBoolean() dispatchDate?: boolean;
}

class ReceiptFieldsDto {
  @IsOptional() @IsBoolean() paymentMethod?: boolean;
  @IsOptional() @IsBoolean() referenceNumber?: boolean;
  @IsOptional() @IsBoolean() orderNumber?: boolean;
  @IsOptional() @IsBoolean() dispatchNumber?: boolean;
  @IsOptional() @IsBoolean() paymentNotes?: boolean;
}

class InvoiceTemplateDto {
  @IsOptional() @IsString() @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(500) footerText?: string;
  @IsOptional() @IsBoolean() showLogo?: boolean;
  @IsOptional() @IsObject() @ValidateNested() @Type(() => InvoiceFieldsDto)
  fields?: InvoiceFieldsDto;
}

class ReceiptTemplateDto {
  @IsOptional() @IsString() @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(500) footerText?: string;
  @IsOptional() @IsBoolean() showLogo?: boolean;
  @IsOptional() @IsObject() @ValidateNested() @Type(() => ReceiptFieldsDto)
  fields?: ReceiptFieldsDto;
}

export class UpdateDocumentTemplatesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceTemplateDto)
  invoice?: InvoiceTemplateDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ReceiptTemplateDto)
  receipt?: ReceiptTemplateDto;
}
