'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { ordersApi } from '@/lib/api/orders';
import type { OrderListItem } from '@/lib/api/types';
import { formatPkr, formatQty } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function OrdersTable() {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (term?: string, trackLoading = true) => {
    if (trackLoading) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await ordersApi.list({
        search: term || undefined,
        limit: 50,
      });
      setOrders(result.items);
      setTotal(result.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('orders.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load(undefined, false);
    });
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load(search);
          }}
          className="flex gap-2 sm:max-w-sm sm:flex-1"
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('orders.searchPlaceholder')}
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            {t('common.search')}
          </Button>
        </form>
        <Link href="/dashboard/orders/new">
          <Button>
            <Plus className="size-4" />
            {t('pages.orders.new')}
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
              <TableHead>{t('common.order')}</TableHead>
              <TableHead>{t('common.customer')}</TableHead>
              <TableHead>{t('common.material')}</TableHead>
              <TableHead className="text-right">{t('orders.ordered')}</TableHead>
              <TableHead className="text-right">{t('orders.delivered')}</TableHead>
              <TableHead className="text-right">{t('orders.remaining')}</TableHead>
              <TableHead>{t('orders.fulfillment')}</TableHead>
              <TableHead>{t('payments.paymentProgress')}</TableHead>
              <TableHead className="text-right">{t('common.amount')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t('orders.noOrdersHint')}
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                    <Badge variant="outline" className="ml-2 text-[10px]">
                      {labels.orderStatus(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.materialName}</TableCell>
                  <TableCell className="text-right">
                    {formatQty(order.orderedQty)}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600">
                    {formatQty(order.deliveredQty)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-amber-600">
                    {formatQty(order.remainingQty)}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[80px] items-center gap-2">
                      <Progress
                        value={order.fulfillmentPercent}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {order.fulfillmentPercent}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-[80px] items-center gap-2">
                      <Progress
                        value={order.paymentPercent}
                        className="h-2 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {order.paymentPercent}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPkr(order.totalAmount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && total > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('orders.totalCount', { count: total })}
        </p>
      )}
    </div>
  );
}
