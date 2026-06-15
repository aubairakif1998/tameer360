import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { and, eq, isNull } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import type { DrizzleDB } from '../../shared/database/database.types';
import { DRIZZLE } from '../../shared/database/database.constants';
import { tenants } from '../../shared/database/schema/tenants';
import { users } from '../../shared/database/schema/users';
import type {
  AuthUser,
  JwtPayload,
  UserRole,
} from '../../shared/auth/auth.types';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = dto.tenantSlug
      ? await this.findTenantUser(dto.email, dto.tenantSlug)
      : await this.findPlatformAdmin(dto.email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    const tenantSlug = user.tenantSlug;
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug,
    };

    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: this.toAuthUser(user),
    };
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const [record] = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        tenantId: users.tenantId,
        isActive: users.isActive,
        tenantSlug: tenants.slug,
        tenantDisplayName: tenants.displayName,
      })
      .from(users)
      .leftJoin(tenants, eq(users.tenantId, tenants.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!record || !record.isActive) {
      throw new UnauthorizedException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return this.toAuthUser(record);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async findPlatformAdmin(email: string) {
    const [record] = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        tenantId: users.tenantId,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
        tenantSlug: tenants.slug,
        tenantDisplayName: tenants.displayName,
      })
      .from(users)
      .leftJoin(tenants, eq(users.tenantId, tenants.id))
      .where(
        and(
          eq(users.email, email.toLowerCase()),
          isNull(users.tenantId),
          eq(users.role, 'platform_admin'),
        ),
      )
      .limit(1);

    return record ?? null;
  }

  private async findTenantUser(email: string, tenantSlug: string) {
    const [tenant] = await this.db
      .select({
        id: tenants.id,
        isActive: tenants.isActive,
      })
      .from(tenants)
      .where(eq(tenants.slug, tenantSlug))
      .limit(1);

    if (tenant && !tenant.isActive) {
      throw new ForbiddenException({
        code: 'TENANT_INACTIVE',
        message: 'This organization is disabled. Contact Tameer360 support.',
      });
    }

    const [record] = await this.db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        role: users.role,
        tenantId: users.tenantId,
        passwordHash: users.passwordHash,
        isActive: users.isActive,
        tenantSlug: tenants.slug,
        tenantDisplayName: tenants.displayName,
      })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id))
      .where(
        and(
          eq(users.email, email.toLowerCase()),
          eq(tenants.slug, tenantSlug),
          eq(tenants.isActive, true),
        ),
      )
      .limit(1);

    if (record && record.role === 'platform_admin') {
      throw new ForbiddenException({
        code: 'INVALID_LOGIN_MODE',
        message: 'Use platform admin login without tenant slug',
      });
    }

    return record ?? null;
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    tenantId: string | null;
    tenantSlug: string | null;
    tenantDisplayName?: string | null;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
      tenantSlug: user.tenantSlug,
      tenantDisplayName: user.tenantDisplayName ?? null,
    };
  }
}
