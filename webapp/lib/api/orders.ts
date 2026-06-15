import { apiFetch, apiFetchPaginated } from './client';
import type {
  CreateOrderInput,
  FulfillmentSummaryItem,
  ListOrdersParams,
  OrderDetail,
  OrderListItem,
} from './types';

function buildQuery(params?: ListOrdersParams) {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.search) search.set('search', params.search);
  if (params.customerId) search.set('customerId', params.customerId);
  if (params.status) search.set('status', params.status);
  if (params.dispatchedOnly) search.set('dispatchedOnly', 'true');
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const ordersApi = {
  list: (params?: ListOrdersParams) =>
    apiFetchPaginated<OrderListItem>(`/orders${buildQuery(params)}`),

  get: (id: string) => apiFetch<OrderDetail>(`/orders/${id}`),

  create: (input: CreateOrderInput) =>
    apiFetch<OrderDetail>('/orders', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  fulfillmentSummary: () =>
    apiFetch<FulfillmentSummaryItem[]>('/orders/fulfillment-summary'),
};
