import { PageHeader } from '@/components/layout/page-header';
import { DispatchesTable } from '@/components/dispatches/dispatches-table';

export default function DispatchesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.dispatches.title"
        subtitleKey="pages.dispatches.subtitle"
      />
      <DispatchesTable />
    </div>
  );
}
