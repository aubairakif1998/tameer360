import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthUser } from '../../../shared/auth/auth.types';
import {
  IS_AUTH_ROUTE_KEY,
  IS_PLATFORM_ROUTE_KEY,
  IS_PUBLIC_KEY,
} from '../../../shared/auth/public.decorator';
import { TenantContext } from '../../../shared/tenant/tenant.context';

@Injectable()
export class TenantAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContext: TenantContext,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const isPlatformRoute = this.reflector.getAllAndOverride<boolean>(
      IS_PLATFORM_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPlatformRoute) return true;

    const isAuthRoute = this.reflector.getAllAndOverride<boolean>(
      IS_AUTH_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isAuthRoute) return true;

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      });
    }

    if (user.role === 'platform_admin') {
      throw new ForbiddenException({
        code: 'TENANT_ACCESS_DENIED',
        message: 'Tenant users only',
      });
    }

    if (!this.tenantContext.hasTenant()) {
      throw new ForbiddenException({
        code: 'TENANT_REQUIRED',
        message: 'Tenant context is required',
      });
    }

    const tenantId = this.tenantContext.getTenantId();
    const tenantSlug = this.tenantContext.getTenantSlug();

    if (!user.tenantId || user.tenantId !== tenantId) {
      throw new ForbiddenException({
        code: 'TENANT_MISMATCH',
        message: 'You do not have access to this organization',
      });
    }

    if (user.tenantSlug && user.tenantSlug !== tenantSlug) {
      throw new ForbiddenException({
        code: 'TENANT_MISMATCH',
        message: 'You do not have access to this organization',
      });
    }

    return true;
  }
}
