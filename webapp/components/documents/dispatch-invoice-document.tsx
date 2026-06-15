'use client';

import type { DispatchDetail } from '@/lib/api/types';
import { useTenant } from '@/components/providers/tenant-provider';
import { useTranslation } from '@/components/providers/locale-provider';
import { TemplateInvoiceBody } from '@/components/documents/template-invoice-body';

export function DispatchInvoiceDocument({ dispatch }: { dispatch: DispatchDetail }) {
  const { branding, documentTemplates } = useTenant();
  const { t } = useTranslation();

  return (
    <TemplateInvoiceBody
      data={{
        dispatchNumber: dispatch.dispatchNumber,
        dispatchDate: dispatch.dispatchDate,
        customerName: dispatch.customerName,
        customerPhone: dispatch.customerPhone,
        orderNumber: dispatch.orderNumber,
        vehicleNumber: dispatch.vehicleNumber,
        materialName: dispatch.materialName,
        materialCode: dispatch.materialCode,
        quantity: dispatch.quantity,
        rate: dispatch.rate,
        amount: dispatch.amount,
        deliveryLocation: dispatch.deliveryLocation,
        pickupLocation: dispatch.pickupLocation,
        dropoffLocation: dispatch.dropoffLocation,
        journeyKm: dispatch.journeyKm,
        expectedDeliveryAt: dispatch.expectedDeliveryAt,
      }}
      template={documentTemplates.invoice}
      branding={branding}
      companyFallback={t('dashboard.title')}
    />
  );
}
