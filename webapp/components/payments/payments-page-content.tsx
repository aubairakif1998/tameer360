'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, MoreHorizontal, Plus, Receipt } from 'lucide-react';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { paymentsApi } from '@/lib/api/payments';
import type { OutstandingItem, PaymentListItem } from '@/lib/api/types';
import { formatPkr } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useDocumentDownload } from '@/hooks/use-document-download';

export function PaymentsPageContent() {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [outstanding, setOutstanding] = useState<OutstandingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { downloadInvoice, downloadReceipt, isDownloadingInvoice, isDownloadingReceipt } =
    useDocumentDownload();

  const load = useCallback(async (trackLoading = true) => {
    if (trackLoading) setLoading(true);
    try {
      const [p, o] = await Promise.all([
        paymentsApi.list({ limit: 50 }),
        paymentsApi.outstanding(),
      ]);
      setPayments(p.items);
      setOutstanding(o);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load(false);
    });
  }, [load]);

  const totalOutstanding = outstanding.reduce(
    (sum, item) => sum + Number(item.remainingBalance),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('pages.payments.title')}
          </h1>
          <p className="text-muted-foreground">{t('payments.pageSubtitle')}</p>
        </div>
        <Link href="/dashboard/payments/new">
          <Button>
            <Plus className="size-4" />
            {t('payments.recordPayment')}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.outstandingReceivables')}</CardTitle>
          <CardDescription>
            {t('payments.totalBaqi', { amount: formatPkr(totalOutstanding) })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : outstanding.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('payments.allClear')}</p>
          ) : (
            <div className="space-y-2">
              {outstanding.map((item) => (
                <div
                  key={item.customerId}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div>
                    <Link
                      href={`/dashboard/customers/${item.customerId}`}
                      className="font-medium hover:underline"
                    >
                      {item.customerName}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {t('payments.purchaseReceived', {
                        purchase: formatPkr(item.totalPurchase),
                        received: formatPkr(item.totalReceived),
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-amber-600">
                      {formatPkr(item.remainingBalance)}
                    </p>
                    <Link
                      href={`/dashboard/payments/new?customerId=${item.customerId}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {t('payments.recordPaymentLink')}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('payments.receipt')}</TableHead>
              <TableHead>{t('common.date')}</TableHead>
              <TableHead>{t('common.customer')}</TableHead>
              <TableHead className="hidden sm:table-cell">
                {t('payments.method')}
              </TableHead>
              <TableHead className="hidden md:table-cell">
                {t('common.dispatch')}
              </TableHead>
              <TableHead className="text-right">{t('common.amount')}</TableHead>
              <TableHead className="w-[100px] text-right">
                {t('common.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-20 text-center text-muted-foreground"
                >
                  {t('payments.noPaymentsRecorded')}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((p) => {
                const invoiceReady =
                  p.dispatchId != null && p.dispatchStatus === 'delivered';

                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.receiptNumber}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {p.paymentDate}
                    </TableCell>
                    <TableCell>{p.customerName}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary">
                        {labels.paymentMethod(p.paymentMethod)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {p.dispatchNumber ? (
                        <Link
                          href={`/dashboard/dispatches/${p.dispatchId}`}
                          className="hover:underline"
                        >
                          {p.dispatchNumber}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600">
                      {formatPkr(p.amount)}
                    </TableCell>
                    <TableCell className="text-right">
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
                            disabled={isDownloadingReceipt(p.id)}
                            onClick={() => void downloadReceipt(p.id)}
                          >
                            <Receipt className="size-4" />
                            {t('documents.downloadReceipt')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {invoiceReady && p.dispatchId ? (
                            <DropdownMenuItem
                              disabled={isDownloadingInvoice(p.dispatchId)}
                              onClick={() => void downloadInvoice(p.dispatchId!)}
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
