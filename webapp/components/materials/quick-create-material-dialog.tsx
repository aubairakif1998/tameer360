'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { materialTypesApi } from '@/lib/api/material-types';
import type { MaterialCategory, MaterialType, MaterialUnit } from '@/lib/api/types';
import {
  getDefaultUnitForCategory,
  getUnitsForCategory,
  isInventoryTrackedCategory,
  MATERIAL_CATEGORIES,
  slugifyMaterialCode,
} from '@/lib/material-categories';
import { toast } from 'sonner';

interface QuickCreateMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (material: MaterialType) => void;
}

export function QuickCreateMaterialDialog({
  open,
  onOpenChange,
  onCreated,
}: QuickCreateMaterialDialogProps) {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<MaterialCategory>('brick');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<MaterialUnit>(() =>
    getDefaultUnitForCategory('brick'),
  );
  const [defaultRate, setDefaultRate] = useState<number | undefined>();
  const [codeSuggestion, setCodeSuggestion] = useState<{
    name: string;
    code: string;
  } | null>(null);

  const unitOptions = useMemo(() => getUnitsForCategory(category), [category]);
  const trimmedName = name.trim();
  const previewCode = useMemo(() => {
    if (trimmedName.length < 2) return '';
    if (codeSuggestion?.name === trimmedName) return codeSuggestion.code;
    return slugifyMaterialCode(trimmedName);
  }, [trimmedName, codeSuggestion]);
  const inventoryTracked = isInventoryTrackedCategory(category);

  useEffect(() => {
    if (!open || trimmedName.length < 2) return;

    const timer = window.setTimeout(() => {
      void materialTypesApi
        .suggestCode(trimmedName)
        .then(({ code }) => setCodeSuggestion({ name: trimmedName, code }))
        .catch(() =>
          setCodeSuggestion({
            name: trimmedName,
            code: slugifyMaterialCode(trimmedName),
          }),
        );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [open, trimmedName]);

  function resetForm() {
    setCategory('brick');
    setName('');
    setUnit(getDefaultUnitForCategory('brick'));
    setDefaultRate(undefined);
    setCodeSuggestion(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function handleCategoryChange(nextCategory: MaterialCategory) {
    setCategory(nextCategory);
    setUnit(getDefaultUnitForCategory(nextCategory));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmedName) {
      toast.error(t('materials.nameRequired'));
      return;
    }

    setLoading(true);
    try {
      const material = await materialTypesApi.create({
        name: trimmedName,
        category,
        unit,
        defaultRate,
      });
      toast.success(t('materials.created'));
      onCreated(material);
      handleOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('materials.createFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('orders.quickCreateMaterialTitle')}</DialogTitle>
          <DialogDescription>
            {t('orders.quickCreateMaterialDescription')}
          </DialogDescription>
        </DialogHeader>

        <form
          id="quick-create-material"
          onSubmit={handleSubmit}
          className="grid gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="quick-material-category">
              {t('materials.category')} *
            </Label>
            <FormSelect
              id="quick-material-category"
              value={category}
              onValueChange={(value) =>
                handleCategoryChange(value as MaterialCategory)
              }
            >
              {MATERIAL_CATEGORIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {labels.materialCategory(value)}
                </SelectItem>
              ))}
            </FormSelect>
            <p className="text-xs text-muted-foreground">
              {t('materials.categoryHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-material-name">
              {t('materials.materialName')} *
            </Label>
            <Input
              id="quick-material-name"
              placeholder={t('materials.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('materials.code')}</Label>
              <div className="flex h-9 items-center rounded-lg border bg-muted/40 px-3 font-mono text-sm">
                {previewCode || '—'}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('materials.codeAutoHint')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-material-unit">{t('materials.unit')} *</Label>
              <FormSelect
                id="quick-material-unit"
                value={unit}
                onValueChange={(value) => setUnit(value as MaterialUnit)}
                disabled={unitOptions.length === 1}
              >
                {unitOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {labels.materialUnit(value)}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-material-rate">
              {t('materials.defaultRatePerUnit')}
            </Label>
            <Input
              id="quick-material-rate"
              type="number"
              min={0}
              step="0.01"
              placeholder="18"
              value={defaultRate ?? ''}
              onChange={(e) =>
                setDefaultRate(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </div>

          {inventoryTracked ? (
            <Alert>
              <AlertDescription>
                {t('materials.inventoryTrackedHint')}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>{t('materials.nonInventoryHint')}</AlertDescription>
            </Alert>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="quick-create-material" disabled={loading}>
            {loading ? t('common.saving') : t('materials.createMaterial')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
