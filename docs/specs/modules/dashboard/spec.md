# Module M7: Dashboard (CEO View)

## Overview

Single-pane CEO dashboard answering the five daily questions in under 30 seconds.

## KPIs

| KPI | Source | Urdu |
|-----|--------|------|
| Today's dispatches | dispatches (today) | Aaj kitni eent gayi? |
| Today's collections | payments (today) | Aaj kitna wusool hua? |
| Outstanding receivables | payments vs orders | Kis customer ne paise dene hain? |
| Pending delivery | open orders remaining qty | Kitni abhi deliver karni hai? |
| Monthly sales | dispatches (month) | Monthly revenue |
| Active trucks today | distinct vehicles dispatched | Kon sa truck kaam kar raha hai? |

## Endpoint

`GET /api/v1/dashboard/kpis` — returns all KPIs + recent activity + 7-day trend.
