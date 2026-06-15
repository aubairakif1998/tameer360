# Tameer360 — Simple Testing Guide

A step-by-step guide for anyone (no coding background needed) to run the app and check that everything works.

---

## What you are testing

**Tameer360** is software for a brick kiln (Bhatta) owner to track:

| Daily question (Urdu) | Where to check |
|----------------------|----------------|
| Kitni eent gayi? (How many bricks dispatched?) | Dashboard, Dispatches |
| Kis customer ne paise dene hain? (Who owes money?) | Dashboard, Payments |
| Kon sa truck kitna kaam kar raha hai? (Which truck worked?) | Dashboard, Vehicles, Dispatches |
| Stock kitna bacha hai? (How much stock left?) | Dashboard, Inventory |
| Monthly profit kitna hua? (Monthly profit?) | Reports |

---

## How the app is wired (simple picture)

```
Your browser  →  Website (port 3000)  →  Backend API (port 4000)  →  Database (Supabase)
   http://localhost:3000                    http://localhost:4000
```

- You only open the **website** in Chrome/Safari: `http://localhost:3000`
- The website talks to the backend automatically (you do not open port 4000 in the browser)
- Demo business name: **Demo Bhatta ERP** (tenant: `demo-bhatta`)

---

## One-time setup (do this once)

### Step 1 — Database

You need a Supabase PostgreSQL connection string in `backend/.env`:

```env
DATABASE_URL=postgresql://...your-supabase-url...
DEFAULT_TENANT_SLUG=demo-bhatta
```

### Step 2 — Backend packages & data

Open Terminal, run:

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
```

You should see: `Seed complete: demo-bhatta + customers + materials + ...`

### Step 3 — Frontend config

```bash
cd webapp
cp .env.example .env.local
npm install
```

The file `webapp/.env.local` should contain:

```env
BACKEND_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_DEFAULT_TENANT_SLUG=demo-bhatta
```

---

## Every time you want to use the app

You need **two terminals** running at the same time.

### Terminal 1 — Backend (API)

```bash
cd backend
npm run start:dev
```

Wait until you see:

```
Tameer360 API running on http://localhost:4000/api/v1
```

### Terminal 2 — Website

```bash
cd webapp
npm run dev
```

Wait until you see:

```
Local: http://localhost:3000
Environments: .env.local
```

> **Important:** If you change `.env.local`, stop the website (Ctrl+C) and run `npm run dev` again.

### Open the app

1. Go to **http://localhost:3000**
2. Click **Open Dashboard**
3. You should see **Demo Bhatta ERP** in the sidebar

---

## Quick health check (30 seconds)

If these work, backend and frontend are linked correctly:

| Check | How |
|-------|-----|
| Website loads | Open http://localhost:3000 — no error page |
| Dashboard loads numbers | Go to Dashboard — KPI cards show amounts (not “Failed to load”) |
| Sidebar works | Click Customers, Orders, Inventory — each page opens |

**Optional technical check** (paste in Terminal):

```bash
curl -s http://localhost:3000/api/v1/health
```

Expected: `"success":true` and `"service":"tameer360-api"`

---

## Demo data already loaded

After `npm run db:seed`, you have sample data for a brick kiln:

| Item | Demo value |
|------|------------|
| Business | Demo Bhatta ERP |
| Customers | Ali Builders, Khan Contractor, Pindi Developers |
| Materials | A/B/C Grade bricks, Broken brick |
| Vehicles | LEA-1234 (truck), RIS-5678 (loader) |
| Order | ORD-0001 — Ali Builders, 100,000 bricks @ Rs. 18 |
| Dispatches | 3 trips, 55,000 bricks delivered |
| Payments | Rs. 800,000 received from Ali Builders |
| Outstanding | Ali Builders owes ~Rs. 1,000,000 (baqi) |
| Stock | ~275,500 A-Grade bricks in yard |
| Production | 3 daily production batches recorded |

---

## Walkthrough — test each screen

Do these in order. Tick each box when it looks right.

### 1. CEO Dashboard (`/dashboard`)

**What to look for:**

- [ ] Title shows **Demo Bhatta ERP**
- [ ] **Stock Available** shows a large number (~275,500)
- [ ] **Total Baqi (Outstanding)** shows money owed (~Rs. 1,000,000)
- [ ] **Kis Customer Ne Paise Dene Hain?** lists Ali Builders at the top
- [ ] **7-Day Trend** chart shows bars (may be empty for today if no dispatch today)
- [ ] Click **Refresh** — numbers reload without error

---

### 2. Customers (`/dashboard/customers`)

- [ ] See 3 customers: Ali Builders, Khan Contractor, Pindi Developers
- [ ] Ali Builders shows **remaining balance** (baqi) in red/amber
- [ ] Click **Ali Builders** → detail page opens with sites (DHA Phase 2, Bahria Town)

---

### 3. Materials (`/dashboard/materials`)

- [ ] See 4 brick types: A Grade, B Grade, C Grade, Broken
- [ ] Each has a code (A-GRADE, etc.) and default rate

---

### 4. Orders (`/dashboard/orders`)

- [ ] See order **ORD-0001** for Ali Builders
- [ ] Status: **Partial** (not fully delivered)
- [ ] Ordered: 100,000 — Delivered: 55,000
- [ ] Click the order → see fulfillment progress

---

### 5. Dispatches (`/dashboard/dispatches`)

- [ ] See 3 dispatches: DSP-0001, DSP-0002, DSP-0003
- [ ] Truck **LEA-1234**, customer Ali Builders
- [ ] Total quantity across 3 = 55,000 bricks

**Try adding one (optional):**

1. Click **New Dispatch**
2. Pick customer, truck, material, quantity (e.g. 5,000), rate 18, today’s date
3. Save → new dispatch appears in list
4. Go back to **Inventory** — stock should drop by 5,000

---

### 6. Vehicles (`/dashboard/vehicles`)

- [ ] See **LEA-1234** and **RIS-5678**
- [ ] LEA-1234 has driver Ahmed Khan

---

### 7. Payments (`/dashboard/payments`)

- [ ] **Outstanding Receivables** section shows customers who owe money
- [ ] Ali Builders at top with ~Rs. 1,000,000 baqi
- [ ] Payment history shows RCP-0001 (Rs. 500,000) and RCP-0002 (Rs. 300,000)

**Try recording a payment (optional):**

1. Click **Record Payment**
2. Customer: Ali Builders, Amount: 100000, Date: today, Method: Cash
3. Save → outstanding should decrease by Rs. 100,000

---

### 8. Inventory (`/dashboard/inventory`)

- [ ] **Current Stock** table shows stock per material type
- [ ] A Grade Brick has the highest stock (~275,500)
- [ ] **Stock Ledger** shows opening, production, and dispatch entries

---

### 9. Production (`/dashboard/production`)

- [ ] See 3 batches: PROD-0001, PROD-0002, PROD-0003
- [ ] Each shows produced qty, damaged qty, and **net** added to stock

**Try recording production (optional):**

1. Click **Record Production**
2. Material: A Grade Brick, Produced: 10000, Damaged: 200, Date: today
3. Save → new batch appears; Inventory stock goes up by 9,800

---

### 10. Reports (`/dashboard/reports`)

**Tab: Aging Receivables**

- [ ] Buckets show 0–30, 31–60, 61–90, 90+ days
- [ ] Ali Builders listed with outstanding split by age

**Tab: Profit Report**

- [ ] **Revenue** from dispatches (Rs. amount)
- [ ] **Collections** from payments
- [ ] **Gross Profit** and **Net Profit** shown
- [ ] **By Customer** and **By Vehicle** tables have data

---

## End-to-end story (5-minute real-world test)

Pretend you are the Bhatta owner checking today:

1. **Morning** — Open Dashboard → check Stock Available
2. **Production** — Record today’s kiln output (Production page)
3. **Dispatch** — Record a truck leaving with bricks (Dispatches → New)
4. **Payment** — Customer paid cash → record in Payments
5. **Evening** — Dashboard should show updated dispatch, collections, and stock
6. **Month end** — Reports → Profit tab for monthly munafa

---

## Common problems & fixes

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Dashboard says “Failed to load” | Backend not running | Start Terminal 1: `cd backend && npm run start:dev` |
| Blank page or old data | Website not connected to API | Restart Terminal 2: stop (Ctrl+C), then `npm run dev` |
| `Tenant not found` | Seed not run | `cd backend && npm run db:seed` |
| Database connection error | Wrong `DATABASE_URL` | Fix `backend/.env`, then `npm run db:migrate` |
| Port 3000 busy | Old website still running | Run `lsof -i :3000`, kill old process, restart `npm run dev` |
| Port 4000 busy | Old backend still running | Kill old node process on 4000, restart `npm run start:dev` |
| Inventory shows 0 | Seed/migration not applied | `npm run db:migrate && npm run db:seed` |

---

## What “working correctly” means

You can consider the system **fully linked and working** when:

1. Dashboard loads live numbers (not errors)
2. Customers, Orders, Dispatches, Payments show demo seed data
3. Inventory shows ~275,500 total stock
4. Production shows 3 batches
5. Reports show aging and profit data
6. Creating a new dispatch **reduces** inventory stock
7. Creating a new production batch **increases** inventory stock
8. Recording a payment **reduces** customer outstanding (baqi)

---

## Need help?

- Full developer setup: [README.md](../README.md)
- Module specs: [docs/README.md](./README.md)
- API runs at `http://localhost:4000/api/v1` (for developers only)
