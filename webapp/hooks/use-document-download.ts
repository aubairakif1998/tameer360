'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from '@/components/providers/locale-provider';
import { useTenant } from '@/components/providers/tenant-provider';
import { dispatchesApi } from '@/lib/api/dispatches';
import { paymentsApi } from '@/lib/api/payments';
import {
  renderInvoicePdf,
  renderReceiptPdf,
} from '@/lib/documents/render-document-pdf';

export function useDocumentDownload() {
  const { locale, t } = useTranslation();
  const tenant = useTenant();
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

  const downloadInvoice = useCallback(
    async (dispatchId: string) => {
      const key = `invoice:${dispatchId}`;
      setDownloadingKey(key);
      try {
        const dispatch = await dispatchesApi.get(dispatchId);
        if (dispatch.status !== 'delivered') {
          toast.error(t('documents.invoiceNotDelivered'));
          return;
        }

        await renderInvoicePdf({
          filename: `${dispatch.dispatchNumber}.pdf`,
          locale,
          tenant: {
            ...tenant,
            isTenantLoading: false,
          },
          dispatch,
        });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t('documents.downloadFailed'),
        );
      } finally {
        setDownloadingKey(null);
      }
    },
    [locale, t, tenant],
  );

  const downloadReceipt = useCallback(
    async (paymentId: string) => {
      const key = `receipt:${paymentId}`;
      setDownloadingKey(key);
      try {
        const payment = await paymentsApi.get(paymentId);

        await renderReceiptPdf({
          filename: `${payment.receiptNumber}.pdf`,
          locale,
          tenant: {
            ...tenant,
            isTenantLoading: false,
          },
          payment,
        });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : t('documents.downloadFailed'),
        );
      } finally {
        setDownloadingKey(null);
      }
    },
    [locale, t, tenant],
  );

  return {
    downloadingKey,
    downloadInvoice,
    downloadReceipt,
    isDownloadingInvoice: (dispatchId: string) =>
      downloadingKey === `invoice:${dispatchId}`,
    isDownloadingReceipt: (paymentId: string) =>
      downloadingKey === `receipt:${paymentId}`,
  };
}
