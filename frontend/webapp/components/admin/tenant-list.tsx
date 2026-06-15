'use client';

import { useState } from 'react';
import { platformApi, type TenantRecord } from '@/lib/api/platform';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface TenantListProps {
  tenants: TenantRecord[];
  onTenantUpdated: (tenant: TenantRecord) => void;
}

export function TenantList({ tenants, onTenantUpdated }: TenantListProps) {
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleToggle(tenant: TenantRecord, isActive: boolean) {
    setError('');
    setUpdatingSlug(tenant.slug);

    try {
      const updated = await platformApi.updateTenantStatus(tenant.slug, isActive);
      onTenantUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update tenant');
    } finally {
      setUpdatingSlug(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tenants</CardTitle>
        <CardDescription>
          Disable a tenant to block owner login and API access for that
          organization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? <p className="mb-3 text-sm text-destructive">{error}</p> : null}
        <div className="space-y-3">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <div
                  className="mt-1 size-10 shrink-0 rounded-md border shadow-inner"
                  style={{
                    background: `linear-gradient(135deg, ${tenant.primaryColor}, ${tenant.accentColor})`,
                  }}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{tenant.displayName}</p>
                    <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                      {tenant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="font-mono text-sm text-muted-foreground">
                    {tenant.slug}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tenant.primaryColor} · {tenant.accentColor}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:shrink-0">
                <Label
                  htmlFor={`tenant-active-${tenant.slug}`}
                  className="text-sm text-muted-foreground"
                >
                  {tenant.isActive ? 'Enabled' : 'Disabled'}
                </Label>
                <Switch
                  id={`tenant-active-${tenant.slug}`}
                  checked={tenant.isActive}
                  disabled={updatingSlug === tenant.slug}
                  onCheckedChange={(checked) =>
                    void handleToggle(tenant, checked)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
