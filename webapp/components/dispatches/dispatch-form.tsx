'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertTriangle, MapPin, Package, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem } from '@/components/ui/select';
import { inventoryApi } from '@/lib/api/inventory';
import { ordersApi } from '@/lib/api/orders';
import { vehiclesApi } from '@/lib/api/vehicles';
import { dispatchesApi } from '@/lib/api/dispatches';
import type {
  CreateDispatchInput,
  OrderListItem,
  StockAvailabilityItem,
  Vehicle,
} from '@/lib/api/types';
import { useTranslation } from '@/components/providers/locale-provider';
import {
  DEFAULT_PICKUP_LOCATION,
  defaultDispatchSchedule,
  isScheduleValid,
  toIsoDatetime,
} from '@/lib/dispatch-schedule';
import { formatPkr, formatQty } from '@/lib/format';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

type DispatchFormState = {
  orderId: string;
  vehicleId: string;
  quantity: number;
  scheduledStartAt: string;
  expectedDeliveryAt: string;
  pickupLocation: string;
  dropoffLocation: string;
  journeyKm?: number;
  notes?: string;
};

function emptySchedule() {
  return defaultDispatchSchedule();
}

export function DispatchForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillOrderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [availability, setAvailability] = useState<StockAvailabilityItem[]>([]);
  const [linkedOrder, setLinkedOrder] = useState<OrderListItem | null>(null);
  const [form, setForm] = useState<DispatchFormState>({
    orderId: '',
    vehicleId: '',
    quantity: 0,
    pickupLocation: DEFAULT_PICKUP_LOCATION,
    dropoffLocation: '',
    ...emptySchedule(),
  });

  useEffect(() => {
    Promise.all([
      vehiclesApi.list({ limit: 100 }),
      ordersApi.list({ limit: 100 }),
      inventoryApi.availability(),
    ])
      .then(([v, o, stock]) => {
        setVehicles(v.items);
        const openOrders = o.items.filter(
          (item) =>
            item.status !== 'cancelled' &&
            item.status !== 'fulfilled' &&
            Number(item.remainingQty) > 0,
        );
        setOrders(openOrders);
        setAvailability(stock);

        if (v.items[0]) {
          setForm((prev) => ({ ...prev, vehicleId: v.items[0].id }));
        }

        if (prefillOrderId) {
          const order = openOrders.find((item) => item.id === prefillOrderId);
          if (order) {
            setLinkedOrder(order);
            setForm((prev) => ({
              ...prev,
              orderId: order.id,
              ...defaultDispatchSchedule(order),
            }));
          }
        }
      })
      .catch(() => toast.error(t('dispatches.loadFormFailed')));
  }, [prefillOrderId, t]);

  const stockForMaterial = useMemo(() => {
    if (!linkedOrder) return null;
    return availability.find(
      (a) => a.materialTypeId === linkedOrder.materialTypeId,
    );
  }, [availability, linkedOrder]);

  const availableQty = Number(stockForMaterial?.availableQty ?? 0);
  const reservedQty = Number(stockForMaterial?.committedQty ?? 0);

  const exceedsOrderRemaining =
    linkedOrder != null &&
    form.quantity > 0 &&
    form.quantity > Number(linkedOrder.remainingQty);

  const insufficientStock =
    form.quantity > 0 && form.quantity > availableQty;

  const scheduleInvalid =
    Boolean(form.scheduledStartAt && form.expectedDeliveryAt) &&
    !isScheduleValid(form.scheduledStartAt, form.expectedDeliveryAt);

  const dispatchAmount =
    linkedOrder && form.quantity > 0
      ? form.quantity * Number(linkedOrder.rate)
      : 0;

  function applyLinkedOrder(order: OrderListItem) {
    setLinkedOrder(order);
    setForm((prev) => ({
      ...prev,
      orderId: order.id,
      dropoffLocation: order.deliveryAddress,
      pickupLocation: prev.pickupLocation || DEFAULT_PICKUP_LOCATION,
      ...defaultDispatchSchedule(order),
    }));
  }

  async function onOrderSelect(orderId: string) {
    if (!orderId) {
      setLinkedOrder(null);
      setForm((prev) => ({
        ...prev,
        orderId: '',
        dropoffLocation: '',
        ...emptySchedule(),
      }));
      return;
    }
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      applyLinkedOrder(order);
      return;
    }
    try {
      const detail = await ordersApi.get(orderId);
      applyLinkedOrder(detail);
    } catch {
      toast.error(t('dispatches.loadOrderFailed'));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.orderId ||
      !form.vehicleId ||
      form.quantity <= 0 ||
      !form.scheduledStartAt ||
      !form.expectedDeliveryAt
    ) {
      toast.error(t('dispatches.requiredFieldsAll'));
      return;
    }

    if (scheduleInvalid) {
      toast.error(t('dispatches.scheduleInvalid'));
      return;
    }

    if (exceedsOrderRemaining) {
      toast.error(t('dispatches.stockExceedsOrder'));
      return;
    }

    if (insufficientStock) {
      toast.error(
        t('dispatches.stockInsufficient', {
          available: formatQty(availableQty),
        }),
      );
      return;
    }

    setLoading(true);
    try {
      const payload: CreateDispatchInput = {
        orderId: form.orderId,
        vehicleId: form.vehicleId,
        quantity: form.quantity,
        scheduledStartAt: toIsoDatetime(form.scheduledStartAt),
        expectedDeliveryAt: toIsoDatetime(form.expectedDeliveryAt),
        pickupLocation: form.pickupLocation.trim() || DEFAULT_PICKUP_LOCATION,
        dropoffLocation: form.dropoffLocation.trim() || undefined,
        journeyKm: form.journeyKm,
        notes: form.notes?.trim() || undefined,
      };
      const dispatch = await dispatchesApi.create(payload);
      toast.success(
        t('dispatches.createdWithNumber', { number: dispatch.dispatchNumber }),
      );
      router.push(`/dashboard/dispatches/${dispatch.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('dispatches.createFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('dispatches.createDispatch')}</CardTitle>
          <CardDescription>{t('dispatches.orderOnlyHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Truck className="size-4" />
            <AlertDescription>{t('dispatches.lifecycleHint')}</AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="order">{t('dispatches.selectOrder')} *</Label>
            <FormSelect
              id="order"
              value={form.orderId}
              onValueChange={onOrderSelect}
              placeholder={t('dispatches.selectOrder')}
            >
              {orders.map((o) => (
                <SelectItem key={o.id} value={o.id}>
                  {t('dispatches.orderRemainingOption', {
                    orderNumber: o.orderNumber,
                    customerName: o.customerName,
                    remaining: formatQty(o.remainingQty),
                  })}
                </SelectItem>
              ))}
            </FormSelect>
          </div>

          {linkedOrder && (
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <p className="text-sm font-medium">{t('dispatches.orderSummary')}</p>
              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-muted-foreground">{t('orders.customer')}: </span>
                  {linkedOrder.customerName}
                </div>
                <div>
                  <span className="text-muted-foreground">{t('orders.material')}: </span>
                  {linkedOrder.materialName}
                </div>
                <div>
                  <span className="text-muted-foreground">{t('orders.ratePerUnit')}: </span>
                  {formatPkr(linkedOrder.rate)}
                </div>
                <div>
                  <span className="text-muted-foreground">{t('orders.remaining')}: </span>
                  <span className="font-medium text-amber-600">
                    {formatQty(linkedOrder.remainingQty)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t('orders.deliveryDate')}:{' '}
                  </span>
                  <span className="font-medium">
                    {linkedOrder.expectedDeliveryDate ?? '—'}
                  </span>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg border bg-background p-3 text-sm">
                <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('orders.deliveryAddress')}
                  </p>
                  <p className="font-medium">{linkedOrder.deliveryAddress}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vehicle">{t('dispatches.carTruck')}</Label>
              <FormSelect
                id="vehicle"
                value={form.vehicleId}
                onValueChange={(vehicleId) =>
                  setForm((prev) => ({ ...prev, vehicleId }))
                }
                placeholder={t('dispatches.selectVehicle')}
              >
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.registrationNumber}
                    {v.driverName ? ` — ${v.driverName}` : ''}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="pickup">{t('dispatches.pickupLocation')}</Label>
              <Input
                id="pickup"
                placeholder={t('dispatches.pickupPlaceholder')}
                value={form.pickupLocation}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    pickupLocation: e.target.value,
                  }))
                }
                disabled={!linkedOrder}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dropoff">{t('dispatches.dropoffLocation')}</Label>
              <Input
                id="dropoff"
                placeholder={t('dispatches.dropoffPlaceholder')}
                value={form.dropoffLocation}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dropoffLocation: e.target.value,
                  }))
                }
                disabled={!linkedOrder}
              />
              <p className="text-xs text-muted-foreground">
                {t('dispatches.dropoffHint')}
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="journey-km">{t('dispatches.journeyKm')}</Label>
              <Input
                id="journey-km"
                type="number"
                min={0}
                step="0.1"
                placeholder="35"
                value={form.journeyKm ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    journeyKm: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                disabled={!linkedOrder}
              />
              <p className="text-xs text-muted-foreground">
                {t('dispatches.journeyKmHint')}
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="start-at">{t('dispatches.scheduledStartAt')} *</Label>
              <Input
                id="start-at"
                type="datetime-local"
                value={form.scheduledStartAt}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    scheduledStartAt: e.target.value,
                  }))
                }
                required
                disabled={!linkedOrder}
              />
              <p className="text-xs text-muted-foreground">
                {t('dispatches.scheduledStartHint')}
              </p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="delivery-at">
                {t('dispatches.expectedDeliveryAt')} *
              </Label>
              <Input
                id="delivery-at"
                type="datetime-local"
                value={form.expectedDeliveryAt}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    expectedDeliveryAt: e.target.value,
                  }))
                }
                required
                disabled={!linkedOrder}
              />
              {linkedOrder?.expectedDeliveryDate && (
                <p className="text-xs text-muted-foreground">
                  {t('dispatches.dispatchDateAligned')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty">{t('dispatches.dispatchQuantity')} *</Label>
              <Input
                id="qty"
                type="number"
                min={1}
                max={
                  linkedOrder
                    ? Number(linkedOrder.remainingQty)
                    : undefined
                }
                placeholder="20000"
                value={form.quantity || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    quantity: Number(e.target.value),
                  }))
                }
                required
                disabled={!linkedOrder}
              />
            </div>

            {linkedOrder && form.quantity > 0 && (
              <div className="space-y-2">
                <Label>{t('dispatches.amountFromOrder')}</Label>
                <div className="flex h-9 items-center rounded-lg border bg-muted/30 px-3 text-sm font-semibold">
                  {formatPkr(dispatchAmount)}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({formatQty(form.quantity)} × {formatPkr(linkedOrder.rate)})
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">{t('common.notes')}</Label>
              <Textarea
                id="notes"
                rows={2}
                value={form.notes ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {linkedOrder && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base">{t('dispatches.stockPanelTitle')}</CardTitle>
              <CardDescription>{t('dispatches.stockPanelDescription')}</CardDescription>
            </div>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            {stockForMaterial ? (
              <>
                <div>
                  <p className="text-sm font-medium">{stockForMaterial.materialName}</p>
                  <p className="text-xs text-muted-foreground">
                    {stockForMaterial.materialCode}
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('inventory.physicalStock')}
                    </span>
                    <span className="font-mono">
                      {formatQty(stockForMaterial.physicalStock)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t('inventory.committedStock')}
                    </span>
                    <span className="font-mono text-amber-600">
                      {formatQty(reservedQty)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>{t('dispatches.stockAvailable')}</span>
                    <span
                      className={`font-mono text-lg ${
                        availableQty > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {formatQty(availableQty)}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t('orders.selectMaterial')}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {scheduleInvalid ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{t('dispatches.scheduleInvalid')}</AlertDescription>
        </Alert>
      ) : null}

      {exceedsOrderRemaining ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>{t('dispatches.stockExceedsOrder')}</AlertDescription>
        </Alert>
      ) : null}

      {insufficientStock && !exceedsOrderRemaining ? (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            {t('dispatches.stockInsufficient', {
              available: formatQty(availableQty),
            })}
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={
            loading ||
            exceedsOrderRemaining ||
            insufficientStock ||
            scheduleInvalid ||
            !linkedOrder
          }
        >
          <Truck className="size-4" />
          {loading ? t('common.saving') : t('dispatches.createDispatch')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
