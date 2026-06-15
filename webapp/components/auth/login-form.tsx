'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3,
  Building2,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { MarketingBackdrop } from '@/components/marketing/marketing-backdrop';
import { useAuth } from '@/components/providers/auth-provider';
import { useTranslation } from '@/components/providers/locale-provider';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fieldClassName =
  'h-10 border-white/10 bg-white/4 text-white placeholder:text-zinc-600 focus-visible:border-white/20 focus-visible:ring-white/10 dark:bg-white/4';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [tenantSlug, setTenantSlug] = useState(
    searchParams.get('tenant') ?? '',
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({
        email,
        password,
        tenantSlug: tenantSlug.trim() || undefined,
      });
      const next = searchParams.get('next') ?? '/dashboard';
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const features = [
    { icon: Building2, label: t('auth.featureInventory') },
    { icon: Truck, label: t('auth.featureDispatch') },
    { icon: BarChart3, label: t('auth.featureFinance') },
  ];

  return (
    <div className="relative min-h-svh overflow-hidden bg-zinc-950 text-white selection:bg-amber-400/20">
      <MarketingBackdrop />

      <div className="relative z-10 grid min-h-svh lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_480px]">
        <div className="hidden flex-col justify-between p-10 xl:p-14 lg:flex">
          <Link href="/" className="group flex w-fit items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-white/95 text-zinc-950 transition-transform group-hover:scale-105">
              <Building2 className="size-4" strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-sm font-medium tracking-tight text-white/90">
                Tameer360
              </p>
              <p className="text-xs text-zinc-600">{t('auth.brandTagline')}</p>
            </div>
          </Link>

          <div className="max-w-md space-y-10">
            <div className="space-y-4">
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-white xl:text-4xl">
                {t('auth.heroTitle')}
              </h1>
              <p className="text-sm leading-relaxed text-zinc-500">
                {t('auth.heroDescription')}
              </p>
            </div>

            <ul className="space-y-3">
              {features.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 text-sm text-zinc-400"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-white/8 bg-white/4">
                    <Icon className="size-3.5 text-amber-300/90" strokeWidth={1.75} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] tracking-wide text-zinc-700">
            {t('auth.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>

        <div className="flex items-center justify-center px-6 py-12 sm:px-10 lg:border-l lg:border-white/6 lg:bg-zinc-950/50 lg:backdrop-blur-xl">
          <div className="w-full max-w-[360px]">
            <div className="mb-8 lg:hidden">
              <Link href="/" className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-md bg-white/95 text-zinc-950">
                  <Building2 className="size-4" strokeWidth={2.25} />
                </div>
                <span className="text-sm font-medium tracking-tight">
                  Tameer360
                </span>
              </Link>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-7 backdrop-blur-md sm:p-8">
              <div className="space-y-1.5">
                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                  {t('auth.signInTitle')}
                </h2>
                <p className="text-xs leading-relaxed text-zinc-500">
                  {t('auth.signInDescription')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="tenantSlug"
                    className="text-xs text-zinc-400"
                  >
                    {t('auth.workspaceId')}
                  </Label>
                  <Input
                    id="tenantSlug"
                    name="organization"
                    autoComplete="organization"
                    placeholder={t('auth.workspaceIdPlaceholder')}
                    value={tenantSlug}
                    onChange={(e) => setTenantSlug(e.target.value)}
                    className={fieldClassName}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs text-zinc-400">
                    {t('common.email')}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClassName}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs text-zinc-400">
                    {t('common.password')}
                  </Label>
                  <InputGroup className={`h-10 ${fieldClassName}`}>
                    <InputGroupInput
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 text-white placeholder:text-zinc-600"
                      required
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-sm"
                        variant="ghost"
                        className="text-zinc-500 hover:text-zinc-300"
                        aria-label={
                          showPassword
                            ? t('auth.hidePassword')
                            : t('auth.showPassword')
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((current) => !current)}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                {error ? (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-500/20 bg-red-500/8 px-3 py-2 text-xs text-red-300"
                  >
                    {error}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="mt-2 h-10 w-full rounded-lg bg-white text-sm font-medium text-zinc-950 hover:bg-zinc-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-600">
                <ShieldCheck className="size-3 shrink-0" />
                <span>{t('auth.secureSignIn')}</span>
                <Lock className="size-2.5 shrink-0 opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
