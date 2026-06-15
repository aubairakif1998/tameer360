import { apiFetch, apiFetchPaginated } from './client';
import type { CreateVehicleInput, Vehicle } from './types';

export const vehiclesApi = {
  list: (params?: { search?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiFetchPaginated<Vehicle>(`/vehicles${q ? `?${q}` : ''}`);
  },

  create: (input: CreateVehicleInput) =>
    apiFetch<Vehicle>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
};
