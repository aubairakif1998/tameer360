'use client';

import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/components/providers/locale-provider';

export function PrintDocumentShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3 print:hidden">
        <p className="text-sm font-medium">{title}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => window.close()}>
            <X className="size-4" />
            {t('common.close')}
          </Button>
          <Button type="button" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" />
            {t('documents.printSavePdf')}
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-2xl bg-white p-8 shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {children}
      </div>
    </div>
  );
}
