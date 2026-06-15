import { PageHeader } from '@/components/layout/page-header';
import { VehiclesTable } from '@/components/vehicles/vehicles-table';

export default function VehiclesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.vehicles.title"
        subtitleKey="pages.vehicles.subtitle"
      />
      <VehiclesTable />
    </div>
  );
}
