'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem } from '@/components/ui/select';
import { dispatchesApi } from '@/lib/api/dispatches';
import { paymentsApi } from '@/lib/api/payments';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import type {
  CreatePaymentInput,
  DispatchListItem,
  PaymentMethod,
} from '@/lib/api/types';
import { formatPkr } from '@/lib/format';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

const METHODS: PaymentMethod[] = [
  'cash',
  'bank',
  'cheque',
  'jazzcash',
  'easypaisa',
];

export function PaymentForm() {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillDispatchId = searchParams.get('dispatchId');
  const prefillOrderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(false);
  const [dispatches, setDispatches] = useState<DispatchListItem[]>([]);
  const [selectedDispatch, setSelectedDispatch] =
    useState<DispatchListItem | null>(null);
  const [form, setForm] = useState<CreatePaymentInput>({
    dispatchId: prefillDispatchId ?? '',
    amount: 0,
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    dispatchesApi
      .list({ limit: 100, payableOnly: true })
      .then((result) => {
        const eligible = result.items.filter(
          (d) => Number(d.remainingPayment) > 0,
        );
        setDispatches(eligible);

        if (prefillDispatchId) {
          const dispatch = eligible.find((d) => d.id === prefillDispatchId);
          if (dispatch) setSelectedDispatch(dispatch);
        } else if (prefillOrderId) {
          const dispatch = eligible.find((d) => d.orderId === prefillOrderId);
          if (dispatch) {
            setSelectedDispatch(dispatch);
            setForm((prev) => ({ ...prev, dispatchId: dispatch.id }));
          }
        }
      })
      .catch(() => toast.error(t('payments.loadDataFailed')));
  }, [prefillDispatchId, prefillOrderId, t]);

  const remaining = useMemo(() => {
    if (!selectedDispatch) return 0;
    return Number(selectedDispatch.remainingPayment);
  }, [selectedDispatch]);

  const dispatchPaidAfter = useMemo(() => {
    if (!selectedDispatch || form.amount <= 0) {
      return Number(selectedDispatch?.paidAmount ?? 0);
    }
    return Number(selectedDispatch.paidAmount) + form.amount;
  }, [selectedDispatch, form.amount]);

  function onDispatchChange(dispatchId: string) {
    const dispatch = dispatches.find((d) => d.id === dispatchId) ?? null;
    setSelectedDispatch(dispatch);
    setForm((prev) => ({
      ...prev,
      dispatchId,
      amount: 0,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.dispatchId || form.amount <= 0) {
      toast.error(t('payments.requiredFields'));
      return;
    }

    if (form.amount > remaining) {
      toast.error(t('payments.exceedsRemaining', { amount: formatPkr(remaining) }));
      return;
    }

    setLoading(true);
    try {
      const payment = await paymentsApi.create({
        ...form,
        referenceNumber: form.referenceNumber?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      });
      toast.success(
        t('payments.createdWithReceipt', { number: payment.receiptNumber }),
      );
      router.push('/dashboard/payments');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('payments.createFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('payments.createPayment')}</CardTitle>
          <CardDescription>{t('payments.payableDispatchesOnly')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="dispatch">{t('payments.againstDispatch')} *</Label>
            <FormSelect
              id="dispatch"
              value={form.dispatchId}
              onValueChange={onDispatchChange}
              placeholder={t('payments.selectDispatch')}
            >
              {dispatches.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {t('payments.dispatchRemainingOption', {
                    dispatchNumber: d.dispatchNumber,
                    orderNumber: d.orderNumber,
                    customerName: d.customerName,
                    amount: formatPkr(d.remainingPayment),
                  })}
                </SelectItem>
              ))}
            </FormSelect>
            {dispatches.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {t('payments.noEligibleDispatches')}
              </p>
            )}
          </div>

          {selectedDispatch && (
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {selectedDispatch.customerName}
                </span>
                <span className="font-medium">{selectedDispatch.dispatchNumber}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('common.order')}: {selectedDispatch.orderNumber}
              </p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('dispatches.amount')}
                  </p>
                  <p className="font-semibold">
                    {formatPkr(selectedDispatch.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('payments.received')}
                  </p>
                  <p className="font-semibold text-emerald-600">
                    {formatPkr(selectedDispatch.paidAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t('payments.outstanding')}
                  </p>
                  <p className="font-semibold text-amber-600">
                    {formatPkr(selectedDispatch.remainingPayment)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('payments.amountReceived')}</Label>
              <Input
                id="amount"
                type="number"
                min={1}
                max={remaining > 0 ? remaining : undefined}
                value={form.amount || ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    amount: Number(e.target.value),
                  }))
                }
                required
                disabled={!selectedDispatch}
              />
              {selectedDispatch && form.amount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('payments.afterDispatchPayment', {
                    paid: formatPkr(dispatchPaidAfter),
                    remaining: formatPkr(Math.max(0, remaining - form.amount)),
                  })}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">{t('payments.method')}</Label>
              <FormSelect
                id="method"
                value={form.paymentMethod ?? 'cash'}
                onValueChange={(paymentMethod) =>
                  setForm((prev) => ({
                    ...prev,
                    paymentMethod: paymentMethod as PaymentMethod,
                  }))
                }
              >
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {labels.paymentMethod(m)}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">{t('payments.paymentDate')} *</Label>
              <Input
                id="date"
                type="date"
                value={form.paymentDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, paymentDate: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref">{t('payments.referenceNo')}</Label>
              <Input
                id="ref"
                placeholder={t('payments.referencePlaceholder')}
                value={form.referenceNumber ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    referenceNumber: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
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
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading || !selectedDispatch}>
          {loading ? t('common.saving') : t('payments.createPayment')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
