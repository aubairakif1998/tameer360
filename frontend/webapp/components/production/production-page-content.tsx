'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Factory, Layers, PackageMinus, PackagePlus } from 'lucide-react';
import { productionApi } from '@/lib/api/production';
import type { ProductionBatchListItem } from '@/lib/api/types';
import { useTranslation } from '@/components/providers/locale-provider';
import { formatQty } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductionPageContent() {
  const { t } = useTranslation();
  const [batches, setBatches] = useState<ProductionBatchListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (trackLoading = true) => {
    if (trackLoading) setLoading(true);
    try {
      const { items } = await productionApi.list({ limit: 50 });
      setBatches(items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load(false);
    });
  }, [load]);

  const totals = useMemo(() => {
    return batches.reduce(
      (acc, b) => ({
        produced: acc.produced + Number(b.producedQty),
        damaged: acc.damaged + Number(b.damagedQty),
        net: acc.net + Number(b.netQty),
      }),
      { produced: 0, damaged: 0, net: 0 },
    );
  }, [batches]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('pages.production.title')}
          </h1>
          <p className="text-muted-foreground">{t('production.pageSubtitle')}</p>
        </div>
        <Link href="/dashboard/production/new">
          <Button>
            <Factory className="size-4" />
            {t('production.recordProduction')}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('production.produced')}
            </CardTitle>
            <PackagePlus className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatQty(totals.produced)}</div>
            <p className="text-xs text-muted-foreground">{t('inventory.pieces')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('production.damaged')}
            </CardTitle>
            <PackageMinus className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatQty(totals.damaged)}
            </div>
            <p className="text-xs text-muted-foreground">{t('inventory.pieces')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('production.netToStock')}
            </CardTitle>
            <Layers className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatQty(totals.net)}
            </div>
            <p className="text-xs text-muted-foreground">{t('inventory.pieces')}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('production.batches')}</CardTitle>
          <CardDescription>
            {t('production.netProduced', { qty: formatQty(totals.net) })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48" />
          ) : batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('production.noProduction')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('production.batch')}</TableHead>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead>{t('production.material')}</TableHead>
                  <TableHead className="text-right">{t('production.produced')}</TableHead>
                  <TableHead className="text-right">{t('production.damaged')}</TableHead>
                  <TableHead className="text-right">{t('production.net')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">{b.batchNumber}</Badge>
                    </TableCell>
                    <TableCell>{b.productionDate}</TableCell>
                    <TableCell>{b.materialName}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatQty(b.producedQty)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-red-600">
                      {formatQty(b.damagedQty)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-emerald-600">
                      {formatQty(b.netQty)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
