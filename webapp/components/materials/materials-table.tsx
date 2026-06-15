'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { materialTypesApi } from '@/lib/api/material-types';
import type { MaterialType } from '@/lib/api/types';
import { isInventoryTrackedCategory } from '@/lib/material-categories';
import { formatPkr } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function MaterialsTable() {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [items, setItems] = useState<MaterialType[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (term?: string, trackLoading = true) => {
    if (trackLoading) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await materialTypesApi.list({
        search: term || undefined,
        limit: 50,
      });
      setItems(result.items);
      setTotal(result.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('materials.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load(undefined, false);
    });
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(search);
  }

  async function handleDelete(item: MaterialType) {
    setDeletingId(item.id);
    try {
      await materialTypesApi.remove(item.id);
      toast.success(t('materials.deleted'));
      await load(search, false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('materials.deleteFailed'),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 sm:max-w-sm sm:flex-1">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('materials.searchPlaceholder')}
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            {t('common.search')}
          </Button>
        </form>
        <Link href="/dashboard/materials/new">
          <Button>
            <Plus className="size-4" />
            {t('materials.addMaterial')}
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.name')}</TableHead>
              <TableHead>{t('materials.code')}</TableHead>
              <TableHead>{t('materials.category')}</TableHead>
              <TableHead>{t('materials.unit')}</TableHead>
              <TableHead className="text-right">{t('materials.defaultRate')}</TableHead>
              <TableHead>{t('common.status')}</TableHead>
              <TableHead className="text-right">{t('common.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t('materials.noMaterialsHint')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {item.name}
                      {isInventoryTrackedCategory(item.category) ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {t('materials.inventoryBadge')}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {item.code}
                    </Badge>
                  </TableCell>
                  <TableCell>{labels.materialCategory(item.category)}</TableCell>
                  <TableCell>{labels.materialUnit(item.unit)}</TableCell>
                  <TableCell className="text-right">
                    {item.defaultRate ? formatPkr(item.defaultRate) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.isActive ? 'secondary' : 'outline'}>
                      {item.isActive ? t('common.active') : t('common.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/dashboard/materials/${item.id}/edit`}>
                        <Button variant="ghost" size="icon-sm" type="button">
                          <Pencil className="size-4" />
                          <span className="sr-only">{t('common.edit')}</span>
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger
                          disabled={deletingId === item.id}
                          render={
                            <Button variant="ghost" size="icon-sm" type="button">
                              <Trash2 className="size-4 text-destructive" />
                              <span className="sr-only">{t('common.delete')}</span>
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t('materials.deleteTitle')}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('materials.deleteDescription', { name: item.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => void handleDelete(item)}
                            >
                              {t('common.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && total > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('materials.totalCount', { count: total })}
        </p>
      )}
    </div>
  );
}
