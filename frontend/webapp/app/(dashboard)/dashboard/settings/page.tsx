'use client';

import { LanguageSelector } from '@/components/layout/language-selector';
import { DocumentTemplateSettings } from '@/components/settings/document-template-settings';
import { useTranslation } from '@/components/providers/locale-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.languageTitle')}</CardTitle>
          <CardDescription>{t('settings.languageSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LanguageSelector showLabel={false} />
        </CardContent>
      </Card>

      <DocumentTemplateSettings />
    </div>
  );
}
