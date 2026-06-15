'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { CreateTenantForm } from '@/components/admin/create-tenant-form';
import { TenantCredentialsCard } from '@/components/admin/tenant-credentials-card';
import { TenantList } from '@/components/admin/tenant-list';
import { platformApi, type CreateTenantResult, type TenantRecord } from '@/lib/api/platform';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [created, setCreated] = useState<CreateTenantResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/admin/login');
      return;
    }

    if (user.role !== 'platform_admin') {
      router.replace('/login');
      return;
    }

    queueMicrotask(() => {
      void platformApi
        .listTenants()
        .then(setTenants)
        .catch((err: Error) => setError(err.message));
    });
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading admin console...</p>
      </div>
    );
  }

  if (!user || user.role !== 'platform_admin') {
    return null;
  }

  function handleCreated(result: CreateTenantResult) {
    setCreated(result);
    setTenants((current) => [result.tenant, ...current]);
  }

  function handleTenantUpdated(updated: TenantRecord) {
    setTenants((current) =>
      current.map((tenant) => (tenant.id === updated.id ? updated : tenant)),
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tameer360 Platform Admin</h1>
          <p className="text-sm text-muted-foreground">
            Create bhatta tenants, manage access, and share owner credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
            Home
          </Button>
          <Button variant="outline" onClick={() => void logout()}>
            <LogOut className="size-4" />
            Logout
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <CreateTenantForm onCreated={handleCreated} />
        <TenantCredentialsCard created={created} />
      </div>

      <TenantList tenants={tenants} onTenantUpdated={handleTenantUpdated} />
    </div>
  );
}
