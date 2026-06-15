'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  FileText,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { dispatchesApi } from '@/lib/api/dispatches';
import type { DispatchListItem } from '@/lib/api/types';
import { getNextDispatchStatus } from '@/lib/dispatch-lifecycle';
import { formatPkr, formatQty } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useDocumentDownload } from '@/hooks/use-document-download';

export function DispatchesTable() {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const router = useRouter();
  const [items, setItems] = useState<DispatchListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { downloadInvoice, isDownloadingInvoice } = useDocumentDownload();

  const load = useCallback(async (term?: string, trackLoading = true) => {
    if (trackLoading) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await dispatchesApi.list({
        search: term || undefined,
        limit: 50,
      });
      setItems(result.items);
      setTotal(result.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('dispatches.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load(undefined, false);
    });
  }, [load]);

  async function advanceStatus(dispatch: DispatchListItem) {
    const next = getNextDispatchStatus(dispatch.status);
    if (!next) return;

    setUpdatingId(dispatch.id);
    try {
      const updated = await dispatchesApi.update(dispatch.id, { status: next });
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      toast.success(
        t('dispatches.statusUpdated', {
          status: labels.dispatchStatus(next),
        }),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('dispatches.updateFailed'),
      );
    } finally {
      setUpdatingId(null);
    }
  }

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
              placeholder={t('dispatches.searchPlaceholder')}
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            {t('common.search')}
          </Button>
        </form>
        <Link href="/dashboard/dispatches/new">
          <Button>
            <Plus className="size-4" />
            {t('pages.dispatches.new')}
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.dispatch')}</TableHead>
              <TableHead>{t('common.date')}</TableHead>
              <TableHead>{t('dashboard.car')}</TableHead>
              <TableHead>{t('common.customer')}</TableHead>
              <TableHead className="hidden md:table-cell">
                {t('dispatches.location')}
              </TableHead>
              <TableHead>{t('dispatches.status')}</TableHead>
              <TableHead className="text-right">{t('common.qty')}</TableHead>
              <TableHead className="hidden sm:table-cell text-right">
                {t('common.amount')}
              </TableHead>
              <TableHead className="w-[140px] text-right">
                {t('common.actions')}
              </TableHead>
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
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-24 text-center text-muted-foreground"
                >
                  {t('dispatches.noDispatchesHint')}
                </TableCell>
              </TableRow>
            ) : (
              items.map((d) => {
                const nextStatus = getNextDispatchStatus(d.status);
                const isUpdating = updatingId === d.id;
                const isDelivered = d.status === 'delivered';
                const isCancelled = d.status === 'cancelled';

                return (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/dispatches/${d.id}`}
                        className="font-medium hover:underline"
                      >
                        {d.dispatchNumber}
                      </Link>
                      {d.orderNumber && (
                        <p className="text-xs text-muted-foreground">
                          {d.orderNumber}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{d.dispatchDate}</TableCell>
                    <TableCell className="font-medium">{d.vehicleNumber}</TableCell>
                    <TableCell>{d.customerName}</TableCell>
                    <TableCell className="hidden max-w-[140px] truncate md:table-cell">
                      {d.deliveryLocation}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px]">
                          {labels.dispatchStatus(d.status)}
                        </Badge>
                        {isDelivered && (
                          <Badge
                            variant={
                              d.paymentStatus === 'paid' ? 'default' : 'secondary'
                            }
                            className="text-[10px]"
                          >
                            {labels.dispatchPaymentStatus(d.paymentStatus)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatQty(d.quantity)}
                    </TableCell>
                    <TableCell className="hidden text-right font-medium sm:table-cell">
                      {formatPkr(d.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {nextStatus && !isCancelled ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 px-2 text-xs"
                            disabled={isUpdating}
                            onClick={() => void advanceStatus(d)}
                          >
                            {isUpdating ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <ArrowRight className="size-3.5" />
                            )}
                            {labels.dispatchStatus(nextStatus)}
                          </Button>
                        ) : null}

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label={t('common.actions')}
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/dispatches/${d.id}`)
                              }
                            >
                              {t('dispatches.viewDetails')}
                            </DropdownMenuItem>
                            {isDelivered ? (
                              <DropdownMenuItem
                                disabled={isDownloadingInvoice(d.id)}
                                onClick={() => void downloadInvoice(d.id)}
                              >
                                <FileText className="size-4" />
                                {t('documents.downloadInvoice')}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled>
                                <FileText className="size-4 opacity-40" />
                                {t('documents.invoiceAfterDelivery')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && total > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('dispatches.totalCount', { count: total })}
        </p>
      )}
    </div>
  );
}
