import { apiFetch, apiFetchPaginated } from './client';
import type {
  CreateProductionBatchInput,
  ProductionBatchDetail,
  ProductionBatchListItem,
} from './types';

export const productionApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    materialTypeId?: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    if (params?.materialTypeId) qs.set('materialTypeId', params.materialTypeId);
    if (params?.fromDate) qs.set('fromDate', params.fromDate);
    if (params?.toDate) qs.set('toDate', params.toDate);
    const q = qs.toString();
    return apiFetchPaginated<ProductionBatchListItem>(
      `/production${q ? `?${q}` : ''}`,
    );
  },

  get: (id: string) => apiFetch<ProductionBatchDetail>(`/production/${id}`),

  create: (input: CreateProductionBatchInput) =>
    apiFetch<ProductionBatchDetail>('/production', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
