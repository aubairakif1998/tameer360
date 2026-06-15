export type UserRole =
  | 'platform_admin'
  | 'owner'
  | 'manager'
  | 'accountant'
  | 'viewer';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  tenantSlug: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string | null;
  tenantSlug: string | null;
  tenantDisplayName: string | null;
}
