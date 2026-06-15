'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { TenantBranding } from '@/lib/api/types';
import { api } from '@/lib/api/client';
import { settingsApi } from '@/lib/api/settings';
import { useAuth } from '@/components/providers/auth-provider';
import { applyTenantBranding } from '@/lib/tenant/branding';
import {
  DEFAULT_DOCUMENT_TEMPLATES,
  mergeDocumentTemplates,
  type DocumentTemplatesConfig,
} from '@/lib/document-templates';

export interface TenantContextValue {
  branding: TenantBranding | null;
  documentTemplates: DocumentTemplatesConfig;
  isTenantLoading: boolean;
  slug: string;
  refreshDocumentTemplates: () => Promise<void>;
}

const TenantContext = createContext<TenantContextValue>({
  branding: null,
  documentTemplates: DEFAULT_DOCUMENT_TEMPLATES,
  isTenantLoading: true,
  slug: '',
  refreshDocumentTemplates: async () => {},
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const slug = user?.tenantSlug ?? null;
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [documentTemplates, setDocumentTemplates] =
    useState<DocumentTemplatesConfig>(DEFAULT_DOCUMENT_TEMPLATES);
  const [isTenantLoading, setIsTenantLoading] = useState(true);

  const refreshDocumentTemplates = useCallback(async () => {
    if (!slug) {
      setDocumentTemplates(DEFAULT_DOCUMENT_TEMPLATES);
      return;
    }
    try {
      const data = await settingsApi.getDocumentTemplates();
      setDocumentTemplates(mergeDocumentTemplates(data));
    } catch {
      setDocumentTemplates(DEFAULT_DOCUMENT_TEMPLATES);
    }
  }, [slug]);

  useEffect(() => {
    if (authLoading) return;

    if (!slug) {
      queueMicrotask(() => {
        setBranding(null);
        setDocumentTemplates(DEFAULT_DOCUMENT_TEMPLATES);
        setIsTenantLoading(false);
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      setIsTenantLoading(true);
    });

    Promise.all([api.getTenantBranding(slug), settingsApi.getDocumentTemplates()])
      .then(([brandingData, templatesData]) => {
        if (cancelled) return;
        setBranding(brandingData);
        applyTenantBranding(brandingData);
        setDocumentTemplates(mergeDocumentTemplates(templatesData));
      })
      .catch(() => {
        if (!cancelled) {
          setBranding(null);
          setDocumentTemplates(DEFAULT_DOCUMENT_TEMPLATES);
        }
      })
      .finally(() => {
        if (!cancelled) setIsTenantLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, authLoading]);

  return (
    <TenantContext.Provider
      value={{
        branding,
        documentTemplates,
        isTenantLoading,
        slug: slug ?? '',
        refreshDocumentTemplates,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function StaticTenantProvider({
  value,
  children,
}: {
  value: TenantContextValue;
  children: ReactNode;
}) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  return useContext(TenantContext);
}
