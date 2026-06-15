import {
  BadRequestException,
  Inject,
  Injectable,
  NestMiddleware,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import type { DrizzleDB } from '../database/database.types';
import { DRIZZLE } from '../database/database.constants';
import { tenants } from '../database/schema/tenants';
import { TenantContext } from './tenant.context';

export const TENANT_SLUG_HEADER = 'x-tenant-slug';

function normalizeRequestPath(req: Request): string {
  const raw = (req.originalUrl ?? req.url ?? req.path).split('?')[0];
  const withoutPrefix = raw.replace(/^\/api\/v1/, '');
  return withoutPrefix || '/';
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly tenantContext: TenantContext,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const path = normalizeRequestPath(req);
    const isPublicRoute =
      path === '/health' ||
      path === '/auth/login' ||
      /^\/platform\/tenants\/[^/]+\/branding$/.test(path);

    const isPlatformOrAuthRoute =
      path.startsWith('/platform/') || path.startsWith('/auth/');

    if (isPublicRoute || isPlatformOrAuthRoute) {
      return next();
    }

    const slug = req.headers[TENANT_SLUG_HEADER] as string | undefined;

    if (!slug?.trim()) {
      throw new BadRequestException({
        code: 'TENANT_SLUG_REQUIRED',
        message: 'Tenant context is required for this request',
      });
    }

    const [tenant] = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug.trim().toLowerCase()))
      .limit(1);

    if (!tenant) {
      throw new NotFoundException({
        code: 'TENANT_NOT_FOUND',
        message: `Tenant "${slug}" not found`,
      });
    }

    if (!tenant.isActive) {
      throw new ForbiddenException({
        code: 'TENANT_INACTIVE',
        message: 'This organization is inactive',
      });
    }

    this.tenantContext.setTenant(tenant);
    next();
  }
}
