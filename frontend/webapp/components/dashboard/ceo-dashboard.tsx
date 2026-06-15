"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  Wallet,
  TrendingUp,
  ClipboardList,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { dashboardApi } from "@/lib/api/dashboard";
import type { DashboardKpis } from "@/lib/api/types";
import { formatPkr, formatQty } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/components/providers/locale-provider";
import { useTenant } from "@/components/providers/tenant-provider";
import { DailySalesTrend } from "@/components/reports/daily-sales-trend";

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  accent?: "amber" | "emerald" | "blue";
}) {
  const accentClass =
    accent === "amber"
      ? "text-amber-600"
      : accent === "emerald"
        ? "text-emerald-600"
        : accent === "blue"
          ? "text-blue-600"
          : "";

  const content = (
    <Card className={href ? "transition-colors hover:bg-muted/30" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${accentClass}`}>{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function CeoDashboard() {
  const { t } = useTranslation();
  const { branding } = useTenant();
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    dashboardApi
      .getKpis()
      .then(setKpis)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : t("dashboard.loadFailed"),
        ),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    dashboardApi
      .getKpis()
      .then((data) => {
        if (!cancelled) setKpis(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : t("dashboard.loadFailed"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
        <p className="text-destructive">{error ?? t("dashboard.unavailable")}</p>
        <Button variant="outline" className="mt-4" onClick={load}>
          <RefreshCw className="size-4" />
          {t("common.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {branding?.displayName ?? t("dashboard.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.ceoView")} · {t("dashboard.subtitle", { date: kpis.asOfDate })}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="size-4" />
          {t("common.refresh")}
        </Button>
      </div>

      {/* Row 1 — Today's pulse */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={t("dashboard.todayDispatch")}
          value={formatQty(kpis.today.dispatchQuantity)}
          subtitle={t("dashboard.todayDispatchSubtitle", {
            count: kpis.today.dispatchCount,
            amount: formatPkr(kpis.today.dispatchAmount),
          })}
          icon={Truck}
          href="/dashboard/dispatches"
          accent="blue"
        />
        <KpiCard
          title={t("dashboard.todayCollection")}
          value={formatPkr(kpis.today.paymentsReceived)}
          subtitle={t("dashboard.todayCollectionSubtitle")}
          icon={Wallet}
          href="/dashboard/payments"
          accent="emerald"
        />
        <KpiCard
          title={t("dashboard.totalOutstanding")}
          value={formatPkr(kpis.outstanding.totalBalance)}
          subtitle={t("dashboard.outstandingSubtitle", {
            count: kpis.outstanding.customerCount,
          })}
          icon={Wallet}
          href="/dashboard/payments"
          accent="amber"
        />
        <KpiCard
          title={t("dashboard.stockAvailable")}
          value={formatQty(kpis.stock.totalStock)}
          subtitle={t("dashboard.stockSubtitle", {
            count: kpis.stock.materials.length,
          })}
          icon={Package}
          href="/dashboard/inventory"
          accent="amber"
        />
      </div>

      {/* Row 2 — Month + fleet */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title={t("dashboard.monthlySales")}
          value={formatPkr(kpis.month.dispatchAmount)}
          subtitle={t("dashboard.monthlySalesSubtitle", {
            qty: formatQty(kpis.month.dispatchQuantity),
          })}
          icon={TrendingUp}
        />
        <KpiCard
          title={t("dashboard.monthlyCollections")}
          value={formatPkr(kpis.month.paymentsReceived)}
          subtitle={t("dashboard.monthlyCollectionsSubtitle")}
          icon={TrendingUp}
          accent="emerald"
        />
        <KpiCard
          title={t("dashboard.trucksActive")}
          value={String(kpis.fleet.activeToday)}
          subtitle={t("dashboard.trucksActiveSubtitle", {
            total: kpis.fleet.totalVehicles,
          })}
          icon={Truck}
          href="/dashboard/vehicles"
        />
        <KpiCard
          title={t("dashboard.pendingDelivery")}
          value={formatQty(kpis.orders.pendingDeliveryQty)}
          subtitle={t("dashboard.pendingDeliverySubtitle", {
            count: kpis.orders.openCount,
          })}
          icon={ClipboardList}
          href="/dashboard/orders"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 7-day trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              {t("dashboard.trendTitle")}
            </CardTitle>
            <CardDescription>{t("dashboard.trendDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <DailySalesTrend trend={kpis.dailyTrend} />
          </CardContent>
        </Card>

        {/* Top outstanding */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dashboard.topOutstanding")}</CardTitle>
              <CardDescription>{t("dashboard.topOutstandingDescription")}</CardDescription>
            </div>
            <Link href="/dashboard/payments">
              <Button variant="ghost" size="sm">
                {t("common.viewAll")}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {kpis.topOutstanding.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.allClear")}
              </p>
            ) : (
              <div className="space-y-3">
                {kpis.topOutstanding.map((c) => (
                  <div
                    key={c.customerId}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <Link
                      href={`/dashboard/customers/${c.customerId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {c.customerName}
                    </Link>
                    <span className="font-semibold text-amber-600">
                      {formatPkr(c.remainingBalance)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending fulfillment */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="size-5" />
                {t("dashboard.orderFulfillment")}
              </CardTitle>
              <CardDescription>{t("dashboard.orderFulfillmentDescription")}</CardDescription>
            </div>
            <Link href="/dashboard/orders">
              <Button variant="ghost" size="sm">
                {t("dashboard.allOrders")}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {kpis.pendingFulfillment.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("dashboard.noPendingOrders")}
              </p>
            ) : (
              kpis.pendingFulfillment.map((o) => (
                <div key={o.orderId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <Link
                      href={`/dashboard/orders/${o.orderId}`}
                      className="font-medium hover:underline"
                    >
                      {o.orderNumber} — {o.customerName}
                    </Link>
                    <Badge variant="outline">
                      {formatQty(o.remainingQty)} {t("common.left")}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={o.fulfillmentPercent}
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-muted-foreground">
                      {o.fulfillmentPercent}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent dispatches */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-5" />
                {t("dashboard.recentDispatches")}
              </CardTitle>
              <CardDescription>{t("dashboard.recentDispatchesDescription")}</CardDescription>
            </div>
            <Link href="/dashboard/dispatches/new">
              <Button size="sm">{t("dashboard.newDispatch")}</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.dispatch")}</TableHead>
                  <TableHead>{t("dashboard.car")}</TableHead>
                  <TableHead className="text-right">{t("common.qty")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpis.recentDispatches.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center text-muted-foreground"
                    >
                      {t("dashboard.noDispatches")}
                    </TableCell>
                  </TableRow>
                ) : (
                  kpis.recentDispatches.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <Link
                          href={`/dashboard/dispatches/${d.id}`}
                          className="font-medium hover:underline"
                        >
                          {d.dispatchNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {d.customerName}
                        </p>
                      </TableCell>
                      <TableCell>{d.vehicleNumber}</TableCell>
                      <TableCell className="text-right">
                        {formatQty(d.quantity)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/dispatches/new">
          <Button>{t("dashboard.recordDispatch")}</Button>
        </Link>
        <Link href="/dashboard/payments/new">
          <Button variant="outline">{t("dashboard.recordPayment")}</Button>
        </Link>
        <Link href="/dashboard/orders/new">
          <Button variant="outline">{t("dashboard.newOrder")}</Button>
        </Link>
      </div>
    </div>
  );
}
