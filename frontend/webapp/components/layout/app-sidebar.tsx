'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  Truck,
  CreditCard,
  Settings,
  BrickWall,
  Boxes,
  Factory,
  BarChart3,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useTranslation } from '@/components/providers/locale-provider';
import { useTenant } from '@/components/providers/tenant-provider';

const navItems = [
  { titleKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboard },
  { titleKey: 'nav.customers', href: '/dashboard/customers', icon: Users },
  { titleKey: 'nav.materials', href: '/dashboard/materials', icon: Boxes },
  { titleKey: 'nav.orders', href: '/dashboard/orders', icon: ClipboardList },
  { titleKey: 'nav.dispatches', href: '/dashboard/dispatches', icon: Truck },
  { titleKey: 'nav.vehicles', href: '/dashboard/vehicles', icon: Truck },
  { titleKey: 'nav.payments', href: '/dashboard/payments', icon: CreditCard },
  { titleKey: 'nav.inventory', href: '/dashboard/inventory', icon: Package },
  { titleKey: 'nav.production', href: '/dashboard/production', icon: Factory },
  { titleKey: 'nav.reports', href: '/dashboard/reports', icon: BarChart3 },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { branding } = useTenant();
  const { t } = useTranslation();
  const displayName = branding?.displayName ?? '';

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: branding?.primaryColor ?? '#b45309' }}
          >
            <BrickWall className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="text-xs text-muted-foreground">{t('nav.tagline')}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.operations')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    render={
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{t(item.titleKey)}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={
                <Link href="/dashboard/settings">
                  <Settings className="size-4" />
                  <span>{t('nav.settings')}</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
        {branding?.showPoweredBy !== false && (
          <p className="mt-3 text-center text-[10px] text-muted-foreground">
            {t('common.poweredBy')}
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
