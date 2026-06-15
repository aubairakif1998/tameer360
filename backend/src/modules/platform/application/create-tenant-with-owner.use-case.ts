import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import type { DrizzleDB } from '../../../shared/database/database.types';
import { DRIZZLE } from '../../../shared/database/database.constants';
import { users } from '../../../shared/database/schema/users';
import { CreateTenantWithOwnerDto } from './dto/create-tenant-with-owner.dto';
import { CreateTenantUseCase } from './platform.use-cases';
import type { CreateTenantWithOwnerResult } from './platform.results';

@Injectable()
export class CreateTenantWithOwnerUseCase {
  constructor(
    private readonly createTenant: CreateTenantUseCase,
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly authService: AuthService,
  ) {}

  async execute(
    dto: CreateTenantWithOwnerDto,
  ): Promise<CreateTenantWithOwnerResult> {
    const tenant = await this.createTenant.execute(dto);
    const passwordHash = await this.authService.hashPassword(dto.ownerPassword);

    const [owner] = await this.db
      .insert(users)
      .values({
        tenantId: tenant.id,
        email: dto.ownerEmail.toLowerCase(),
        fullName: dto.ownerFullName,
        passwordHash,
        role: 'owner',
      })
      .returning({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
      });

    return {
      tenant,
      owner,
      credentials: {
        tenantSlug: tenant.slug,
        loginUrl: `/login?tenant=${tenant.slug}`,
        email: owner.email,
        password: dto.ownerPassword,
      },
    };
  }
}
