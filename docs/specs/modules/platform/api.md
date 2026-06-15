# Platform Module — API Specification

## GET /health

Public health check.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "tameer360-api",
    "timestamp": "2026-06-08T10:00:00.000Z"
  }
}
```

---

## GET /platform/tenants/:slug/branding

Public. Returns white-label config for frontend theming.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "slug": "demo-bhatta",
    "displayName": "Demo Bhatta ERP",
    "businessType": "brick_kiln",
    "logoUrl": null,
    "primaryColor": "#b45309",
    "accentColor": "#fbbf24",
    "showPoweredBy": true
  }
}
```

**Response 404:** Tenant not found

---

## POST /platform/tenants

Create a new tenant. (Admin only in production; open in dev)

**Request:**
```json
{
  "slug": "al-hafeez-bricks",
  "displayName": "Al-Hafeez Bricks ERP",
  "businessType": "brick_kiln",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#1e40af",
  "accentColor": "#f59e0b",
  "showPoweredBy": true
}
```

**Response 201:** Full tenant object

**Response 409:** Slug already exists

---

## GET /platform/tenants/:slug

Get full tenant details.

**Response 200:** Full tenant object including `id`, `isActive`, timestamps
