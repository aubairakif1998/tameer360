import { PageHeader } from '@/components/layout/page-header';
import { OrderForm } from '@/components/orders/order-form';

export default function NewOrderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.orders.new"
        subtitleKey="pages.orders.newSubtitle"
      />
      <OrderForm />
    </div>
  );
}
