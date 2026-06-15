# Module M0: Platform & White-Label

## Overview

Foundation module for multi-tenant white-label ERP. Every other module depends on tenant context.

## User Stories

1. **As a platform admin**, I can create a new tenant with slug and branding so a new client gets their own ERP instance.
2. **As a visitor**, I can load tenant branding by slug so the UI shows the client's name and colors.
3. **As a developer**, I can pass `X-Tenant-Slug` header so all API calls are scoped to the correct tenant.

## Entities

### Tenant

```typescript
interface Tenant {
  id: string;
  slug: string;                    // "al-hafeez-bricks"
  displayName: string;             // "Al-Hafeez Bricks ERP"
  businessType: BusinessType;
  logoUrl?: string;
  primaryColor: string;            // "#1e40af"
  accentColor: string;             // "#f59e0b"
  showPoweredBy: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type BusinessType = 'brick_kiln' | 'sand' | 'crush' | 'cement' | 'steel' | 'general';
```

## API Endpoints

See [api.md](./api.md)

## Business Rules

- Slug: lowercase, alphanumeric + hyphens, 3-63 chars, unique globally
- Default colors if not provided: primary `#1e40af`, accent `#f59e0b`
- Inactive tenants return 403 on business APIs
- Branding endpoint is public (no auth)

## Seed Data

Demo tenant for development:

| Field | Value |
|-------|-------|
| slug | `demo-bhatta` |
| displayName | `Demo Bhatta ERP` |
| businessType | `brick_kiln` |
| primaryColor | `#b45309` |
| accentColor | `#fbbf24` |
