"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useTranslation } from "@/components/providers/locale-provider";
import { useTenant } from "@/components/providers/tenant-provider";
import { AppLoadingScreen } from "@/components/layout/app-loading-screen";

export function DashboardLoadingGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading: authLoading } = useAuth();
  const { isTenantLoading } = useTenant();
  const { t } = useTranslation();

  if (authLoading) {
    return (
      <AppLoadingScreen
        title={t("common.loadingYourData")}
        description={t("common.loadingYourDataHint")}
      />
    );
  }

  if (isTenantLoading) {
    return (
      <AppLoadingScreen
        title={t("common.loadingTenantWorkspace")}
        description={t("common.loadingTenantWorkspaceHint")}
      />
    );
  }

  return children;
}
