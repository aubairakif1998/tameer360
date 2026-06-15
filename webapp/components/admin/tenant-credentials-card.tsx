'use client';

import { Copy } from 'lucide-react';
import type { CreateTenantResult } from '@/lib/api/platform';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface TenantCredentialsCardProps {
  created: CreateTenantResult | null;
}

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

export function TenantCredentialsCard({ created }: TenantCredentialsCardProps) {
  const loginUrl =
    typeof window !== 'undefined' && created
      ? `${window.location.origin}/login?tenant=${created.credentials.tenantSlug}`
      : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share with Bhatta Owner</CardTitle>
        <CardDescription>
          Send these credentials after creating a tenant. Owners cannot sign in
          while the tenant is inactive.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {created ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
            <CredentialRow label="Organization" value={created.tenant.displayName} />
            <CredentialRow label="Tenant slug" value={created.credentials.tenantSlug} mono />
            <CredentialRow label="Login URL" value={loginUrl} mono copyable />
            <CredentialRow label="Email" value={created.credentials.email} copyable />
            <CredentialRow
              label="Password"
              value={created.credentials.password}
              mono
              copyable
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Create a tenant to generate owner credentials.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function CredentialRow({
  label,
  value,
  mono = false,
  copyable = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={`break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
      {copyable ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => copyText(value)}
        >
          <Copy className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}
