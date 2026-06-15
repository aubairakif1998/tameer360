'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { vehiclesApi } from '@/lib/api/vehicles';
import type { Vehicle } from '@/lib/api/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

export function VehiclesTable() {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [items, setItems] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reg, setReg] = useState('');
  const [driver, setDriver] = useState('');
  const [type, setType] = useState<'truck' | 'loader' | 'tractor' | 'dumper'>(
    'truck',
  );

  const load = useCallback(async (trackLoading = true) => {
    if (trackLoading) setLoading(true);
    try {
      const result = await vehiclesApi.list({ limit: 100 });
      setItems(result.items);
    } catch {
      toast.error(t('vehicles.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load(false);
    });
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!reg.trim()) return;
    try {
      await vehiclesApi.create({
        registrationNumber: reg.trim().toUpperCase(),
        driverName: driver.trim() || undefined,
        type,
      });
      toast.success(t('vehicles.added'));
      setReg('');
      setDriver('');
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('vehicles.addFailed'));
    }
  }

  const vehicleTypes = ['truck', 'loader', 'tractor', 'dumper'] as const;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="size-4" />
          {t('vehicles.addVehicle')}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="grid gap-3 rounded-xl border p-4 sm:grid-cols-4"
        >
          <div className="space-y-1">
            <Label>{t('vehicles.registration')}</Label>
            <Input
              placeholder={t('vehicles.registrationPlaceholder')}
              className="uppercase"
              value={reg}
              onChange={(e) => setReg(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label>{t('vehicles.driver')}</Label>
            <Input
              placeholder={t('vehicles.driverPlaceholder')}
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('vehicles.vehicleType')}</Label>
            <FormSelect
              value={type}
              onValueChange={(value) => setType(value as typeof type)}
            >
              {vehicleTypes.map((v) => (
                <SelectItem key={v} value={v}>
                  {labels.vehicleType(v)}
                </SelectItem>
              ))}
            </FormSelect>
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              {t('common.save')}
            </Button>
          </div>
        </form>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('vehicles.registration')}</TableHead>
              <TableHead>{t('vehicles.vehicleType')}</TableHead>
              <TableHead>{t('vehicles.driver')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t('common.loading')}
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {t('vehicles.noVehiclesHint')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    {v.registrationNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {labels.vehicleType(v.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{v.driverName ?? '—'}</TableCell>
                  <TableCell>
                    {v.isActive ? t('common.active') : t('common.inactive')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
