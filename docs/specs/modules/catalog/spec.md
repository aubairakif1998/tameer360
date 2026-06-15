# Module M2: Material Types (Catalog)

## Overview

Tenant-configurable product catalog — brick grades, sand, crush, etc. Used by orders, dispatches, and inventory.

## User Stories

1. **As owner**, I can define material types (A Grade Brick, B Grade, etc.) with unit and default rate.
2. **As sales staff**, I can pick a material type when creating an order or dispatch.
3. **As owner**, I can deactivate a material type without deleting history.

## Entities

### MaterialType
- name, code (short identifier)
- unit: piece | ton | cft | bag
- defaultRate (PKR per unit, optional)
- isActive

## Business Rules

- `code` unique per tenant (e.g. `A-GRADE`, `B-GRADE`)
- Bricks use unit `piece`; sand/crush may use `ton` or `cft`
- Soft-delete via isActive = false

## Seed (Brick Kiln)

| Name | Code | Unit | Default Rate |
|------|------|------|--------------|
| A Grade Brick | A-GRADE | piece | 18 |
| B Grade Brick | B-GRADE | piece | 15 |
| C Grade Brick | C-GRADE | piece | 12 |
| Broken Brick | BROKEN | piece | 8 |
