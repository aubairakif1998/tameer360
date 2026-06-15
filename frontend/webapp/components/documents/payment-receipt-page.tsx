'use client';

import { useEffect, useState } from 'react';
import { paymentsApi } from '@/lib/api/payments';
import type { PaymentListItem } from '@/lib/api/types';
import { PaymentReceiptDocument } from '@/components/documents/payment-receipt-document';
import { PrintDocumentShell } from '@/components/documents/print-document-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/components/providers/locale-provider';

export function PaymentReceiptPage({ id }: { id: string }) {
  const { t } = useTranslation();
  const [payment, setPayment] = useState<PaymentListItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    paymentsApi
      .get(id)
      .then(setPayment)
      .catch(() => setError(t('payments.loadFailed')));
  }, [id, t]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-sm text-muted-foreground">
        {error}
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <PrintDocumentShell
      title={t('documents.receiptTitle', { number: payment.receiptNumber })}
    >
      <PaymentReceiptDocument payment={payment} />
    </PrintDocumentShell>
  );
}
