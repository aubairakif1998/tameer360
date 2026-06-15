'use client';

import type { DocumentTemplatesConfig } from '@/lib/document-templates';
import type { PaymentMethod, TenantBranding } from '@/lib/api/types';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { formatPkr } from '@/lib/format';

export type ReceiptRenderData = {
  receiptNumber: string;
  paymentDate: string;
  customerName: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  orderNumber: string;
  dispatchNumber?: string | null;
  amount: string;
  notes?: string | null;
};

type Props = {
  data: ReceiptRenderData;
  template: DocumentTemplatesConfig['receipt'];
  branding: TenantBranding | null;
  companyFallback: string;
};

export function TemplateReceiptBody({
  data,
  template,
  branding,
  companyFallback,
}: Props) {
  const labels = useLabelMaps();
  const { t } = useTranslation();
  const company = branding?.displayName ?? companyFallback;
  const fields = template.fields;

  return (
    <article className="space-y-8 text-sm">
      <header className="border-b pb-6 text-center">
        {template.showLogo && branding?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoUrl}
            alt={company}
            className="mx-auto mb-4 h-12 w-auto object-contain"
          />
        ) : null}
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {template.title}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{company}</h1>
        <p className="mt-4 text-lg font-semibold">{data.receiptNumber}</p>
        <p className="text-muted-foreground">
          {t('payments.paymentDate')}: {data.paymentDate}
        </p>
      </header>

      <section className="space-y-4 rounded-lg border p-4">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{t('common.customer')}</span>
          <span className="font-medium text-right">{data.customerName}</span>
        </div>
        {fields.paymentMethod ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t('payments.method')}</span>
            <span className="font-medium">
              {labels.paymentMethod(data.paymentMethod)}
            </span>
          </div>
        ) : null}
        {fields.referenceNumber && data.referenceNumber ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t('payments.reference')}</span>
            <span className="font-medium">{data.referenceNumber}</span>
          </div>
        ) : null}
        {fields.orderNumber ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t('common.order')}</span>
            <span className="font-medium">{data.orderNumber}</span>
          </div>
        ) : null}
        {fields.dispatchNumber && data.dispatchNumber ? (
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">{t('common.dispatch')}</span>
            <span className="font-medium">{data.dispatchNumber}</span>
          </div>
        ) : null}
        <div className="flex justify-between gap-4 border-t pt-4">
          <span className="font-medium">{t('payments.amountReceivedLabel')}</span>
          <span className="text-xl font-bold text-emerald-700">
            {formatPkr(data.amount)}
          </span>
        </div>
      </section>

      {fields.paymentNotes && data.notes ? (
        <p className="text-muted-foreground">
          <span className="font-medium text-foreground">{t('common.notes')}: </span>
          {data.notes}
        </p>
      ) : null}

      {template.footerText ? (
        <footer className="border-t pt-4 text-center text-xs text-muted-foreground">
          {template.footerText}
        </footer>
      ) : null}
    </article>
  );
}
