import type { TenantBranding } from '@/lib/api/types';

export function applyTenantBranding(branding: TenantBranding) {
  const root = document.documentElement;
  root.style.setProperty('--primary', branding.primaryColor);
  root.style.setProperty('--accent', branding.accentColor);
  root.dataset.tenant = branding.slug;
}

export const DEFAULT_TENANT_SLUG =
  process.env.NEXT_PUBLIC_DEFAULT_TENANT_SLUG ?? 'demo-bhatta';
