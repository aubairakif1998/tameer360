# Material Types — API Specification

Base: `/api/v1/material-types` — requires `X-Tenant-Slug`.

## GET /material-types

**Query:** `?page=1&limit=20&search=grade&is_active=true`

## GET /material-types/:id

## POST /material-types

```json
{
  "name": "A Grade Brick",
  "code": "A-GRADE",
  "unit": "piece",
  "defaultRate": 18
}
```

## PATCH /material-types/:id

## DELETE /material-types/:id

Soft-delete (isActive = false).
