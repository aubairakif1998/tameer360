'use client';

import type { PaymentListItem } from '@/lib/api/types';
import { useTenant } from '@/components/providers/tenant-provider';
import { useTranslation } from '@/components/providers/locale-provider';
import { TemplateReceiptBody } from '@/components/documents/template-receipt-body';

export function PaymentReceiptDocument({ payment }: { payment: PaymentListItem }) {
  const { branding, documentTemplates } = useTenant();
  const { t } = useTranslation();

  return (
    <TemplateReceiptBody
      data={{
        receiptNumber: payment.receiptNumber,
        paymentDate: payment.paymentDate,
        customerName: payment.customerName,
        paymentMethod: payment.paymentMethod,
        referenceNumber: payment.referenceNumber,
        orderNumber: payment.orderNumber,
        dispatchNumber: payment.dispatchNumber,
        amount: payment.amount,
        notes: payment.notes,
      }}
      template={documentTemplates.receipt}
      branding={branding}
      companyFallback={t('dashboard.title')}
    />
  );
}
