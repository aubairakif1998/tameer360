import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import type { PaymentMethod } from '../../domain/payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  dispatchId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsEnum(['cash', 'bank', 'cheque', 'jazzcash', 'easypaisa'])
  paymentMethod?: PaymentMethod;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ListPaymentsQueryDto {
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
  @IsUUID()
  dispatchId?: string;

  @IsOptional()
  @IsEnum(['cash', 'bank', 'cheque', 'jazzcash', 'easypaisa'])
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
