import { PageHeader } from '@/components/layout/page-header';
import { MaterialTypeForm } from '@/components/materials/material-type-form';

export default function NewMaterialPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.materials.new"
        subtitleKey="pages.materials.newSubtitle"
      />
      <MaterialTypeForm />
    </div>
  );
}
