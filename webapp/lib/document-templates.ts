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

export const INVOICE_TEMPLATE_FIELDS: InvoiceTemplateField[] = [
  'dispatchDate',
  'orderNumber',
  'customerPhone',
  'vehicle',
  'lineItems',
  'materialCode',
  'pickupLocation',
  'dropoffLocation',
  'journeyKm',
  'expectedDelivery',
];

export const RECEIPT_TEMPLATE_FIELDS: ReceiptTemplateField[] = [
  'paymentMethod',
  'referenceNumber',
  'orderNumber',
  'dispatchNumber',
  'paymentNotes',
];

export function mergeDocumentTemplates(
  stored?: DocumentTemplatesConfig | null,
): DocumentTemplatesConfig {
  if (!stored) return DEFAULT_DOCUMENT_TEMPLATES;

  return {
    invoice: {
      ...DEFAULT_INVOICE_TEMPLATE,
      ...stored.invoice,
      fields: {
        ...DEFAULT_INVOICE_TEMPLATE.fields,
        ...stored.invoice.fields,
      },
    },
    receipt: {
      ...DEFAULT_RECEIPT_TEMPLATE,
      ...stored.receipt,
      fields: {
        ...DEFAULT_RECEIPT_TEMPLATE.fields,
        ...stored.receipt.fields,
      },
    },
  };
}

export const SAMPLE_INVOICE_DISPATCH = {
  dispatchNumber: 'DSP-0001',
  dispatchDate: '2026-06-13',
  customerName: 'QASIM BUTT',
  customerPhone: '0300-1234567',
  orderNumber: 'ORD-0001',
  vehicleNumber: 'LEA-1234',
  materialName: 'A GRADE',
  materialCode: 'A-GRADE',
  quantity: '5000',
  rate: '18',
  amount: '90000',
  deliveryLocation: 'DHA Phase 2, Lahore',
  pickupLocation: 'Yard',
  dropoffLocation: 'DHA Phase 2, Lahore',
  journeyKm: '35',
  expectedDeliveryAt: '2026-06-13T17:00:00.000Z',
} as const;

export const SAMPLE_RECEIPT_PAYMENT = {
  receiptNumber: 'RCP-0001',
  paymentDate: '2026-06-12',
  customerName: 'QASIM BUTT',
  paymentMethod: 'cash' as const,
  referenceNumber: 'CHQ-8821',
  orderNumber: 'ORD-0001',
  dispatchNumber: 'DSP-0001',
  amount: '90000',
  notes: 'Partial payment received',
};
