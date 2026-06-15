'use client';

import { LogOut } from 'lucide-react';
import { LanguageSelector } from '@/components/layout/language-selector';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { useTranslation } from '@/components/providers/locale-provider';
import { useTenant } from '@/components/providers/tenant-provider';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { branding } = useTenant();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-muted-foreground">
            {branding?.displayName}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden w-36 sm:block">
              <LanguageSelector showLabel={false} />
            </div>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {user?.fullName}
            </span>
            <Button variant="ghost" size="sm" onClick={() => void logout()}>
              <LogOut className="size-4" />
              {t('common.logout')}
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
