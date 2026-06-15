import { apiFetch } from './client';
import type { DocumentTemplatesConfig } from '@/lib/document-templates';

export const settingsApi = {
  getDocumentTemplates: () =>
    apiFetch<DocumentTemplatesConfig>('/settings/document-templates'),

  updateDocumentTemplates: (input: Partial<DocumentTemplatesConfig>) =>
    apiFetch<DocumentTemplatesConfig>('/settings/document-templates', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
};
