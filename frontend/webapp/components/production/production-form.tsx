'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Factory, Package, AlertTriangle } from 'lucide-react';
import { productionApi } from '@/lib/api/production';
import { materialTypesApi } from '@/lib/api/material-types';
import type { MaterialType } from '@/lib/api/types';
import { useTranslation } from '@/components/providers/locale-provider';
import { formatQty } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export function ProductionForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [materialTypeId, setMaterialTypeId] = useState('');
  const [producedQty, setProducedQty] = useState('');
  const [damagedQty, setDamagedQty] = useState('0');
  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    materialTypesApi
      .list({ limit: 100 })
      .then((r) => setMaterials(r.items.filter((m) => m.category === 'brick')));
  }, []);

  const produced = Number(producedQty) || 0;
  const damaged = Number(damagedQty) || 0;
  const netQty = Math.max(0, produced - damaged);
  const damagedInvalid = damaged > produced && produced > 0;

  const selectedMaterial = useMemo(
    () => materials.find((m) => m.id === materialTypeId),
    [materials, materialTypeId],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (damagedInvalid) {
      toast.error(t('production.invalidDamaged'));
      return;
    }

    setSaving(true);
    try {
      await productionApi.create({
        materialTypeId,
        producedQty: produced,
        damagedQty: damaged,
        productionDate,
        notes: notes.trim() || undefined,
      });
      toast.success(t('production.created'));
      router.push('/dashboard/production');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('production.createFailed'),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_280px]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="size-5" />
            {t('production.recordProduction')}
          </CardTitle>
          <CardDescription>{t('production.formDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>{t('production.materialGrade')}</Label>
              <FormSelect
                value={materialTypeId}
                onValueChange={setMaterialTypeId}
                placeholder={t('production.selectGrade')}
              >
                {materials.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({m.code})
                  </SelectItem>
                ))}
              </FormSelect>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('production.goodQty')}</Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="50000"
                  value={producedQty}
                  onChange={(e) => setProducedQty(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t('production.damagedQty')}</Label>
                <Input
                  type="number"
                  min="0"
                  value={damagedQty}
                  onChange={(e) => setDamagedQty(e.target.value)}
                  aria-invalid={damagedInvalid}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('production.date')}</Label>
              <Input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t('common.notes')}</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('production.notesPlaceholder')}
                rows={3}
              />
            </div>

            {damagedInvalid && (
              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>{t('production.invalidDamaged')}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={saving || !materialTypeId || damagedInvalid}
              >
                {saving ? t('common.saving') : t('production.saveProduction')}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('production.netToStock')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('production.produced')}</span>
              <span className="font-mono font-medium">{formatQty(produced)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('production.damaged')}</span>
              <span className="font-mono font-medium text-red-600">
                −{formatQty(damaged)}
              </span>
            </div>
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{t('production.net')}</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatQty(netQty)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {netQty > 0
                  ? t('production.netPreview', { net: formatQty(netQty) })
                  : t('production.allDamaged')}
              </p>
            </div>
          </CardContent>
        </Card>

        {selectedMaterial && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-4" />
                {selectedMaterial.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Code: {selectedMaterial.code}</p>
              <p className="mt-1">{t('materials.unitFixed')}</p>
            </CardContent>
          </Card>
        )}

        <Alert>
          <AlertDescription className="text-xs">
            {t('inventory.productionOnlyHint')}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
