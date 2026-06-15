'use client';

import { useEffect, useState } from 'react';
import { dispatchesApi } from '@/lib/api/dispatches';
import type { DispatchDetail } from '@/lib/api/types';
import { DispatchInvoiceDocument } from '@/components/documents/dispatch-invoice-document';
import { PrintDocumentShell } from '@/components/documents/print-document-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/components/providers/locale-provider';

export function DispatchInvoicePage({ id }: { id: string }) {
  const { t } = useTranslation();
  const [dispatch, setDispatch] = useState<DispatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatchesApi
      .get(id)
      .then((data) => {
        if (data.status !== 'delivered') {
          setError(t('documents.invoiceNotDelivered'));
          return;
        }
        setDispatch(data);
      })
      .catch(() => setError(t('dispatches.loadFailed')));
  }, [id, t]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!dispatch) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <PrintDocumentShell
      title={t('documents.invoiceTitle', { number: dispatch.dispatchNumber })}
    >
      <DispatchInvoiceDocument dispatch={dispatch} />
    </PrintDocumentShell>
  );
}
