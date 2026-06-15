import { PageHeader } from '@/components/layout/page-header';
import { CustomersTable } from '@/components/customers/customers-table';

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.customers.title"
        subtitleKey="pages.customers.subtitle"
      />
      <CustomersTable />
    </div>
  );
}
