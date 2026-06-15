export type BusinessType =
  | 'brick_kiln'
  | 'sand'
  | 'crush'
  | 'cement'
  | 'steel'
  | 'general';

export interface TenantBranding {
  slug: string;
  displayName: string;
  businessType: BusinessType;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
  showPoweredBy: boolean;
}

export interface Tenant extends TenantBranding {
  id: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantInput {
  slug: string;
  displayName: string;
  businessType?: BusinessType;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  showPoweredBy?: boolean;
}

export const TENANT_REPOSITORY = Symbol('TENANT_REPOSITORY');

export interface TenantRepository {
  findBySlug(slug: string): Promise<Tenant | null>;
  findAll(): Promise<Tenant[]>;
  create(input: CreateTenantInput): Promise<Tenant>;
  updateStatus(slug: string, isActive: boolean): Promise<Tenant>;
  slugExists(slug: string): Promise<boolean>;
}
