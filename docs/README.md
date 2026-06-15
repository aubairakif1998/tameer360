# Tameer360 — Documentation Index

**Tameer360** is a white-label Construction Material Supply ERP for Pakistan, targeting brick kilns (Bhatta), sand suppliers, crush plants, cement dealers, and steel traders.

## Documents

| Document | Purpose |
|----------|---------|
| [PRD](./specs/01-prd.md) | Product requirements, user stories, MVP scope |
| [Architecture](./specs/02-architecture.md) | Clean architecture, folder structure, white-label design |
| [Database Schema](./specs/03-database-schema.md) | Drizzle schema, entities, relationships |
| [Module Roadmap](./specs/04-module-roadmap.md) | Phased delivery plan, spec-driven workflow |
| [API Conventions](./specs/05-api-conventions.md) | REST standards, multi-tenant headers, error format |

## Spec-Driven Development Workflow

1. Write/update spec in `docs/specs/modules/<module>/`
2. Implement backend: domain → application → infrastructure → presentation
3. Add Drizzle migration
4. Implement frontend: API client → pages → components
5. Mark module complete in roadmap

## Quick Start

```bash
# Backend (port 4000)
cd backend && cp .env.example .env && npm install && npm run db:migrate && npm run db:seed && npm run start:dev

# Frontend (port 3000)
cd webapp && cp .env.example .env.local && npm install && npm run dev
```
