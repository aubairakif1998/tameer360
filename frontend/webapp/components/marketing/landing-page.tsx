import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Layers,
  ShieldCheck,
  Truck,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingBackdrop } from '@/components/marketing/marketing-backdrop';

const modules = [
  {
    icon: Building2,
    title: 'Production & inventory',
    description:
      'Track kiln output, yard stock, and material types in real time across every shift.',
  },
  {
    icon: Truck,
    title: 'Fleet & dispatch',
    description:
      'Schedule dispatches, monitor delivery status, and manage vehicle assignments end to end.',
  },
  {
    icon: Wallet,
    title: 'Payments & recovery',
    description:
      'Record receipts, track outstanding balances, and stay on top of customer collections.',
  },
  {
    icon: BarChart3,
    title: 'Reports & insights',
    description:
      'Daily sales trends, financial summaries, and operational dashboards for smarter decisions.',
  },
];

const pillars = [
  { label: 'Multi-tenant', detail: 'Isolated workspaces per organization' },
  { label: 'Real-time', detail: 'Live stock, dispatch, and ledger data' },
  { label: 'Pakistan-first', detail: 'Built for local business workflows' },
];

export function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-hidden bg-zinc-950 text-white selection:bg-amber-400/20">
      <MarketingBackdrop />

      <header className="relative z-10 border-b border-white/6 bg-zinc-950/40 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-md bg-white/95 text-zinc-950 transition-transform group-hover:scale-105">
              <Building2 className="size-4" strokeWidth={2.25} />
            </div>
            <span className="text-sm font-medium tracking-tight text-white/90">
              Tameer360
            </span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-white/10 bg-white/4 px-4 text-xs text-white/80 hover:border-white/20 hover:bg-white/8 hover:text-white"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-6 pt-24 pb-20 md:pt-32 md:pb-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3.5 py-1 text-[11px] tracking-wide text-zinc-400 uppercase backdrop-blur-sm">
              <Layers className="size-3 text-amber-400/90" />
              Construction material industry
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-balance md:text-[3.5rem] md:leading-[1.06]">
              The{' '}
              <span className="bg-linear-to-r from-amber-200 via-amber-100 to-white bg-clip-text text-transparent">
                operating system
              </span>{' '}
              for material supply
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-zinc-500 md:text-base">
              Unify production, inventory, dispatch, payments, and reporting —
              built for brick kilns, sand suppliers, crush plants, and traders
              across Pakistan.
            </p>

            <div className="mt-10">
              <Button
                size="lg"
                className="group h-11 rounded-full bg-white px-7 text-sm font-medium text-zinc-950 shadow-[0_0_40px_-8px_rgba(255,255,255,0.35)] transition-all hover:bg-zinc-100 hover:shadow-[0_0_48px_-6px_rgba(255,255,255,0.45)]"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                Sign in to your workspace
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </div>

          <div className="mt-20 grid gap-3 md:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.label}
                className="rounded-xl border border-white/6 bg-white/2 px-5 py-4 text-center backdrop-blur-sm transition-colors hover:border-white/10 hover:bg-white/4"
              >
                <p className="text-[13px] font-medium tracking-tight text-white/90">
                  {pillar.label}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-600">
                  {pillar.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/6 bg-white/1">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
            <div className="mx-auto max-w-xl text-center">
              <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-600 uppercase">
                Platform
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] md:text-3xl">
                Everything your operation needs
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                One workspace to replace spreadsheets and disconnected tools.
              </p>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-2">
              {modules.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="group relative overflow-hidden rounded-2xl border border-white/6 bg-zinc-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/12 hover:bg-zinc-900/50"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-linear-to-br from-amber-400/4 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                  <div className="relative">
                    <div className="mb-5 flex size-9 items-center justify-center rounded-lg border border-white/8 bg-white/4">
                      <Icon className="size-4 text-amber-300/90" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-[15px] font-medium tracking-tight text-white/90">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                      {description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-zinc-900/40 p-8 backdrop-blur-md md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-amber-400/6 blur-3xl"
            />
            <div className="relative flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
              <div className="max-w-lg space-y-4">
                <div className="inline-flex items-center gap-2 text-amber-400/90">
                  <ShieldCheck className="size-3.5" strokeWidth={1.75} />
                  <span className="text-[11px] font-medium tracking-[0.18em] uppercase">
                    Enterprise-ready
                  </span>
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.02em] md:text-[1.75rem]">
                  Secure, multi-tenant, and built to scale
                </h2>
                <p className="text-sm leading-relaxed text-zinc-500">
                  Isolated workspaces, role-based access, and encrypted sign-in
                  — with a unified view across production, stock, dispatch, and
                  recovery.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 md:justify-end">
                {['Production', 'Stock', 'Dispatch', 'Recovery'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/8 bg-white/4 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-zinc-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/6 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-[11px] tracking-wide text-zinc-600 sm:flex-row">
          <p>© {new Date().getFullYear()} Tameer360</p>
          <p>Construction Material Supply ERP · Pakistan</p>
        </div>
      </footer>
    </div>
  );
}
