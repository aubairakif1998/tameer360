'use client';

import { Languages } from 'lucide-react';
import { useTranslation } from '@/components/providers/locale-provider';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem } from '@/components/ui/select';
import { LOCALES, type Locale } from '@/lib/i18n';
import { toast } from 'sonner';

type LanguageSelectorProps = {
  showLabel?: boolean;
  className?: string;
};

export function LanguageSelector({ showLabel = true, className }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useTranslation();

  function handleChange(value: string) {
    const next = value as Locale;
    setLocale(next);
    toast.success(t('language.saved'));
  }

  return (
    <div className={className}>
      {showLabel ? (
        <Label htmlFor="platform-language" className="mb-2 flex items-center gap-2">
          <Languages className="size-4" />
          {t('language.select')}
        </Label>
      ) : null}
      <FormSelect
        id="platform-language"
        value={locale}
        onValueChange={handleChange}
      >
        {LOCALES.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {t(`language.${item.labelKey}`)}
          </SelectItem>
        ))}
      </FormSelect>
      {showLabel ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {t('language.selectDescription')}
        </p>
      ) : null}
    </div>
  );
}
