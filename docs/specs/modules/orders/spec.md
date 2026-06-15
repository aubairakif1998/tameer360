# Module M3: Orders

## Overview

Customer order booking with fulfillment tracking — ordered vs delivered vs remaining bricks.

## User Stories

1. **As sales staff**, I can book an order: customer, material, quantity, rate, delivery date.
2. **As owner**, I can see order fulfillment % across all open orders.
3. **As owner**, customer ledger reflects total purchase from confirmed orders.

## Key Fields

- Order No, Customer, Material, Ordered Qty, Rate, Total Amount
- Delivered Qty (updated by dispatches in M4)
- Remaining Qty = Ordered - Delivered
- Received Amount (updated by payments in M6)
- Status: draft → confirmed → partial → fulfilled

## Business Rules

- `totalAmount = orderedQty × rate`
- Order number auto-generated per tenant: `ORD-0001`
- Cancelled orders excluded from customer ledger
- Default status on create: `confirmed`
