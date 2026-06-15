import { apiFetch, apiFetchPaginated } from './client';
import type {
  CreatePaymentInput,
  OutstandingItem,
  PaymentListItem,
} from './types';

export const paymentsApi = {
  list: (params?: {
    search?: string;
    customerId?: string;
    orderId?: string;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.customerId) qs.set('customerId', params.customerId);
    if (params?.orderId) qs.set('orderId', params.orderId);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiFetchPaginated<PaymentListItem>(`/payments${q ? `?${q}` : ''}`);
  },

  create: (input: CreatePaymentInput) =>
    apiFetch<PaymentListItem>('/payments', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  outstanding: () => apiFetch<OutstandingItem[]>('/payments/outstanding'),

  get: (id: string) => apiFetch<PaymentListItem>(`/payments/${id}`),
};
