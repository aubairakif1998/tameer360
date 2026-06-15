import { PageHeader } from '@/components/layout/page-header';
import { MaterialTypeForm } from '@/components/materials/material-type-form';

type EditMaterialPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditMaterialPage({ params }: EditMaterialPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.materials.edit"
        subtitleKey="pages.materials.editSubtitle"
      />
      <MaterialTypeForm materialId={id} />
    </div>
  );
}
