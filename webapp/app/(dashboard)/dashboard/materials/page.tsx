import { PageHeader } from '@/components/layout/page-header';
import { MaterialsTable } from '@/components/materials/materials-table';

export default function MaterialsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.materials.title"
        subtitleKey="pages.materials.subtitle"
      />
      <MaterialsTable />
    </div>
  );
}
