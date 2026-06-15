import { IsEmail, IsString, MinLength } from 'class-validator';
import { CreateTenantDto } from './create-tenant.dto';

export class CreateTenantWithOwnerDto extends CreateTenantDto {
  @IsEmail()
  ownerEmail: string;

  @IsString()
  @MinLength(2)
  ownerFullName: string;

  @IsString()
  @MinLength(6)
  ownerPassword: string;
}
