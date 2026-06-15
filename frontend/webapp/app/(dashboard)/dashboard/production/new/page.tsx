import { PageHeader } from '@/components/layout/page-header';
import { ProductionForm } from '@/components/production/production-form';

export default function NewProductionPage() {
  return (
    <div className="space-y-6">
      <PageHeader titleKey="pages.production.new" />
      <ProductionForm />
    </div>
  );
}
