# Tameer360 — Architecture

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), shadcn/ui, Tailwind CSS 4 |
| Backend | NestJS 11, Clean Architecture |
| Database | Supabase PostgreSQL |
| ORM | Drizzle ORM |
| Auth (Phase 1.5) | Supabase Auth or JWT |

## Repository Structure

```
Tameer-ERP/
├── docs/specs/           # Spec-driven docs
├── backend/              # NestJS API (port 4000)
└── webapp/               # Next.js frontend (port 3000)
    └── app/api/          # BFF routes → backend APIs
```

## Backend — Clean Architecture

Each feature module follows four layers:

```
modules/<feature>/
├── domain/               # Entities, value objects, repository ports (interfaces)
├── application/          # Use cases, DTOs, mappers
├── infrastructure/       # Drizzle repositories, external adapters
└── presentation/         # Controllers, guards, filters
```

### Dependency Rule

```
presentation → application → domain ← infrastructure
```

- **Domain** has zero framework dependencies
- **Application** orchestrates use cases, depends on domain ports
- **Infrastructure** implements ports (Drizzle repos)
- **Presentation** is thin HTTP layer

### Shared Infrastructure

```
src/
├── main.ts
├── app.module.ts
├── shared/
│   ├── config/           # env validation
│   ├── database/           # Drizzle client, schema barrel
│   ├── tenant/             # TenantContext, TenantGuard, @CurrentTenant()
│   └── common/             # ApiResponse wrapper, pagination
└── modules/
    ├── platform/
    ├── customers/
    ├── orders/
    └── ...
```

## Multi-Tenant (White-Label)

### Tenant Resolution Order

1. `X-Tenant-Slug` header (development / API clients)
2. Subdomain: `{slug}.tameer360.pk`
3. Custom domain mapping (future)

### Data Isolation

Every business table includes `tenant_id UUID NOT NULL`. All queries scoped via `TenantContext`.

```typescript
// Repository pattern — always filter by tenant
await db.select().from(customers).where(
  and(eq(customers.tenantId, tenantId), eq(customers.id, id))
);
```

### Branding Model

```typescript
interface TenantBranding {
  displayName: string;      // "Al-Hafeez Bricks ERP"
  logoUrl?: string;
  primaryColor: string;   // "#1e40af"
  accentColor: string;
  showPoweredBy: boolean;   // "Powered by Tameer360"
}
```

Frontend loads branding via `GET /api/v1/platform/tenant/branding` and applies CSS variables.

## Frontend Architecture

```
webapp/
├── app/
│   ├── (auth)/           # login, register
│   ├── (dashboard)/      # protected app shell
│   │   ├── customers/
│   │   ├── orders/
│   │   ├── dispatches/
│   │   └── ...
│   └── api/              # Next.js Route Handlers (BFF)
│       └── v1/[...path]/ # proxy to NestJS backend
├── lib/
│   ├── api/              # typed API client
│   └── tenant/           # branding context
└── components/
    ├── layout/           # sidebar, header
    └── ui/               # shadcn
```

### BFF Pattern

Next.js `app/api/v1/*` proxies to NestJS backend:
- Adds tenant header from cookie/subdomain
- Handles auth token forwarding
- Keeps backend URL server-side only

## API Versioning

All endpoints under `/api/v1/`.

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer not found"
  }
}
```

## Module Communication

- Modules do NOT import each other's infrastructure
- Cross-module calls go through application services or domain events (future)
- Shared read models via dedicated query services when needed
