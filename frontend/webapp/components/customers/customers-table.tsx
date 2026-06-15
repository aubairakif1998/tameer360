'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import {
  useLabelMaps,
  useTranslation,
} from '@/components/providers/locale-provider';
import { customersApi } from '@/lib/api/customers';
import type { CustomerListItem } from '@/lib/api/types';
import { formatPkr } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function CustomersTable() {
  const { t } = useTranslation();
  const labels = useLabelMaps();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (term?: string, trackLoading = true) => {
    if (trackLoading) {
      setLoading(true);
      setError(null);
    }
    try {
      const result = await customersApi.list({
        search: term || undefined,
        limit: 50,
      });
      setCustomers(result.items);
      setTotal(result.meta.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('customers.loadFailed'),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load(undefined, false);
    });
  }, [load]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(search);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 sm:max-w-sm sm:flex-1">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('customers.searchPlaceholder')}
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            {t('common.search')}
          </Button>
        </form>
        <Link href="/dashboard/customers/new">
          <Button>
            <Plus className="size-4" />
            {t('customers.addCustomer')}
          </Button>
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.customer')}</TableHead>
              <TableHead>{t('common.type')}</TableHead>
              <TableHead>{t('common.phone')}</TableHead>
              <TableHead className="text-right">{t('customers.totalPurchase')}</TableHead>
              <TableHead className="text-right">{t('customers.totalReceived')}</TableHead>
              <TableHead className="text-right">{t('customers.remainingBalance')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t('customers.noCustomersHint')}
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/customers/${customer.id}`}
                      className="font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {labels.customerType(customer.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.phone ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    {formatPkr(customer.ledger.totalPurchase)}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600">
                    {formatPkr(customer.ledger.totalReceived)}
                  </TableCell>
                  <TableCell className="text-right font-medium text-amber-600">
                    {formatPkr(customer.ledger.remainingBalance)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && total > 0 && (
        <p className="text-sm text-muted-foreground">
          {t('customers.totalCount', { count: total })}
        </p>
      )}
    </div>
  );
}
