import { apiFetch } from './client';
import type {
  StockAvailabilityItem,
  StockLedgerItem,
  StockSummaryItem,
} from './types';

export const inventoryApi = {
  summary: () => apiFetch<StockSummaryItem[]>('/inventory/summary'),

  availability: () =>
    apiFetch<StockAvailabilityItem[]>('/inventory/availability'),

  ledger: (params?: { materialTypeId?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.materialTypeId) qs.set('materialTypeId', params.materialTypeId);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiFetch<StockLedgerItem[]>(`/inventory/ledger${q ? `?${q}` : ''}`);
  },
};
