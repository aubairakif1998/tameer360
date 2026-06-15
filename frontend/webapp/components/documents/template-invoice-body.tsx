'use client';

import type { DocumentTemplatesConfig } from '@/lib/document-templates';
import type { TenantBranding } from '@/lib/api/types';
import { formatPkr, formatQty } from '@/lib/format';
import { useTranslation } from '@/components/providers/locale-provider';
import { formatDispatchDatetime } from '@/lib/dispatch-schedule';

export type InvoiceRenderData = {
  dispatchNumber: string;
  dispatchDate: string;
  customerName: string;
  customerPhone?: string | null;
  orderNumber: string;
  vehicleNumber?: string;
  materialName: string;
  materialCode?: string;
  quantity: string;
  rate: string;
  amount: string;
  deliveryLocation: string;
  pickupLocation?: string | null;
  dropoffLocation?: string | null;
  journeyKm?: string | null;
  expectedDeliveryAt?: string;
};

type Props = {
  data: InvoiceRenderData;
  template: DocumentTemplatesConfig['invoice'];
  branding: TenantBranding | null;
  companyFallback: string;
};

export function TemplateInvoiceBody({
  data,
  template,
  branding,
  companyFallback,
}: Props) {
  const { t } = useTranslation();
  const company = branding?.displayName ?? companyFallback;
  const fields = template.fields;

  return (
    <article className="space-y-8 text-sm">
      <header className="border-b pb-6">
        {template.showLogo && branding?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={branding.logoUrl}
            alt={company}
            className="mb-4 h-12 w-auto object-contain"
          />
        ) : null}
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {template.title}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{company}</h1>
        <p className="mt-4 text-lg font-semibold">{data.dispatchNumber}</p>
        {fields.dispatchDate ? (
          <p className="text-muted-foreground">
            {t('common.date')}: {data.dispatchDate}
          </p>
        ) : null}
      </header>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {t('common.customer')}
          </p>
          <p className="mt-1 font-medium">{data.customerName}</p>
          {fields.customerPhone && data.customerPhone ? (
            <p className="text-muted-foreground">{data.customerPhone}</p>
          ) : null}
        </div>
        {fields.orderNumber ? (
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t('common.order')}
            </p>
            <p className="mt-1 font-medium">{data.orderNumber}</p>
          </div>
        ) : null}
        {fields.vehicle && data.vehicleNumber ? (
          <div>
            <p className="text-xs font-medium uppercase text-muted-foreground">
              {t('dashboard.car')}
            </p>
            <p className="mt-1 font-medium">{data.vehicleNumber}</p>
          </div>
        ) : null}
      </section>

      {fields.lineItems ? (
        <section className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left">
                <th className="px-4 py-2 font-medium">{t('common.material')}</th>
                <th className="px-4 py-2 text-right font-medium">{t('common.qty')}</th>
                <th className="px-4 py-2 text-right font-medium">{t('payments.rate')}</th>
                <th className="px-4 py-2 text-right font-medium">{t('common.amount')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-3">
                  <p className="font-medium">{data.materialName}</p>
                  {fields.materialCode && data.materialCode ? (
                    <p className="text-xs text-muted-foreground">{data.materialCode}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatQty(data.quantity)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatPkr(data.rate)}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">
                  {formatPkr(data.amount)}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={3} className="px-4 py-3 text-right font-medium">
                  {t('common.total')}
                </td>
                <td className="px-4 py-3 text-right font-mono text-base font-bold">
                  {formatPkr(data.amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>
      ) : null}

      <section className="grid gap-2 text-sm">
        {fields.dropoffLocation ? (
          <p>
            <span className="text-muted-foreground">{t('dispatches.location')}: </span>
            {data.dropoffLocation ?? data.deliveryLocation}
          </p>
        ) : null}
        {fields.pickupLocation && data.pickupLocation ? (
          <p>
            <span className="text-muted-foreground">{t('dispatches.pickupLocation')}: </span>
            {data.pickupLocation}
          </p>
        ) : null}
        {fields.journeyKm && data.journeyKm ? (
          <p>
            <span className="text-muted-foreground">{t('dispatches.journeyKm')}: </span>
            {data.journeyKm} km
          </p>
        ) : null}
        {fields.expectedDelivery && data.expectedDeliveryAt ? (
          <p>
            <span className="text-muted-foreground">
              {t('dispatches.expectedDeliveryAt')}:{' '}
            </span>
            {formatDispatchDatetime(data.expectedDeliveryAt)}
          </p>
        ) : null}
      </section>

      {template.footerText ? (
        <footer className="border-t pt-4 text-xs text-muted-foreground">
          {template.footerText}
        </footer>
      ) : null}
    </article>
  );
}
