import { AmbientBackground } from '@/components/marketing/ambient-background';

export function MarketingBackdrop() {
  return (
    <>
      <AmbientBackground />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"
      />
    </>
  );
}
