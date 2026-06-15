import { DashboardShell } from '@/components/layout/dashboard-shell';
import { DashboardLoadingGate } from '@/components/layout/dashboard-loading-gate';
import { TenantProvider } from '@/components/providers/tenant-provider';
import { Toaster } from '@/components/ui/sonner';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <DashboardLoadingGate>
        <DashboardShell>{children}</DashboardShell>
      </DashboardLoadingGate>
      <Toaster richColors position="top-right" />
    </TenantProvider>
  );
}
