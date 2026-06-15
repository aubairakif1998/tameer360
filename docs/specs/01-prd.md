# Tameer360 — Product Requirements Document

## Vision

White-label ERP for construction material suppliers in Pakistan. One platform powers many branded deployments (e.g. "Al-Hafeez Bricks ERP" powered by Tameer360).

**Tagline:** Production • Stock • Dispatch • Recovery

## Target Users

| Role | Primary Tasks |
|------|---------------|
| Owner / CEO | Dashboard, profit, receivables, stock alerts |
| Sales / Dispatch Manager | Orders, dispatches, vehicle assignment |
| Accountant | Payments, ledgers, recovery |
| Driver (Phase 3) | Trip status, delivery proof |

## Core Business Flow

```
Production → Stock → Customer Order → Dispatch Planning → Delivery → Payment → Balance
```

## MVP Parameters (Friend's Requirements)

Every dispatch/sale tracks:

| Field | Urdu Context | System Field |
|-------|--------------|--------------|
| Car | Gaari / Truck | `vehicle_id` |
| Quantity | Eent ki tadaad | `quantity` |
| Location | Site / Jagah | `delivery_location` |
| Date | Dispatch date | `dispatch_date` |
| Rate | Rate per unit | `rate` |
| Receive | Wusool shuda | `received_amount` |
| Remain | Baqi raqam | `remaining_amount` (computed) |

## MVP Modules (Phase 1)

### M0 — Platform & White-Label
- Multi-tenant organizations
- Branding (name, logo, colors)
- Users & roles (owner, manager, accountant, viewer)
- Tenant resolution via slug/header

### M1 — Customers
- Customer CRUD (vendor, contractor, builder, individual)
- Customer ledger: total purchase, received, remaining
- Multiple delivery sites per customer

### M2 — Material Types
- Brick grades (A/B/C), sand, crush, etc.
- Unit of measure (pieces, tons, cubic feet)
- Tenant-configurable product catalog

### M3 — Orders
- Order booking with quantity, rate, expected delivery
- Order fulfillment: ordered vs delivered vs remaining
- Stock reservation on order confirmation

### M4 — Dispatches (Core)
- Dispatch slip: customer, order, vehicle, driver, quantity, location, date, rate
- Status: scheduled → loaded → in_transit → delivered → cancelled
- Auto-update order fulfillment & stock

### M5 — Vehicles
- Truck, loader, tractor, dumper
- Driver assignment
- Basic expense tracking (Phase 2: profitability)

### M6 — Payments
- Cash, bank, cheque, JazzCash, EasyPaisa
- Partial payments against orders/dispatches
- Customer outstanding balance

### M7 — Dashboard
- Today's dispatches & sales
- Outstanding receivables
- Order fulfillment pending
- Current stock summary

## Phase 2 — Intelligence

- Inventory ledger (opening + production − dispatch = available)
- Production batches
- Expense & profit reports
- Aging receivables (0-30, 31-60, 60-90, 90+ days)
- Credit limits per customer

## Phase 3 — Full ERP

- Raw material tracking (coal, clay, diesel)
- Labor & attendance
- GPS vehicle tracking
- Driver mobile app
- WhatsApp dispatch slips & payment reminders
- AI demand forecasting

## White-Label Requirements

Each tenant configures:
- Display name (e.g. "ABC Bricks ERP")
- Logo URL
- Primary / accent colors
- Custom domain or slug (`abc-bricks.tameer360.pk`)
- Optional: hide "Powered by Tameer360"

## Non-Functional Requirements

- **Locale:** PKR currency, Urdu/English UI labels (Phase 2)
- **Timezone:** Asia/Karachi
- **Multi-tenant isolation:** Row-level `tenant_id` on all business tables
- **Audit:** `created_at`, `updated_at`, `created_by` on mutable records

## Success Metrics (MVP)

Owner can answer in < 30 seconds:
1. Kitni eent gayi? (dispatched today/this month)
2. Kis customer ne paise dene hain? (outstanding by customer)
3. Kon sa truck kitna kaam kar raha hai? (vehicle dispatch count)
4. Stock kitna bacha hai? (available inventory)
5. Order kitna deliver ho gaya? (fulfillment %)
