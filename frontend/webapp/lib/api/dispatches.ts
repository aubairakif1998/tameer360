import { apiFetch, apiFetchPaginated } from './client';
import type {
  CreateDispatchInput,
  DispatchDetail,
  DispatchListItem,
  ListDispatchesParams,
  UpdateDispatchInput,
} from './types';

function buildQuery(params?: ListDispatchesParams) {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.search) search.set('search', params.search);
  if (params.customerId) search.set('customerId', params.customerId);
  if (params.orderId) search.set('orderId', params.orderId);
  if (params.status) search.set('status', params.status);
  if (params.paymentStatus) search.set('paymentStatus', params.paymentStatus);
  if (params.payableOnly) search.set('payableOnly', 'true');
  if (params.dateFrom) search.set('dateFrom', params.dateFrom);
  if (params.dateTo) search.set('dateTo', params.dateTo);
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const dispatchesApi = {
  list: (params?: ListDispatchesParams) =>
    apiFetchPaginated<DispatchListItem>(`/dispatches${buildQuery(params)}`),

  get: (id: string) => apiFetch<DispatchDetail>(`/dispatches/${id}`),

  create: (input: CreateDispatchInput) =>
    apiFetch<DispatchDetail>('/dispatches', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateDispatchInput) =>
    apiFetch<DispatchDetail>(`/dispatches/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
