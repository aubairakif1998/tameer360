import { apiFetch } from './client';
import type { TenantBranding } from './types';

export interface TenantRecord extends TenantBranding {
  id: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantPayload {
  slug: string;
  displayName: string;
  businessType?: string;
  primaryColor?: string;
  accentColor?: string;
  ownerEmail: string;
  ownerFullName: string;
  ownerPassword: string;
}

export interface CreateTenantResult {
  tenant: TenantRecord;
  owner: { id: string; email: string; fullName: string };
  credentials: {
    tenantSlug: string;
    loginUrl: string;
    email: string;
    password: string;
  };
}

export interface SlugAvailability {
  slug: string;
  available: boolean;
}

export const platformApi = {
  listTenants: () => apiFetch<TenantRecord[]>('/platform/tenants'),
  checkSlugAvailability: (slug: string) =>
    apiFetch<SlugAvailability>(
      `/platform/tenants/slug-availability/${encodeURIComponent(slug)}`,
    ),
  createTenant: (payload: CreateTenantPayload) =>
    apiFetch<CreateTenantResult>('/platform/tenants', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateTenantStatus: (slug: string, isActive: boolean) =>
    apiFetch<TenantRecord>(`/platform/tenants/${slug}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
};
