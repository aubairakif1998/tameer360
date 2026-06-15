export type InvoiceTemplateField =
  | 'customerPhone'
  | 'orderNumber'
  | 'materialCode'
  | 'lineItems'
  | 'pickupLocation'
  | 'dropoffLocation'
  | 'journeyKm'
  | 'expectedDelivery'
  | 'vehicle'
  | 'dispatchDate';

export type ReceiptTemplateField =
  | 'paymentMethod'
  | 'referenceNumber'
  | 'orderNumber'
  | 'dispatchNumber'
  | 'paymentNotes';

export interface InvoiceDocumentTemplate {
  title: string;
  footerText: string;
  showLogo: boolean;
  fields: Record<InvoiceTemplateField, boolean>;
}

export interface ReceiptDocumentTemplate {
  title: string;
  footerText: string;
  showLogo: boolean;
  fields: Record<ReceiptTemplateField, boolean>;
}

export interface DocumentTemplatesConfig {
  invoice: InvoiceDocumentTemplate;
  receipt: ReceiptDocumentTemplate;
}

export const DEFAULT_INVOICE_TEMPLATE: InvoiceDocumentTemplate = {
  title: 'Tax Invoice',
  footerText: 'Thank you for your business.',
  showLogo: true,
  fields: {
    customerPhone: true,
    orderNumber: true,
    materialCode: true,
    lineItems: true,
    pickupLocation: true,
    dropoffLocation: true,
    journeyKm: true,
    expectedDelivery: true,
    vehicle: false,
    dispatchDate: true,
  },
};

export const DEFAULT_RECEIPT_TEMPLATE: ReceiptDocumentTemplate = {
  title: 'Payment Receipt',
  footerText: 'This is a computer-generated receipt.',
  showLogo: true,
  fields: {
    paymentMethod: true,
    referenceNumber: true,
    orderNumber: true,
    dispatchNumber: true,
    paymentNotes: true,
  },
};

export const DEFAULT_DOCUMENT_TEMPLATES: DocumentTemplatesConfig = {
  invoice: DEFAULT_INVOICE_TEMPLATE,
  receipt: DEFAULT_RECEIPT_TEMPLATE,
};

export function mergeDocumentTemplates(
  stored: unknown,
): DocumentTemplatesConfig {
  if (!stored || typeof stored !== 'object') {
    return DEFAULT_DOCUMENT_TEMPLATES;
  }

  const input = stored as Partial<DocumentTemplatesConfig>;

  return {
    invoice: {
      ...DEFAULT_INVOICE_TEMPLATE,
      ...input.invoice,
      fields: {
        ...DEFAULT_INVOICE_TEMPLATE.fields,
        ...(input.invoice?.fields ?? {}),
      },
    },
    receipt: {
      ...DEFAULT_RECEIPT_TEMPLATE,
      ...input.receipt,
      fields: {
        ...DEFAULT_RECEIPT_TEMPLATE.fields,
        ...(input.receipt?.fields ?? {}),
      },
    },
  };
}
