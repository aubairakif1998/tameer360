# Customers Module — API Specification

Base: `/api/v1/customers` — requires `X-Tenant-Slug` header.

## GET /customers

List customers with optional search and pagination.

**Query:** `?page=1&limit=20&search=ali&type=builder&is_active=true`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ali Builders",
      "phone": "03001234567",
      "address": "Islamabad",
      "type": "builder",
      "creditLimit": "2000000.00",
      "isActive": true,
      "ledger": {
        "totalPurchase": "0.00",
        "totalReceived": "0.00",
        "remainingBalance": "0.00",
        "lastOrderDate": null
      },
      "createdAt": "2026-06-08T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1 }
}
```

## GET /customers/:id

Single customer with sites and ledger.

## POST /customers

**Request:**
```json
{
  "name": "Ali Builders",
  "phone": "03001234567",
  "address": "Islamabad",
  "type": "builder",
  "creditLimit": 2000000,
  "sites": [
    { "name": "Site A - DHA", "address": "DHA Phase 2", "isDefault": true }
  ]
}
```

## PATCH /customers/:id

Partial update of customer fields.

## DELETE /customers/:id

Soft-delete (sets isActive = false).

## POST /customers/:id/sites

Add a delivery site.

## PATCH /customers/:customerId/sites/:siteId

Update a site.

## DELETE /customers/:customerId/sites/:siteId

Remove a site (not allowed if only site — must keep one).
