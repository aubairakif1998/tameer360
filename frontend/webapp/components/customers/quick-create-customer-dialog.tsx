'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import type { CustomerListItem, CustomerType } from '@/lib/api/types';
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

interface QuickCreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (customer: Pick<CustomerListItem, 'id' | 'name' | 'phone'>) => void;
}

export function QuickCreateCustomerDialog({
  open,
  onOpenChange,
  onCreated,
}: QuickCreateCustomerDialogProps) {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [loading, setLoading] = useState(false);
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [cnicInvalid, setCnicInvalid] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<CustomerType>('builder');
  const [cnic, setCnic] = useState('');
  const [notes, setNotes] = useState('');

  function resetForm() {
    setName('');
    setPhone('');
    setType('builder');
    setCnic('');
    setNotes('');
    setPhoneInvalid(false);
    setCnicInvalid(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('customers.nameRequired'));
      return;
    }
    if (!phone.trim() || !isValidPakistanPhone(phone)) {
      setPhoneInvalid(true);
      toast.error(t('customers.phoneInvalid'));
      return;
    }
    setPhoneInvalid(false);

    const trimmedCnic = cnic.trim();
    if (trimmedCnic && !isValidPakistanCnic(trimmedCnic)) {
      setCnicInvalid(true);
      toast.error(t('customers.cnicInvalid'));
      return;
    }
    setCnicInvalid(false);

    setLoading(true);
    try {
      const customer = await customersApi.create({
        name: name.trim(),
        phone: formatPakistanPhoneForSubmit(phone),
        type,
        cnic: formatPakistanCnicForSubmit(trimmedCnic),
        notes: notes.trim() || undefined,
      });
      toast.success(t('customers.created'));
      onCreated({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
      });
      handleOpenChange(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t('customers.createFailed'),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('orders.quickCreateCustomerTitle')}</DialogTitle>
          <DialogDescription>
            {t('orders.quickCreateCustomerDescription')}
          </DialogDescription>
        </DialogHeader>

        <form
          id="quick-create-customer"
          onSubmit={handleSubmit}
          className="grid gap-4"
        >
          <div className="space-y-2">
            <Label htmlFor="quick-customer-name">
              {t('customers.customerName')} *
            </Label>
            <Input
              id="quick-customer-name"
              placeholder={t('customers.namePlaceholder')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quick-customer-phone">{t('common.phone')} *</Label>
              <PakistanPhoneInput
                id="quick-customer-phone"
                value={phone}
                invalid={phoneInvalid}
                onChange={(value) => {
                  setPhoneInvalid(false);
                  setPhone(value);
                }}
              />
              <p className="text-xs text-muted-foreground">
                {t('customers.phoneHint')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-customer-type">{t('common.type')}</Label>
              <FormSelect
                id="quick-customer-type"
                value={type}
                onValueChange={(value) => setType(value as CustomerType)}
              >
                {CUSTOMER_TYPES.map((customerType) => (
                  <SelectItem key={customerType} value={customerType}>
                    {labels.customerType(customerType)}
                  </SelectItem>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-customer-cnic">{t('customers.cnic')}</Label>
            <Input
              id="quick-customer-cnic"
              placeholder="12345-1234567-1"
              value={cnic}
              aria-invalid={cnicInvalid || undefined}
              className={cnicInvalid ? 'border-destructive' : undefined}
              onChange={(e) => {
                setCnicInvalid(false);
                setCnic(normalizePakistanCnicInput(e.target.value));
              }}
            />
            <p className="text-xs text-muted-foreground">
              {t('customers.cnicHint')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-customer-notes">{t('common.notes')}</Label>
            <Textarea
              id="quick-customer-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="quick-create-customer" disabled={loading}>
            {loading ? t('common.saving') : t('customers.createCustomer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
