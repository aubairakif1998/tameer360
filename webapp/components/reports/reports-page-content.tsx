'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowDownLeft,
  RefreshCw,
  TrendingUp,
  Truck,
  Wallet,
} from 'lucide-react';
import { reportsApi } from '@/lib/api/reports';
import { dashboardApi } from '@/lib/api/dashboard';
import type {
  AgingReceivablesReport,
  DashboardKpis,
  ProfitReport,
} from '@/lib/api/types';
import { useTranslation } from '@/components/providers/locale-provider';
import { formatPkr, formatQty } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
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
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailySalesTrend } from '@/components/reports/daily-sales-trend';

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function MoneyBar({
  label,
  amount,
  max,
}: {
  label: string;
  amount: number;
  max: number;
}) {
  const width = max > 0 ? Math.max((amount / max) * 100, amount > 0 ? 4 : 0) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-semibold tabular-nums">{formatPkr(amount)}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function OverviewSection({
  kpis,
  profit,
  aging,
}: {
  kpis: DashboardKpis;
  profit: ProfitReport;
  aging: AgingReceivablesReport;
}) {
  const { t } = useTranslation();

  const revenue = Number(profit.summary.revenue);
  const collections = Number(profit.summary.collections);
  const outstanding = Number(aging.totalOutstanding);
  const overdue90 = Number(
    aging.buckets.find((b) => b.bucket === '90+')?.amount ?? 0,
  );
  const collectionRate = pct(collections, revenue);
  const uncollectedSales = Math.max(revenue - collections, 0);
  const maxFlow = Math.max(collections, revenue, 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.moneyIn')}
            </CardTitle>
            <ArrowDownLeft className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatPkr(collections)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.moneyInSubtitle', {
                period: `${profit.periodStart} — ${profit.periodEnd}`,
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.salesOut')}
            </CardTitle>
            <Truck className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatPkr(revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.dispatchSummary', {
                count: profit.summary.dispatchCount,
                qty: formatQty(profit.summary.totalQuantity),
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.stillOwed')}
            </CardTitle>
            <Wallet className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatPkr(outstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.stillOwedSubtitle', {
                count: aging.buckets.reduce((s, b) => s + b.customerCount, 0),
                overdue: formatPkr(overdue90),
              })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.collectionRate')}
            </CardTitle>
            <TrendingUp className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {t('reports.collectionRateDetail', {
                collected: formatPkr(collections),
                sales: formatPkr(revenue),
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.salesVsCollections')}</CardTitle>
            <CardDescription>
              {t('reports.salesVsCollectionsDescription', {
                period: `${profit.periodStart} — ${profit.periodEnd}`,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <MoneyBar
              label={t('reports.cashIn')}
              amount={collections}
              max={maxFlow}
            />
            <MoneyBar
              label={t('reports.salesOut')}
              amount={revenue}
              max={maxFlow}
            />
            {uncollectedSales > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('reports.uncollectedAlert', {
                    amount: formatPkr(uncollectedSales),
                  })}
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  {t('reports.uncollectedAlertDetail')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.collectionHealth')}</CardTitle>
            <CardDescription>{t('reports.collectionHealthDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{t('reports.collectionRate')}</span>
                <span className="font-semibold">{collectionRate}%</span>
              </div>
              <Progress value={collectionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {t('reports.collectionRateDetail', {
                  collected: formatPkr(collections),
                  sales: formatPkr(revenue),
                })}
              </p>
            </div>

            {uncollectedSales > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  {t('reports.uncollectedAlert', {
                    amount: formatPkr(uncollectedSales),
                  })}
                </p>
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  {t('reports.uncollectedAlertDetail')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border px-3 py-2">
                <p className="text-muted-foreground">{t('dashboard.todayCollection')}</p>
                <p className="font-semibold text-emerald-600">
                  {formatPkr(kpis.today.paymentsReceived)}
                </p>
              </div>
              <div className="rounded-lg border px-3 py-2">
                <p className="text-muted-foreground">{t('dashboard.todayDispatch')}</p>
                <p className="font-semibold text-amber-600">
                  {formatPkr(kpis.today.dispatchAmount)}
                </p>
              </div>
              <div className="rounded-lg border px-3 py-2">
                <p className="text-muted-foreground">
                  {t('dashboard.monthlyCollections')}
                </p>
                <p className="font-semibold text-emerald-600">
                  {formatPkr(kpis.month.paymentsReceived)}
                </p>
              </div>
              <div className="rounded-lg border px-3 py-2">
                <p className="text-muted-foreground">{t('dashboard.monthlySales')}</p>
                <p className="font-semibold text-amber-600">
                  {formatPkr(kpis.month.dispatchAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.trendTitle')}</CardTitle>
          <CardDescription>{t('dashboard.trendDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DailySalesTrend trend={kpis.dailyTrend} />
        </CardContent>
      </Card>
    </div>
  );
}

function AgingSection({ report }: { report: AgingReceivablesReport }) {
  const { t } = useTranslation();

  const totalOutstanding = Number(report.totalOutstanding);
  const overdue90 = Number(
    report.buckets.find((b) => b.bucket === '90+')?.amount ?? 0,
  );
  const overdue61 = Number(
    report.buckets.find((b) => b.bucket === '61-90')?.amount ?? 0,
  );
  const criticalOverdue = overdue90 + overdue61;
  const overduePercent = pct(criticalOverdue, totalOutstanding);
  const customersWithOverdue = report.customers.filter(
    (c) => Number(c.days61to90) > 0 || Number(c.days90plus) > 0,
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.totalOutstanding')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-amber-600">
              {formatPkr(report.totalOutstanding)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.asOf')} {report.asOfDate}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.overdue60plus')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-bold ${criticalOverdue > 0 ? 'text-red-600' : ''}`}
            >
              {formatPkr(criticalOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.overdueCustomers', { count: customersWithOverdue })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.overduePercent')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-bold ${overduePercent > 30 ? 'text-red-600' : ''}`}
            >
              {overduePercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.overduePercentDetail')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.currentBucket')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-emerald-600">
              {formatPkr(
                report.buckets.find((b) => b.bucket === 'current')?.amount ?? 0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('reports.currentBucketDetail')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {report.buckets.map((b) => (
          <Card key={b.bucket}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{b.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl font-bold ${b.bucket === '90+' && Number(b.amount) > 0 ? 'text-red-600' : ''}`}
              >
                {formatPkr(b.amount)}
              </div>
              <p className="text-xs text-muted-foreground">
                {b.customerCount} {t('reports.customers')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports.customerAging')}</CardTitle>
          <CardDescription>
            {t('reports.totalOutstandingDetail', {
              amount: formatPkr(report.totalOutstanding),
              date: report.asOfDate,
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.customers.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('reports.noReceivables')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('common.name')}</TableHead>
                  <TableHead className="text-right">{t('reports.bucketCurrent')}</TableHead>
                  <TableHead className="text-right">{t('reports.bucket31to60')}</TableHead>
                  <TableHead className="text-right">{t('reports.bucket61to90')}</TableHead>
                  <TableHead className="text-right">{t('reports.bucket90plus')}</TableHead>
                  <TableHead className="text-right">{t('common.total')}</TableHead>
                  <TableHead>{t('reports.oldestDue')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.customers.map((c) => {
                  const isOverdue =
                    Number(c.days61to90) > 0 || Number(c.days90plus) > 0;
                  return (
                    <TableRow key={c.customerId}>
                      <TableCell>
                        <Link
                          href={`/dashboard/customers/${c.customerId}`}
                          className="font-medium hover:underline"
                        >
                          {c.customerName}
                        </Link>
                        {isOverdue && (
                          <Badge variant="destructive" className="ml-2 text-[10px]">
                            {t('reports.followUp')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPkr(c.current)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPkr(c.days31to60)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${Number(c.days61to90) > 0 ? 'text-amber-600 font-medium' : ''}`}
                      >
                        {formatPkr(c.days61to90)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${Number(c.days90plus) > 0 ? 'text-red-600 font-medium' : ''}`}
                      >
                        {formatPkr(c.days90plus)}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatPkr(c.totalOutstanding)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {c.oldestInvoiceDate ?? '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SalesSection({
  report,
  periodStart,
  periodEnd,
  onPeriodChange,
  onApplyPeriod,
  loading,
}: {
  report: ProfitReport;
  periodStart: string;
  periodEnd: string;
  onPeriodChange: (start: string, end: string) => void;
  onApplyPeriod: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation();

  const revenue = Number(report.summary.revenue);
  const collections = Number(report.summary.collections);
  const collectionRate = pct(collections, revenue);
  const collectionGap = Math.max(revenue - collections, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{t('reports.period')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="period-start">{t('reports.periodFrom')}</Label>
              <Input
                id="period-start"
                type="date"
                value={periodStart}
                onChange={(e) => onPeriodChange(e.target.value, periodEnd)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="period-end">{t('reports.periodTo')}</Label>
              <Input
                id="period-end"
                type="date"
                value={periodEnd}
                onChange={(e) => onPeriodChange(periodStart, e.target.value)}
              />
            </div>
            <Button onClick={onApplyPeriod} disabled={loading}>
              {loading ? t('common.loading') : t('reports.applyPeriod')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.salesOut')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">
              {formatPkr(report.summary.revenue)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('reports.dispatchSummary', {
                count: report.summary.dispatchCount,
                qty: formatQty(report.summary.totalQuantity),
              })}
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {t('reports.collections')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatPkr(report.summary.collections)}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('reports.moneyInSubtitle', {
                period: `${report.periodStart} — ${report.periodEnd}`,
              })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('reports.collectionRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{collectionRate}%</p>
            <p className="text-xs text-muted-foreground">
              {t('reports.collectionRateDetail', {
                collected: formatPkr(collections),
                sales: formatPkr(revenue),
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {collectionGap > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            {t('reports.collectionGap', { amount: formatPkr(collectionGap) })}
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.byCustomer')}</CardTitle>
            <CardDescription>
              {report.periodStart} — {report.periodEnd}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {report.byCustomer.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('reports.noData')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead className="text-right">{t('reports.revenue')}</TableHead>
                    <TableHead className="text-right">{t('reports.collected')}</TableHead>
                    <TableHead className="text-right">{t('reports.stillOwed')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.byCustomer.map((c) => (
                    <TableRow key={c.customerId}>
                      <TableCell>
                        <Link
                          href={`/dashboard/customers/${c.customerId}`}
                          className="hover:underline"
                        >
                          {c.customerName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPkr(c.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-emerald-600">
                        {formatPkr(c.collections)}
                      </TableCell>
                      <TableCell className="text-right text-amber-600">
                        {formatPkr(c.outstanding)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.byVehicle')}</CardTitle>
            <CardDescription>{t('reports.byVehicleSalesDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {report.byVehicle.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('reports.noData')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('dashboard.car')}</TableHead>
                    <TableHead className="text-right">{t('reports.revenue')}</TableHead>
                    <TableHead className="text-right">{t('common.qty')}</TableHead>
                    <TableHead className="text-right">{t('common.dispatch')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.byVehicle.map((v) => (
                    <TableRow key={v.vehicleId}>
                      <TableCell>{v.vehicleNumber}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPkr(v.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatQty(v.quantity)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {v.dispatchCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {report.monthly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.monthlyBreakdown')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('reports.month')}</TableHead>
                  <TableHead className="text-right">{t('reports.revenue')}</TableHead>
                  <TableHead className="text-right">{t('reports.collections')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.monthly.map((m) => (
                  <TableRow key={m.month}>
                    <TableCell>{m.month}</TableCell>
                    <TableCell className="text-right">
                      {formatPkr(m.revenue)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {formatPkr(m.collections)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getDefaultPeriod() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { periodStart: fmt(start), periodEnd: fmt(now) };
}

export function ReportsPageContent() {
  const { t } = useTranslation();
  const defaults = useMemo(() => getDefaultPeriod(), []);
  const [aging, setAging] = useState<AgingReceivablesReport | null>(null);
  const [profit, setProfit] = useState<ProfitReport | null>(null);
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [profitLoading, setProfitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [periodStart, setPeriodStart] = useState(defaults.periodStart);
  const [periodEnd, setPeriodEnd] = useState(defaults.periodEnd);
  const [appliedPeriod, setAppliedPeriod] = useState(defaults);

  const load = useCallback(
    async (trackLoading = true, period = appliedPeriod) => {
      if (trackLoading) setLoading(true);
      setError(null);
      try {
        const [a, p, k] = await Promise.all([
          reportsApi.agingReceivables(),
          reportsApi.profit({
            periodStart: period.periodStart,
            periodEnd: period.periodEnd,
          }),
          dashboardApi.getKpis(),
        ]);
        setAging(a);
        setProfit(p);
        setKpis(k);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('reports.loadFailed'));
      } finally {
        setLoading(false);
      }
    },
    [appliedPeriod, t],
  );

  const loadProfit = useCallback(async () => {
    setProfitLoading(true);
    setError(null);
    try {
      const p = await reportsApi.profit({
        periodStart: periodStart,
        periodEnd: periodEnd,
      });
      setProfit(p);
      setAppliedPeriod({ periodStart, periodEnd });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('reports.loadFailed'));
    } finally {
      setProfitLoading(false);
    }
  }, [periodStart, periodEnd, t]);

  useEffect(() => {
    queueMicrotask(() => {
      void load(false);
    });
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error && !aging && !profit) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('pages.reports.title')}
          </h1>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => void load()}>
            <RefreshCw className="size-4" />
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('pages.reports.title')}
          </h1>
          <p className="text-muted-foreground">{t('reports.pageSubtitle')}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()}>
          <RefreshCw className="size-4" />
          {t('common.refresh')}
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t('reports.overview')}</TabsTrigger>
          <TabsTrigger value="aging">{t('reports.aging')}</TabsTrigger>
          <TabsTrigger value="sales">{t('reports.sales')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {kpis && profit && aging && (
            <OverviewSection kpis={kpis} profit={profit} aging={aging} />
          )}
        </TabsContent>

        <TabsContent value="aging" className="mt-6">
          {aging ? (
            <AgingSection report={aging} />
          ) : (
            <p className="text-sm text-muted-foreground">{t('reports.noData')}</p>
          )}
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          {profit ? (
            <SalesSection
              report={profit}
              periodStart={periodStart}
              periodEnd={periodEnd}
              onPeriodChange={(start, end) => {
                setPeriodStart(start);
                setPeriodEnd(end);
              }}
              onApplyPeriod={() => void loadProfit()}
              loading={profitLoading}
            />
          ) : (
            <p className="text-sm text-muted-foreground">{t('reports.noData')}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
