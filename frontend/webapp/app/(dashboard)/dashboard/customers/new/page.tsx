import { PageHeader } from '@/components/layout/page-header';
import { CustomerForm } from '@/components/customers/customer-form';

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.customers.new"
        subtitleKey="pages.customers.newSubtitle"
      />
      <CustomerForm />
    </div>
  );
}
