import { apiFetch } from './client';
import type { AgingReceivablesReport, ProfitReport } from './types';

export const reportsApi = {
  agingReceivables: (asOfDate?: string) => {
    const qs = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return apiFetch<AgingReceivablesReport>(`/reports/aging-receivables${qs}`);
  },

  profit: (params?: { periodStart?: string; periodEnd?: string }) => {
    const qs = new URLSearchParams();
    if (params?.periodStart) qs.set('periodStart', params.periodStart);
    if (params?.periodEnd) qs.set('periodEnd', params.periodEnd);
    const q = qs.toString();
    return apiFetch<ProfitReport>(`/reports/profit${q ? `?${q}` : ''}`);
  },
};
