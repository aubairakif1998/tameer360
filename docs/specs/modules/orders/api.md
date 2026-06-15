# Orders Module — API Specification

Base: `/api/v1/orders` — requires `X-Tenant-Slug`.

## GET /orders

**Query:** `?page=1&limit=20&search=&customer_id=&status=confirmed`

Returns orders with embedded `customerName`, `materialName`, `remainingQty`, `fulfillmentPercent`.

## GET /orders/:id

## POST /orders

```json
{
  "customerId": "uuid",
  "customerSiteId": "uuid",
  "materialTypeId": "uuid",
  "orderedQty": 100000,
  "rate": 18,
  "expectedDeliveryDate": "2026-07-01",
  "notes": "Advance booking"
}
```

## PATCH /orders/:id

Update notes, expected date, status (cancel).

## GET /orders/fulfillment-summary

Dashboard view: open orders with fulfillment stats.
