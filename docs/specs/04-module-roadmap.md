# Tameer360 — Module Roadmap

## Delivery Phases

### Phase 1 — MVP Core ✅ (Complete)

### Phase 0 — Foundation ✅

- [x] Project specs & documentation
- [x] Backend clean architecture scaffold
- [x] Drizzle + Supabase connection
- [x] Multi-tenant context & middleware
- [x] Platform module: tenants, branding API
- [x] Frontend: BFF proxy, API client, dashboard shell
- [x] White-label theming

### Phase 1 — MVP Core (Weeks 1-4)

| Module            | Spec                         | Backend               | Frontend               | Priority |
| ----------------- | ---------------------------- | --------------------- | ---------------------- | -------- |
| M1 Customers      | `modules/customers/spec.md`  | CRUD + ledger         | List, form, detail     | P0 ✅    |
| M2 Material Types | `modules/catalog/spec.md`    | CRUD                  | Materials page         | P0 ✅    |
| M3 Orders         | `modules/orders/spec.md`     | CRUD + fulfillment    | List, create, progress | P0 ✅    |
| M4 Dispatches     | `modules/dispatches/spec.md` | CRUD + status flow    | Dispatch board         | P0 ✅    |
| M5 Vehicles       | `modules/fleet/spec.md`      | CRUD                  | List, form             | P1 ✅    |
| M6 Payments       | `modules/finance/spec.md`    | CRUD + balance update | Receipt entry          | P0 ✅    |
| M7 Dashboard      | `modules/dashboard/spec.md`  | Aggregations          | CEO dashboard          | P0 ✅    |

### Phase 2 — Intelligence (Weeks 5-8) ✅

- Inventory ledger & production batches ✅
- Expense tracking & vehicle profitability ✅ (seed + profit reports)
- Aging receivables & credit limits ✅ (aging done; credit limits pending)
- Profit reports (customer, vehicle, month) ✅

### Phase 3 — Full ERP (Weeks 9+)

- Raw material & labor modules
- GPS tracking & driver app
- WhatsApp notifications
- Urdu localization
- AI forecasting

---

## Spec-Driven Checklist (Per Module)

Before coding:

1. Create `docs/specs/modules/<name>/spec.md`
2. Define API endpoints in `docs/specs/modules/<name>/api.md`
3. Add Drizzle schema to `backend/src/shared/database/schema/`
4. Review with stakeholder (friend) if needed

Implementation order:

1. Domain entity + repository port
2. Drizzle schema + migration
3. Repository implementation
4. Use cases + DTOs
5. Controller + e2e test
6. Frontend API types + client methods
7. UI pages

---

## Module M0: Platform (In Progress)

### Endpoints

| Method | Path                                      | Description             |
| ------ | ----------------------------------------- | ----------------------- |
| GET    | `/api/v1/health`                          | Health check            |
| GET    | `/api/v1/platform/tenants/:slug/branding` | Public branding by slug |
| POST   | `/api/v1/platform/tenants`                | Create tenant (admin)   |
| GET    | `/api/v1/platform/tenants/:slug`          | Get tenant details      |

### Acceptance Criteria

- [x] Tenant created with slug, display name, colors
- [x] Branding API returns tenant config without auth
- [x] All subsequent modules scope data by tenant_id
- [x] Frontend applies tenant colors dynamically

---

## Future Client Gaps to Cover (SaaS Differentiators)

These differentiate Tameer360 from basic brick kiln software:

1. **Advance bookings** — long-term orders with partial delivery over months
2. **Multi-site delivery** — one customer, many construction sites
3. **Rate history** — audit trail when rates change mid-season
4. **Stock reservation** — prevent overselling when orders exceed free stock
5. **Production vs sales gap** — alert when open orders exceed available stock
6. **Recovery aging** — 0-30/31-60/60-90/90+ day buckets
7. **Vehicle profitability** — revenue minus fuel/repair/salary per truck
8. **Quality grades** — separate A/B/C/broken stock
9. **Proof of delivery** — photos & signatures (Phase 3)
10. **WhatsApp integration** — dispatch slips to customers (Phase 3)
11. **White-label** — each client gets their own branded ERP
12. **Multi-material** — same platform for sand, crush, cement, steel
