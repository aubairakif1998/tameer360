# Module M6: Payments

## Overview

Record money received from customers — cash, bank, cheque, JazzCash, EasyPaisa. Completes **Receive** and **Remaining (Baqi)** tracking.

## User Stories

1. **As accountant**, I can record a payment against a customer (and optionally an order).
2. **As owner**, I see customer ledger: total purchase, received, remaining balance.
3. **As owner**, I see who still owes money (outstanding receivables).

## Business Rules

- Receipt number auto-generated: `RCP-0001`
- `customer.remaining = totalPurchase - totalReceived`
- Payments sum into customer ledger; optional `orderId` updates order `receivedAmount`
- Payment methods: cash, bank, cheque, jazzcash, easypaisa
