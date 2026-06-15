'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem, SelectSeparator } from '@/components/ui/select';
import { QuickCreateCustomerDialog } from '@/components/customers/quick-create-customer-dialog';
import { QuickCreateMaterialDialog } from '@/components/materials/quick-create-material-dialog';
import { customersApi } from '@/lib/api/customers';
import { inventoryApi } from '@/lib/api/inventory';
import { materialTypesApi } from '@/lib/api/material-types';
import { ordersApi } from '@/lib/api/orders';
import type {
  CreateOrderInput,
  MaterialType,
  StockAvailabilityItem,
} from '@/lib/api/types';
import { useTranslation } from '@/components/providers/locale-provider';
import { formatQty } from '@/lib/format';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

const CREATE_NEW_CUSTOMER = '__create_new_customer__';
const CREATE_NEW_MATERIAL = '__create_new_material__';

export function OrderForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<
    Array<{ id: string; name: string; phone: string | null }>
  >([]);
  const [materials, setMaterials] = useState<MaterialType[]>([]);
  const [availability, setAvailability] = useState<StockAvailabilityItem[]>([]);
  const [form, setForm] = useState<CreateOrderInput>({
    customerId: '',
    deliveryAddress: '',
    materialTypeId: '',
    orderedQty: 0,
    rate: 0,
    expectedDeliveryDate: '',
    notes: '',
  });

  async function loadReferenceData() {
    const [c, m, stock] = await Promise.all([
      customersApi.list({ limit: 100 }),
      materialTypesApi.list({ limit: 100 }),
      inventoryApi.availability(),
    ]);
    setCustomers(
      c.items.map((x) => ({ id: x.id, name: x.name, phone: x.phone })),
    );
    const brickMaterials = m.items.filter((x) => x.category === 'brick');
    setMaterials(brickMaterials);
    setAvailability(stock);
    return brickMaterials;
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadReferenceData()
        .then((brickMaterials) => {
          if (brickMaterials[0]) {
            setForm((prev) => {
              if (prev.materialTypeId) return prev;
              return {
                ...prev,
                materialTypeId: brickMaterials[0].id,
                rate: brickMaterials[0].defaultRate
                  ? Number(brickMaterials[0].defaultRate)
                  : prev.rate,
              };
            });
          }
        })
        .catch(() => toast.error(t('orders.loadDataFailed')));
    });
  }, [t]);

  const selectedCustomer = customers.find((c) => c.id === form.customerId);

  const stockForMaterial = useMemo(() => {
    return availability.find((a) => a.materialTypeId === form.materialTypeId);
  }, [availability, form.materialTypeId]);

  const availableQty = Number(stockForMaterial?.availableQty ?? 0);
  const insufficientStock =
    form.orderedQty > 0 && form.orderedQty > availableQty;

  function onCustomerSelect(value: string) {
    if (value === CREATE_NEW_CUSTOMER) {
      setCustomerDialogOpen(true);
      return;
    }
    setForm((prev) => ({ ...prev, customerId: value }));
  }

  function onMaterialSelect(value: string) {
    if (value === CREATE_NEW_MATERIAL) {
      setMaterialDialogOpen(true);
      return;
    }
    const material = materials.find((m) => m.id === value);
    setForm((prev) => ({
      ...prev,
      materialTypeId: value,
      rate: material?.defaultRate ? Number(material.defaultRate) : prev.rate,
    }));
  }

  function handleCustomerCreated(customer: {
    id: string;
    name: string;
    phone: string | null;
  }) {
    setCustomers((prev) => [...prev, customer]);
    setForm((prev) => ({ ...prev, customerId: customer.id }));
  }

  async function handleMaterialCreated(material: MaterialType) {
    setMaterials((prev) => [...prev, material]);
    setForm((prev) => ({
      ...prev,
      materialTypeId: material.id,
      rate: material.defaultRate ? Number(material.defaultRate) : prev.rate,
    }));
    try {
      const stock = await inventoryApi.availability();
      setAvailability(stock);
    } catch {
      // stock panel can refresh on next load
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.customerId ||
      !form.deliveryAddress.trim() ||
      !form.materialTypeId ||
      form.orderedQty <= 0
    ) {
      toast.error(t('orders.requiredFields'));
      return;
    }

    if (insufficientStock) {
      toast.error(
        t('orders.stockInsufficient', { available: formatQty(availableQty) }),
      );
      return;
    }

    setLoading(true);
    try {
      const order = await ordersApi.create({
        ...form,
        deliveryAddress: form.deliveryAddress.trim(),
        expectedDeliveryDate: form.expectedDeliveryDate || undefined,
        notes: form.notes?.trim() || undefined,
      });
      toast.success(t('orders.createdWithNumber', { number: order.orderNumber }));
      router.push(`/dashboard/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('orders.createFailed'));
    } finally {
      setLoading(false);
    }
  }

  const totalAmount = form.orderedQty * form.rate;

  return (
    <>
      <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1fr_300px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('orders.createOrder')}</CardTitle>
              <CardDescription>{t('orders.createOrderDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="customer">{t('orders.customer')} *</Label>
                <FormSelect
                  id="customer"
                  value={form.customerId}
                  onValueChange={onCustomerSelect}
                  placeholder={t('orders.selectCustomer')}
                >
                  <SelectItem value={CREATE_NEW_CUSTOMER}>
                    + {t('orders.createNewCustomer')}
                  </SelectItem>
                  <SelectSeparator />
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                      {c.phone ? ` (${c.phone})` : ''}
                    </SelectItem>
                  ))}
                </FormSelect>
              </div>

              {selectedCustomer && (
                <div className="sm:col-span-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {t('orders.customerProfile')}:{' '}
                  </span>
                  <span className="font-medium">{selectedCustomer.name}</span>
                  {selectedCustomer.phone && (
                    <span className="text-muted-foreground">
                      {' '}
                      · {selectedCustomer.phone}
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="deliveryAddress">{t('orders.deliveryAddress')} *</Label>
                <Textarea
                  id="deliveryAddress"
                  rows={2}
                  placeholder={t('orders.deliveryAddressPlaceholder')}
                  value={form.deliveryAddress}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      deliveryAddress: e.target.value,
                    }))
                  }
                  required
                />
                <p className="text-xs text-muted-foreground">
                  {t('orders.deliveryAddressHint')}
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="material">{t('orders.material')} *</Label>
                <FormSelect
                  id="material"
                  value={form.materialTypeId}
                  onValueChange={onMaterialSelect}
                  placeholder={t('orders.selectMaterial')}
                >
                  <SelectItem value={CREATE_NEW_MATERIAL}>
                    + {t('orders.createNewMaterial')}
                  </SelectItem>
                  <SelectSeparator />
                  {materials.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </SelectItem>
                  ))}
                </FormSelect>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qty">{t('orders.quantityEent')}</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={availableQty > 0 ? availableQty : undefined}
                  placeholder="100000"
                  value={form.orderedQty || ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      orderedQty: Number(e.target.value),
                    }))
                  }
                  required
                  aria-invalid={insufficientStock}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">{t('orders.ratePerUnit')}</Label>
                <Input
                  id="rate"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="18"
                  value={form.rate || ''}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, rate: Number(e.target.value) }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">{t('orders.deliveryDate')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.expectedDeliveryDate ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      expectedDeliveryDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{t('orders.totalAmount')}</Label>
                <div className="flex h-9 items-center rounded-lg border bg-muted/30 px-3 text-sm font-semibold">
                  Rs. {totalAmount.toLocaleString('en-PK')}
                </div>
              </div>

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

              {insufficientStock && (
                <div className="sm:col-span-2">
                  <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertDescription>
                      {t('orders.stockInsufficient', {
                        available: formatQty(availableQty),
                      })}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || insufficientStock || !form.materialTypeId}
            >
              {loading ? t('common.saving') : t('orders.createOrder')}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="size-4" />
              {t('orders.stockPanelTitle')}
            </CardTitle>
            <CardDescription>{t('orders.stockPanelDescription')}</CardDescription>
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
                      {formatQty(stockForMaterial.committedQty)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>{t('orders.stockAvailable')}</span>
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
      </div>

      <QuickCreateCustomerDialog
        open={customerDialogOpen}
        onOpenChange={setCustomerDialogOpen}
        onCreated={handleCustomerCreated}
      />
      <QuickCreateMaterialDialog
        open={materialDialogOpen}
        onOpenChange={setMaterialDialogOpen}
        onCreated={handleMaterialCreated}
      />
    </>
  );
}
