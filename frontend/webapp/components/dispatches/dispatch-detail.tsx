'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  Circle,
  XCircle,
} from 'lucide-react';
import { dispatchesApi } from '@/lib/api/dispatches';
import type { DispatchDetail, DispatchStatus } from '@/lib/api/types';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import {
  canCancelDispatch,
  DISPATCH_STATUS_FLOW,
  getNextDispatchStatus,
} from '@/lib/dispatch-lifecycle';
import {
  formatDispatchDatetime,
} from '@/lib/dispatch-schedule';
import { formatPkr, formatQty } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DispatchDetailView({ id }: { id: string }) {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [dispatch, setDispatch] = useState<DispatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await dispatchesApi.get(id);
      setDispatch(data);
    } catch {
      setDispatch(null);
      setLoadError(true);
      toast.error(t('dispatches.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  async function advanceStatus() {
    if (!dispatch) return;
    const next = getNextDispatchStatus(dispatch.status);
    if (!next) return;

    setUpdating(true);
    try {
      const updated = await dispatchesApi.update(dispatch.id, { status: next });
      setDispatch(updated);
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
      setUpdating(false);
    }
  }

  async function cancelDispatch() {
    if (!dispatch) return;
    setUpdating(true);
    try {
      const updated = await dispatchesApi.update(dispatch.id, {
        status: 'cancelled',
      });
      setDispatch(updated);
      toast.success(t('dispatches.cancelled'));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('dispatches.updateFailed'),
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (loadError || !dispatch) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/dispatches">
          <Button variant="ghost" size="sm" className="-ml-2">
            <ArrowLeft className="size-4" />
            {t('nav.dispatches')}
          </Button>
        </Link>
        <p className="text-muted-foreground">{t('dispatches.loadFailed')}</p>
        <Button variant="outline" onClick={() => void load()}>
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  const nextStatus = getNextDispatchStatus(dispatch.status);
  const isCancelled = dispatch.status === 'cancelled';
  const isDelivered = dispatch.status === 'delivered';
  const canPay =
    isDelivered &&
    dispatch.paymentStatus === 'unpaid' &&
    Number(dispatch.remainingPayment) > 0;

  function stepState(step: DispatchStatus): 'done' | 'current' | 'upcoming' {
    if (isCancelled) return 'upcoming';
    const currentIndex = DISPATCH_STATUS_FLOW.indexOf(dispatch!.status);
    const stepIndex = DISPATCH_STATUS_FLOW.indexOf(step);
    if (stepIndex < currentIndex) return 'done';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/dispatches">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="size-4" />
            {t('nav.dispatches')}
          </Button>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{dispatch.dispatchNumber}</h1>
          <Badge variant={isCancelled ? 'destructive' : 'secondary'}>
            {labels.dispatchStatus(dispatch.status)}
          </Badge>
          {isDelivered && (
            <Badge
              variant={dispatch.paymentStatus === 'paid' ? 'default' : 'outline'}
            >
              {labels.dispatchPaymentStatus(dispatch.paymentStatus)}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {t('dispatches.scheduledStartAt')}:{' '}
          {formatDispatchDatetime(dispatch.scheduledStartAt)}
        </p>
      </div>

      {!isCancelled && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('dispatches.lifecycleTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-0">
              {DISPATCH_STATUS_FLOW.map((step, index) => {
                const state = stepState(step);
                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={cn(
                        'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm',
                        state === 'done' && 'bg-emerald-100 text-emerald-800',
                        state === 'current' && 'bg-primary/10 text-primary font-medium',
                        state === 'upcoming' && 'text-muted-foreground',
                      )}
                    >
                      {state === 'done' ? (
                        <Check className="size-4" />
                      ) : (
                        <Circle className="size-4" />
                      )}
                      {labels.dispatchStatus(step)}
                    </div>
                    {index < DISPATCH_STATUS_FLOW.length - 1 && (
                      <ArrowRight className="mx-1 hidden size-4 text-muted-foreground sm:block" />
                    )}
                  </div>
                );
              })}
            </div>

            {nextStatus && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={advanceStatus} disabled={updating}>
                  {t('dispatches.advanceTo', {
                    status: labels.dispatchStatus(nextStatus),
                  })}
                </Button>
                {canCancelDispatch(dispatch.status) && (
                  <Button
                    variant="outline"
                    onClick={cancelDispatch}
                    disabled={updating}
                  >
                    <XCircle className="size-4" />
                    {t('dispatches.cancelDispatch')}
                  </Button>
                )}
              </div>
            )}

            {isDelivered && (
              <p className="text-sm text-muted-foreground">
                {t('dispatches.deliveredHint')}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {canPay && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="font-medium">{t('dispatches.paymentDue')}</p>
              <p className="text-sm text-muted-foreground">
                {formatPkr(dispatch.remainingPayment)} {t('payments.outstanding')}
              </p>
            </div>
            <Link href={`/dashboard/payments/new?dispatchId=${dispatch.id}`}>
              <Button>
                <Banknote className="size-4" />
                {t('payments.recordPayment')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          [t('dispatches.scheduledStartAt'), formatDispatchDatetime(dispatch.scheduledStartAt)],
          [t('dispatches.expectedDeliveryAt'), formatDispatchDatetime(dispatch.expectedDeliveryAt)],
          [t('dispatches.pickupLocation'), dispatch.pickupLocation ?? '—'],
          [t('dispatches.dropoffLocation'), dispatch.dropoffLocation ?? dispatch.deliveryLocation ?? '—'],
          [t('dispatches.journeyKm'), dispatch.journeyKm ? `${dispatch.journeyKm} km` : '—'],
          [t('dispatches.carTruck'), dispatch.vehicleNumber],
          [t('common.customer'), dispatch.customerName],
          [t('common.material'), dispatch.materialName],
          [t('dispatches.location'), dispatch.deliveryLocation],
          [t('dispatches.quantity'), formatQty(dispatch.quantity)],
          [t('payments.rate'), formatPkr(dispatch.rate)],
          [t('dispatches.amount'), formatPkr(dispatch.amount)],
          [t('common.order'), dispatch.orderNumber ?? '—'],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg font-semibold">{value}</CardContent>
          </Card>
        ))}
      </div>

      {isDelivered && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [t('payments.received'), formatPkr(dispatch.paidAmount), 'text-emerald-600'],
            [t('payments.outstanding'), formatPkr(dispatch.remainingPayment), 'text-amber-600'],
            [t('dispatches.paymentStatus'), labels.dispatchPaymentStatus(dispatch.paymentStatus), ''],
          ].map(([label, value, colorClass]) => (
            <Card key={label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className={cn('text-lg font-semibold', colorClass)}>
                {value}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
