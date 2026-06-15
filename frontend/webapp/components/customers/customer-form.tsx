'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/form-select';
import { SelectItem } from '@/components/ui/select';
import { PakistanPhoneInput } from '@/components/ui/pakistan-phone-input';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { customersApi } from '@/lib/api/customers';
import type { CreateCustomerInput, CustomerType } from '@/lib/api/types';
import {
  formatPakistanPhoneForSubmit,
  isValidPakistanPhone,
} from '@/lib/validation/pakistan-phone';
import {
  formatPakistanCnicForSubmit,
  isValidPakistanCnic,
  normalizePakistanCnicInput,
} from '@/lib/validation/pakistan-cnic';
import { toast } from 'sonner';

const CUSTOMER_TYPES: CustomerType[] = [
  'builder',
  'contractor',
  'vendor',
  'individual',
];

export function CustomerForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [loading, setLoading] = useState(false);
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [cnicInvalid, setCnicInvalid] = useState(false);
  const [form, setForm] = useState<CreateCustomerInput>({
    name: '',
    phone: '',
    type: 'builder',
    cnic: '',
    notes: '',
  });

  function updateField<K extends keyof CreateCustomerInput>(
    key: K,
    value: CreateCustomerInput[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error(t('customers.nameRequired'));
      return;
    }

    const phone = form.phone?.trim() ?? '';
    if (!phone || !isValidPakistanPhone(phone)) {
      setPhoneInvalid(true);
      toast.error(t('customers.phoneInvalid'));
      return;
    }
    setPhoneInvalid(false);

    const cnic = form.cnic?.trim() ?? '';
    if (cnic && !isValidPakistanCnic(cnic)) {
      setCnicInvalid(true);
      toast.error(t('customers.cnicInvalid'));
      return;
    }
    setCnicInvalid(false);

    setLoading(true);
    try {
      const customer = await customersApi.create({
        name: form.name.trim(),
        phone: formatPakistanPhoneForSubmit(phone),
        type: form.type,
        cnic: formatPakistanCnicForSubmit(cnic),
        notes: form.notes?.trim() || undefined,
      });
      toast.success(t('customers.created'));
      router.push(`/dashboard/customers/${customer.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('customers.createFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">{t('customers.customerName')} *</Label>
          <Input
            id="name"
            placeholder={t('customers.namePlaceholder')}
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('common.phone')} *</Label>
          <PakistanPhoneInput
            id="phone"
            value={form.phone ?? ''}
            invalid={phoneInvalid}
            onChange={(value) => {
              setPhoneInvalid(false);
              updateField('phone', value);
            }}
          />
          <p className="text-xs text-muted-foreground">{t('customers.phoneHint')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">{t('common.type')}</Label>
          <FormSelect
            id="type"
            value={form.type}
            onValueChange={(value) =>
              updateField('type', value as CustomerType)
            }
          >
            {CUSTOMER_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {labels.customerType(type)}
              </SelectItem>
            ))}
          </FormSelect>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="cnic">{t('customers.cnic')}</Label>
          <Input
            id="cnic"
            placeholder="12345-1234567-1"
            value={form.cnic ?? ''}
            aria-invalid={cnicInvalid || undefined}
            className={cnicInvalid ? 'border-destructive' : undefined}
            onChange={(e) => {
              setCnicInvalid(false);
              updateField('cnic', normalizePakistanCnicInput(e.target.value));
            }}
          />
          <p className="text-xs text-muted-foreground">{t('customers.cnicHint')}</p>
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">{t('common.notes')}</Label>
          <Textarea
            id="notes"
            rows={3}
            value={form.notes ?? ''}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? t('common.saving') : t('customers.createCustomer')}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
