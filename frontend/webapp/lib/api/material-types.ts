import { apiFetch, apiFetchPaginated } from './client';
import type {
  CreateMaterialTypeInput,
  ListMaterialTypesParams,
  MaterialType,
  UpdateMaterialTypeInput,
} from './types';

function buildQuery(params?: ListMaterialTypesParams) {
  if (!params) return '';
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));
  if (params.search) search.set('search', params.search);
  if (params.category) search.set('category', params.category);
  if (params.isActive !== undefined)
    search.set('isActive', String(params.isActive));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export const materialTypesApi = {
  list: (params?: ListMaterialTypesParams) =>
    apiFetchPaginated<MaterialType>(`/material-types${buildQuery(params)}`),

  get: (id: string) => apiFetch<MaterialType>(`/material-types/${id}`),

  suggestCode: (name: string) =>
    apiFetch<{ code: string }>(
      `/material-types/suggest-code?name=${encodeURIComponent(name.trim())}`,
    ),

  create: (input: CreateMaterialTypeInput) =>
    apiFetch<MaterialType>('/material-types', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateMaterialTypeInput) =>
    apiFetch<MaterialType>(`/material-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  remove: (id: string) =>
    apiFetch<{ deleted: boolean }>(`/material-types/${id}`, {
      method: 'DELETE',
    }),
};
