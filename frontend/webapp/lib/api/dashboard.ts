import { apiFetch } from './client';
import type { DashboardKpis } from './types';

export const dashboardApi = {
  getKpis: (date?: string) =>
    apiFetch<DashboardKpis>(
      `/dashboard/kpis${date ? `?date=${date}` : ''}`,
    ),
};
