'use client';

import { useTranslation } from '@/components/providers/locale-provider';

type PageHeaderProps = {
  titleKey: string;
  subtitleKey?: string;
};

export function PageHeader({ titleKey, subtitleKey }: PageHeaderProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{t(titleKey)}</h1>
      {subtitleKey ? (
        <p className="text-muted-foreground">{t(subtitleKey)}</p>
      ) : null}
    </div>
  );
}
