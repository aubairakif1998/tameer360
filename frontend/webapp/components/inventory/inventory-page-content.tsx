'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Factory } from 'lucide-react';
import { inventoryApi } from '@/lib/api/inventory';
import type { StockAvailabilityItem, StockLedgerItem } from '@/lib/api/types';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
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
import { cn } from '@/lib/utils';

export function InventoryPageContent() {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [availability, setAvailability] = useState<StockAvailabilityItem[]>(
    [],
  );
  const [ledger, setLedger] = useState<StockLedgerItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (trackLoading = true) => {
    if (trackLoading) setLoading(true);
    try {
      const [a, l] = await Promise.all([
        inventoryApi.availability(),
        inventoryApi.ledger({ limit: 20 }),
      ]);
      setAvailability(a);
      setLedger(l);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load(false);
    });
  }, [load]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('pages.inventory.title')}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('inventory.pageSubtitle')}
          </p>
        </div>
        <Link href="/dashboard/production/new" className="shrink-0">
          <Button>
            <Factory className="size-4" />
            {t('inventory.recordProduction')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('inventory.currentStock')}</CardTitle>
          <CardDescription>{t('inventory.stockCardHint')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 px-6 pb-6">
              <Skeleton className="h-20 w-full" />
            </div>
          ) : availability.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">
              {t('inventory.noStockHint')}
            </p>
          ) : (
            <ul className="divide-y">
              {availability.map((m) => {
                const inYard = Number(m.physicalStock);
                const reserved = Number(m.committedQty);
                const available = Number(m.availableQty);
                const reservations = m.reservations ?? [];

                return (
                  <li key={m.materialTypeId} className="px-6 py-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium">{m.materialName}</p>
                        <Badge variant="outline" className="mt-1 font-normal">
                          {m.materialCode}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'text-3xl font-bold tabular-nums tracking-tight',
                            available > 0
                              ? 'text-emerald-600'
                              : 'text-muted-foreground',
                          )}
                        >
                          {formatQty(m.availableQty)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('inventory.availableForDispatch')}
                        </p>
                        <p className="mt-1.5 text-xs text-muted-foreground">
                          {reserved > 0
                            ? t('inventory.yardWithReserved', {
                                inYard: formatQty(inYard),
                                reserved: formatQty(reserved),
                              })
                            : t('inventory.yardOnly', {
                                qty: formatQty(inYard),
                              })}
                        </p>
                      </div>
                    </div>

                    {reservations.length > 0 ? (
                      <div className="mt-4 rounded-lg border bg-muted/20">
                        <p className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
                          {t('inventory.reservedBreakdown')}
                        </p>
                        <ul className="divide-y">
                          {reservations.map((r) => (
                            <li
                              key={r.dispatchId}
                              className="flex items-start justify-between gap-3 px-3 py-2.5 text-sm"
                            >
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                  <Link
                                    href={`/dashboard/dispatches/${r.dispatchId}`}
                                    className="font-medium hover:underline"
                                  >
                                    {r.dispatchNumber}
                                  </Link>
                                  <span className="text-muted-foreground">·</span>
                                  <Link
                                    href={`/dashboard/orders/${r.orderId}`}
                                    className="text-muted-foreground hover:underline"
                                  >
                                    {r.orderNumber}
                                  </Link>
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                  {r.customerName}
                                </p>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-1">
                                <span className="font-mono font-semibold tabular-nums text-amber-600">
                                  {formatQty(r.quantity)}
                                </span>
                                <Badge variant="outline" className="text-xs font-normal">
                                  {labels.dispatchStatus(r.status)}
                                </Badge>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {!loading && ledger.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {t('inventory.recentMovements')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.date')}</TableHead>
                  <TableHead>{t('inventory.movement')}</TableHead>
                  <TableHead className="text-right">{t('common.qty')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.map((entry) => {
                  const qty = Number(entry.quantity);
                  const isOut = qty < 0;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {entry.transactionDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{entry.materialName}</span>
                          <Badge variant="outline" className="font-normal">
                            {labels.stockTransaction(entry.transactionType)}
                          </Badge>
                        </div>
                        {entry.notes ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {entry.notes}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'inline-flex items-center gap-0.5 font-mono font-medium tabular-nums',
                            isOut ? 'text-red-600' : 'text-emerald-600',
                          )}
                        >
                          {isOut ? (
                            <ArrowDownRight className="size-3.5" />
                          ) : (
                            <ArrowUpRight className="size-3.5" />
                          )}
                          {isOut ? '' : '+'}
                          {formatQty(entry.quantity)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
