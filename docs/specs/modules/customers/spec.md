# Module M1: Customers

## Overview

Manage buyers/vendors (contractors, builders, individuals) with delivery sites and a running ledger of purchase vs payment.

## User Stories

1. **As dispatch manager**, I can add a customer with name, phone, type, and address.
2. **As owner**, I can see customer ledger: total purchase, received, remaining balance.
3. **As sales staff**, I can add multiple delivery sites per customer (Site A, Site B).
4. **As owner**, I can set a credit limit per customer for future alerts.

## Entities

### Customer
- name, phone, address, type (vendor/contractor/builder/individual)
- creditLimit (optional)
- isActive

### CustomerSite
- customerId, name, address, isDefault

### CustomerLedger (computed)
- totalPurchase, totalReceived, remainingBalance, lastOrderDate

## Business Rules

- Phone optional but recommended
- At least one site can be marked default
- Soft-delete via isActive = false (no hard delete if orders exist — future)
- All records scoped by tenant_id
