'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Phone, CreditCard } from 'lucide-react';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { customersApi } from '@/lib/api/customers';
import type { CustomerDetail } from '@/lib/api/types';
import { formatPkr } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function CustomerDetailView({ id }: { id: string }) {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customersApi
      .get(id)
      .then(setCustomer)
      .catch((err) =>
        setError(err instanceof Error ? err.message : t('customers.notFound')),
      )
      .finally(() => setLoading(false));
  }, [id, t]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            {t('customers.backToCustomers')}
          </Button>
        </Link>
        <p className="text-destructive">{error ?? t('customers.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/customers">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2">
              <ArrowLeft className="size-4" />
              {t('nav.customers')}
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {labels.customerType(customer.type)}
            </Badge>
            {customer.phone && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="size-3.5" />
                {customer.phone}
              </span>
            )}
            {customer.cnic && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <CreditCard className="size-3.5" />
                {customer.cnic}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('customers.totalPurchase')}</CardDescription>
            <CardTitle className="text-xl">
              {formatPkr(customer.ledger.totalPurchase)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('customers.totalReceived')}</CardDescription>
            <CardTitle className="text-xl text-emerald-600">
              {formatPkr(customer.ledger.totalReceived)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t('customers.remainingBaqi')}</CardDescription>
            <CardTitle className="text-xl text-amber-600">
              {formatPkr(customer.ledger.remainingBalance)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {customer.notes && (
        <Card>
          <CardHeader>
            <CardTitle>{t('customers.customerInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <span className="text-muted-foreground">{t('common.notes')}: </span>
            {customer.notes}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
