import { Suspense } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { DispatchForm } from '@/components/dispatches/dispatch-form';

export default function NewDispatchPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        titleKey="pages.dispatches.new"
        subtitleKey="pages.dispatches.newSubtitle"
      />
      <Suspense>
        <DispatchForm />
      </Suspense>
    </div>
  );
}
