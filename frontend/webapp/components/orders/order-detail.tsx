'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin } from 'lucide-react';
import { ordersApi } from '@/lib/api/orders';
import type { OrderDetail } from '@/lib/api/types';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { formatPkr, formatQty } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function OrderDetailView({ id }: { id: string }) {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ordersApi
      .get(id)
      .then(setOrder)
      .catch((err) =>
        setError(err instanceof Error ? err.message : t('orders.notFound')),
      )
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            {t('orders.backToOrders')}
          </Button>
        </Link>
        <p className="text-destructive">{error ?? t('orders.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2">
            <ArrowLeft className="size-4" />
            {t('nav.orders')}
          </Button>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{order.orderNumber}</h1>
          <Badge variant="secondary">
            {labels.orderStatus(order.status)}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          {order.customerName} · {order.materialName}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('orders.fulfillmentTitle')}</CardTitle>
          <CardDescription>{t('orders.fulfillmentDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Progress value={order.fulfillmentPercent} className="h-3 flex-1" />
            <span className="text-sm font-medium">
              {order.fulfillmentPercent}%
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{t('orders.ordered')}</p>
              <p className="text-xl font-bold">{formatQty(order.orderedQty)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{t('orders.delivered')}</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatQty(order.deliveredQty)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{t('orders.remainingBaqi')}</p>
              <p className="text-xl font-bold text-amber-600">
                {formatQty(order.remainingQty)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('payments.paymentProgress')}</CardTitle>
          <CardDescription>{t('payments.orderPaymentDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Progress value={order.paymentPercent} className="h-3 flex-1" />
            <span className="text-sm font-medium">{order.paymentPercent}%</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{t('orders.totalAmount')}</p>
              <p className="text-xl font-bold">{formatPkr(order.totalAmount)}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{t('payments.received')}</p>
              <p className="text-xl font-bold text-emerald-600">
                {formatPkr(order.receivedAmount)}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">{t('payments.outstanding')}</p>
              <p className="text-xl font-bold text-amber-600">
                {formatPkr(order.remainingPayment)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('orders.ratePerUnit')}</CardDescription>
            <CardTitle>{formatPkr(order.rate)} / unit</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('orders.deliveryDate')}</CardDescription>
            <CardTitle className="text-base">
              {order.expectedDeliveryDate ?? '—'}
            </CardTitle>
          </CardHeader>
        </Card>
        {order.customerPhone && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('common.phone')}</CardDescription>
              <CardTitle className="text-base">{order.customerPhone}</CardTitle>
            </CardHeader>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="size-4" />
            {t('orders.deliveryAddress')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{order.deliveryAddress}</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href={`/dashboard/dispatches/new?orderId=${order.id}`}>
          <Button>{t('dispatches.createDispatch')}</Button>
        </Link>
        {Number(order.remainingPayment) > 0 && order.deliveredQty !== '0' && (
          <Link href={`/dashboard/payments/new?orderId=${order.id}`}>
            <Button variant="outline">{t('payments.recordPayment')}</Button>
          </Link>
        )}
      </div>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t('common.notes')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">{order.notes}</CardContent>
        </Card>
      )}
    </div>
  );
}
