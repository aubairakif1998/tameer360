export type UserRole =
  | 'platform_admin'
  | 'owner'
  | 'manager'
  | 'accountant'
  | 'viewer';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  tenantId: string | null;
  tenantSlug: string | null;
  tenantDisplayName: string | null;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
