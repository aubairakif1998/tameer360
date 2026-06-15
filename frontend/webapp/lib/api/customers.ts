import { apiFetch, apiFetchPaginated } from './client';
import type {
  CreateCustomerInput,
  CustomerDetail,
  CustomerListItem,
  ListCustomersParams,
  UpdateCustomerInput,
} from './types';

function buildQuery(params?: ListCustomersParams) {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.search) search.set('search', params.search);
  if (params.type) search.set('type', params.type);
  if (params.isActive !== undefined)
    search.set('is_active', String(params.isActive));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const customersApi = {
  list: (params?: ListCustomersParams) =>
    apiFetchPaginated<CustomerListItem>(`/customers${buildQuery(params)}`),

  get: (id: string) => apiFetch<CustomerDetail>(`/customers/${id}`),

  create: (input: CreateCustomerInput) =>
    apiFetch<CustomerDetail>('/customers', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateCustomerInput) =>
    apiFetch<CustomerDetail>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/customers/${id}`, { method: 'DELETE' }),
};

export type { CustomerListItem, CustomerDetail };
