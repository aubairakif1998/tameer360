import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { PaymentForm } from '@/components/payments/payment-form';

export default function NewPaymentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.payments.new"
        subtitleKey="pages.payments.newSubtitle"
      />
      <Suspense>
        <PaymentForm />
      </Suspense>
    </div>
  );
}
