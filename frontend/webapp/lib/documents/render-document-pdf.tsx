'use client';

import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { type ReactNode } from 'react';
import { StaticLocaleProvider } from '@/components/providers/locale-provider';
import {
  StaticTenantProvider,
  type TenantContextValue,
} from '@/components/providers/tenant-provider';
import { DispatchInvoiceDocument } from '@/components/documents/dispatch-invoice-document';
import { PaymentReceiptDocument } from '@/components/documents/payment-receipt-document';
import { downloadElementAsPdf } from '@/lib/documents/download-pdf';
import type { DispatchDetail, PaymentListItem } from '@/lib/api/types';
import type { Locale } from '@/lib/i18n';

type RenderDocumentPdfOptions = {
  filename: string;
  locale: Locale;
  tenant: TenantContextValue;
  children: ReactNode;
};

async function waitForImages(container: HTMLElement) {
  const images = container.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

export async function renderDocumentPdf({
  filename,
  locale,
  tenant,
  children,
}: RenderDocumentPdfOptions) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '672px';
  container.style.background = '#ffffff';
  container.style.padding = '32px';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    flushSync(() => {
      root.render(
        <StaticLocaleProvider locale={locale}>
          <StaticTenantProvider value={tenant}>{children}</StaticTenantProvider>
        </StaticLocaleProvider>,
      );
    });

    await document.fonts.ready;
    await waitForImages(container);

    const target = container.querySelector('article') ?? container;
    await downloadElementAsPdf(target as HTMLElement, filename);
  } finally {
    root.unmount();
    container.remove();
  }
}

type DocumentPdfBaseOptions = {
  filename: string;
  locale: Locale;
  tenant: TenantContextValue;
};

export async function renderInvoicePdf({
  dispatch,
  ...rest
}: DocumentPdfBaseOptions & { dispatch: DispatchDetail }) {
  return renderDocumentPdf({
    ...rest,
    children: <DispatchInvoiceDocument dispatch={dispatch} />,
  });
}

export async function renderReceiptPdf({
  payment,
  ...rest
}: DocumentPdfBaseOptions & { payment: PaymentListItem }) {
  return renderDocumentPdf({
    ...rest,
    children: <PaymentReceiptDocument payment={payment} />,
  });
}
