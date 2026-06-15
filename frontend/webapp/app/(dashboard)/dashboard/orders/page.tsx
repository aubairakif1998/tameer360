import { PageHeader } from '@/components/layout/page-header';
import { OrdersTable } from '@/components/orders/orders-table';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.orders.title"
        subtitleKey="pages.orders.subtitle"
      />
      <OrdersTable />
    </div>
  );
}
