# Tameer360 — API Conventions

## Base URL

- Backend: `http://localhost:4000/api/v1`
- Frontend BFF: `http://localhost:3000/api/v1`

## Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes (POST/PATCH) | `application/json` |
| `X-Tenant-Slug` | Yes (business APIs) | Tenant identifier, e.g. `demo-bhatta` |
| `Authorization` | Phase 1.5+ | `Bearer <token>` |

## Response Envelope

### Success

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "phone", "message": "Phone is required" }
    ]
  }
}
```

## HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 204 | Deleted |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate slug, etc.) |
| 500 | Internal error |

## Pagination

Query params: `?page=1&limit=20&sort=created_at&order=desc`

## Filtering

Query params: `?status=confirmed&customer_id=uuid&date_from=2026-06-01`

## ID Format

UUID v4 for all entity IDs.

## Date Format

ISO 8601: `2026-06-08` for dates, `2026-06-08T10:30:00Z` for timestamps.

## Money Format

Numbers in PKR without currency symbol in API. Frontend formats as `Rs. 1,800,000`.

## Quantity Format

Numbers with up to 3 decimal places. Bricks typically whole numbers.
