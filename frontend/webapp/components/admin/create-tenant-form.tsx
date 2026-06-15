'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { platformApi, type CreateTenantResult } from '@/lib/api/platform';
import { generateOwnerPassword } from '@/lib/admin/password';
import { isValidTenantSlug, normalizeTenantSlug } from '@/lib/admin/slug';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ColorField } from './color-field';

interface CreateTenantFormProps {
  onCreated: (result: CreateTenantResult) => void;
}

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

export function CreateTenantForm({ onCreated }: CreateTenantFormProps) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle');
  const [form, setForm] = useState({
    slug: '',
    displayName: '',
    ownerEmail: '',
    ownerFullName: '',
    ownerPassword: '',
    primaryColor: '#b45309',
    accentColor: '#fbbf24',
  });

  useEffect(() => {
    const normalized = normalizeTenantSlug(form.slug);

    const timer = window.setTimeout(() => {
      queueMicrotask(() => {
        if (!normalized) {
          setSlugStatus('idle');
          return;
        }

        if (!isValidTenantSlug(normalized)) {
          setSlugStatus('invalid');
          return;
        }

        setSlugStatus('checking');
        void platformApi
          .checkSlugAvailability(normalized)
          .then((result) => {
            setSlugStatus(result.available ? 'available' : 'taken');
          })
          .catch(() => setSlugStatus('invalid'));
      });
    }, 400);

    return () => window.clearTimeout(timer);
  }, [form.slug]);

  const canSubmit =
    isValidTenantSlug(normalizeTenantSlug(form.slug)) &&
    slugStatus === 'available' &&
    form.displayName.trim() &&
    form.ownerEmail.trim() &&
    form.ownerFullName.trim() &&
    form.ownerPassword.length >= 6 &&
    !isSubmitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setError('');
    setIsSubmitting(true);

    try {
      const result = await platformApi.createTenant({
        slug: normalizeTenantSlug(form.slug),
        displayName: form.displayName.trim(),
        businessType: 'brick_kiln',
        primaryColor: form.primaryColor,
        accentColor: form.accentColor,
        ownerEmail: form.ownerEmail.trim(),
        ownerFullName: form.ownerFullName.trim(),
        ownerPassword: form.ownerPassword,
      });
      onCreated(result);
      setForm({
        slug: '',
        displayName: '',
        ownerEmail: '',
        ownerFullName: '',
        ownerPassword: '',
        primaryColor: '#b45309',
        accentColor: '#fbbf24',
      });
      setSlugStatus('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tenant');
    } finally {
      setIsSubmitting(false);
    }
  }

  function slugStatusMessage() {
    switch (slugStatus) {
      case 'checking':
        return (
          <span className="flex items-center gap-1 text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Checking availability...
          </span>
        );
      case 'available':
        return (
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 className="size-3.5" />
            Slug is available
          </span>
        );
      case 'taken':
        return (
          <span className="flex items-center gap-1 text-destructive">
            <XCircle className="size-3.5" />
            Slug is already taken
          </span>
        );
      case 'invalid':
        return (
          <span className="flex items-center gap-1 text-amber-600">
            <XCircle className="size-3.5" />
            Use lowercase letters, numbers, and hyphens (min 3 chars)
          </span>
        );
      default:
        return (
          <span className="text-muted-foreground">
            Used in login URL: /login?tenant=your-slug
          </span>
        );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Bhatta Tenant</CardTitle>
        <CardDescription>
          Provision a new white-label workspace for a bhatta owner.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Tenant slug</Label>
            <Input
              id="slug"
              placeholder="al-hafeez-bricks"
              value={form.slug}
              onChange={(e) =>
                setForm({ ...form, slug: normalizeTenantSlug(e.target.value) })
              }
              className="font-mono"
              required
            />
            <p className="text-xs">{slugStatusMessage()}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              placeholder="Al Hafeez Bricks"
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ownerFullName">Owner full name</Label>
              <Input
                id="ownerFullName"
                placeholder="Muhammad Ali"
                value={form.ownerFullName}
                onChange={(e) =>
                  setForm({ ...form, ownerFullName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ownerEmail">Owner email</Label>
              <Input
                id="ownerEmail"
                type="email"
                placeholder="owner@alhafeez.pk"
                value={form.ownerEmail}
                onChange={(e) =>
                  setForm({ ...form, ownerEmail: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerPassword">Owner password</Label>
            <div className="flex gap-2">
              <Input
                id="ownerPassword"
                type="text"
                placeholder="Minimum 6 characters"
                value={form.ownerPassword}
                onChange={(e) =>
                  setForm({ ...form, ownerPassword: e.target.value })
                }
                className="font-mono"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setForm({ ...form, ownerPassword: generateOwnerPassword() })
                }
              >
                <RefreshCw className="size-4" />
                Generate
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              id="primaryColor"
              label="Primary brand color"
              value={form.primaryColor}
              onChange={(value) => setForm({ ...form, primaryColor: value })}
            />
            <ColorField
              id="accentColor"
              label="Accent brand color"
              value={form.accentColor}
              onChange={(value) => setForm({ ...form, accentColor: value })}
            />
          </div>

          <div
            className="rounded-lg border p-3"
            style={{
              borderColor: form.primaryColor,
              background: `linear-gradient(135deg, ${form.primaryColor}15, ${form.accentColor}25)`,
            }}
          >
            <p className="text-xs font-medium text-muted-foreground">
              Branding preview
            </p>
            <p
              className="mt-1 text-lg font-semibold"
              style={{ color: form.primaryColor }}
            >
              {form.displayName || 'Your Bhatta Name'}
            </p>
            <p className="text-xs font-mono text-muted-foreground">
              {normalizeTenantSlug(form.slug) || 'tenant-slug'} ·{' '}
              {form.primaryColor} · {form.accentColor}
            </p>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {isSubmitting ? 'Creating tenant...' : 'Create tenant'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
