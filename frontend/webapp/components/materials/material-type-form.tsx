'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Boxes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { materialTypesApi } from '@/lib/api/material-types';
import type { MaterialCategory, MaterialType, MaterialUnit } from '@/lib/api/types';
import {
  getDefaultUnitForCategory,
  getUnitsForCategory,
  isInventoryTrackedCategory,
  MATERIAL_CATEGORIES,
  slugifyMaterialCode,
} from '@/lib/material-categories';
import { useLabelMaps, useTranslation } from '@/components/providers/locale-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

type MaterialTypeFormProps = {
  materialId?: string;
};

type CodeSuggestion = {
  name: string;
  code: string;
};

export function MaterialTypeForm({ materialId }: MaterialTypeFormProps) {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const router = useRouter();
  const isEdit = Boolean(materialId);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [material, setMaterial] = useState<MaterialType | null>(null);
  const [category, setCategory] = useState<MaterialCategory>('brick');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<MaterialUnit>(() =>
    getDefaultUnitForCategory('brick'),
  );
  const [defaultRate, setDefaultRate] = useState<number | undefined>();
  const [codeSuggestion, setCodeSuggestion] = useState<CodeSuggestion | null>(
    null,
  );

  const unitOptions = useMemo(() => getUnitsForCategory(category), [category]);
  const trimmedName = name.trim();
  const previewCode = useMemo(() => {
    if (isEdit) {
      return material?.code ?? '';
    }
    if (trimmedName.length < 2) {
      return '';
    }
    if (codeSuggestion?.name === trimmedName) {
      return codeSuggestion.code;
    }
    return slugifyMaterialCode(trimmedName);
  }, [isEdit, material?.code, trimmedName, codeSuggestion]);
  const inventoryTracked = isInventoryTrackedCategory(category);

  useEffect(() => {
    if (!isEdit || !materialId) {
      return;
    }

    let cancelled = false;

    void materialTypesApi
      .get(materialId)
      .then((item) => {
        if (cancelled) return;
        setMaterial(item);
        setCategory(item.category);
        setName(item.name);
        setUnit(item.unit);
        setDefaultRate(item.defaultRate ? Number(item.defaultRate) : undefined);
      })
      .catch(() => {
        if (!cancelled) {
          toast.error(t('materials.loadFailed'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInitialLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isEdit, materialId, t]);

  useEffect(() => {
    if (isEdit || trimmedName.length < 2) {
      return;
    }

    const timer = window.setTimeout(() => {
      void materialTypesApi
        .suggestCode(trimmedName)
        .then(({ code }) => {
          setCodeSuggestion({ name: trimmedName, code });
        })
        .catch(() => {
          setCodeSuggestion({
            name: trimmedName,
            code: slugifyMaterialCode(trimmedName),
          });
        });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [trimmedName, isEdit]);

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
      if (isEdit && materialId) {
        await materialTypesApi.update(materialId, {
          name: trimmedName,
          defaultRate: defaultRate ?? null,
        });
        toast.success(t('materials.updated'));
      } else {
        await materialTypesApi.create({
          name: trimmedName,
          category,
          unit,
          defaultRate,
        });
        toast.success(t('materials.created'));
      }
      router.push('/dashboard/materials');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isEdit
            ? t('materials.updateFailed')
            : t('materials.createFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <Card className="mx-auto max-w-xl">
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {t('common.loading')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Boxes className="size-5" />
          {isEdit ? t('materials.editMaterial') : t('materials.createMaterial')}
        </CardTitle>
        <CardDescription>
          {isEdit ? t('materials.editDescription') : t('materials.formDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isEdit ? (
            <div className="space-y-2">
              <Label htmlFor="category">{t('materials.category')} *</Label>
              <FormSelect
                id="category"
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
          ) : material ? (
            <div className="grid gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">{t('materials.category')}</p>
                <Badge variant="outline" className="mt-1">
                  {labels.materialCategory(material.category)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('materials.code')}</p>
                <Badge variant="secondary" className="mt-1 font-mono">
                  {material.code}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t('materials.unit')}</p>
                <p className="mt-1 text-sm font-medium">
                  {labels.materialUnit(material.unit)}
                </p>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name">{t('materials.materialName')} *</Label>
            <Input
              id="name"
              placeholder={t('materials.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {!isEdit ? (
            <>
              <div className="space-y-2">
                <Label>{t('materials.code')}</Label>
                <div className="flex h-9 items-center rounded-lg border bg-muted/40 px-3 font-mono text-sm">
                  {previewCode || '—'}
                </div>
                <p className="text-xs text-muted-foreground">{t('materials.codeAutoHint')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">{t('materials.unit')} *</Label>
                <FormSelect
                  id="unit"
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
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="defaultRate">{t('materials.defaultRatePerUnit')}</Label>
            <Input
              id="defaultRate"
              type="number"
              min={0}
              step="0.01"
              placeholder="18"
              value={defaultRate ?? ''}
              onChange={(e) =>
                setDefaultRate(e.target.value ? Number(e.target.value) : undefined)
              }
            />
          </div>

          {inventoryTracked ? (
            <Alert>
              <AlertDescription>{t('materials.inventoryTrackedHint')}</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertDescription>{t('materials.nonInventoryHint')}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading
                ? t('common.saving')
                : isEdit
                  ? t('materials.saveChanges')
                  : t('materials.createMaterial')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
