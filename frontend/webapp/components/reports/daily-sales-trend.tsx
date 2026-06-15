'use client';

import { useTranslation } from '@/components/providers/locale-provider';
import { formatPkr } from '@/lib/format';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type DailyTrendDay = {
  date: string;
  dispatchAmount: string;
  paymentAmount: string;
};

function formatDayLabel(date: string) {
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString('en-PK', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function sumAmount(days: DailyTrendDay[], key: 'dispatchAmount' | 'paymentAmount') {
  return days.reduce((sum, d) => sum + Number(d[key]), 0);
}

export function DailySalesTrend({ trend }: { trend: DailyTrendDay[] }) {
  const { t } = useTranslation();

  const totalSales = sumAmount(trend, 'dispatchAmount');
  const totalCollections = sumAmount(trend, 'paymentAmount');
  const gap = Math.max(totalSales - totalCollections, 0);
  const hasActivity = trend.some(
    (d) => Number(d.dispatchAmount) > 0 || Number(d.paymentAmount) > 0,
  );

  if (!hasActivity) {
    return (
      <p className="text-sm text-muted-foreground">{t('reports.trendNoActivity')}</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border px-3 py-2.5">
          <p className="text-xs text-muted-foreground">{t('reports.weekSales')}</p>
          <p className="text-lg font-semibold text-amber-600">{formatPkr(totalSales)}</p>
        </div>
        <div className="rounded-lg border px-3 py-2.5">
          <p className="text-xs text-muted-foreground">
            {t('reports.weekCollections')}
          </p>
          <p className="text-lg font-semibold text-emerald-600">
            {formatPkr(totalCollections)}
          </p>
        </div>
        <div className="rounded-lg border px-3 py-2.5">
          <p className="text-xs text-muted-foreground">{t('reports.weekGap')}</p>
          <p
            className={`text-lg font-semibold ${gap > 0 ? 'text-amber-600' : 'text-muted-foreground'}`}
          >
            {gap > 0 ? formatPkr(gap) : '—'}
          </p>
        </div>
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-amber-500" />
          {t('reports.salesOut')}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-emerald-500" />
          {t('reports.cashIn')}
        </span>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('common.date')}</TableHead>
            <TableHead className="text-right">{t('reports.salesOut')}</TableHead>
            <TableHead className="text-right">{t('reports.cashIn')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trend.map((day) => {
            const sales = Number(day.dispatchAmount);
            const collections = Number(day.paymentAmount);
            const isEmpty = sales === 0 && collections === 0;

            return (
              <TableRow
                key={day.date}
                className={isEmpty ? 'text-muted-foreground/60' : undefined}
              >
                <TableCell className="font-medium">{formatDayLabel(day.date)}</TableCell>
                <TableCell
                  className={`text-right tabular-nums ${sales > 0 ? 'font-medium text-amber-600' : ''}`}
                >
                  {sales > 0 ? formatPkr(sales) : '—'}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums ${collections > 0 ? 'font-medium text-emerald-600' : ''}`}
                >
                  {collections > 0 ? formatPkr(collections) : '—'}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow className="bg-muted/40 font-semibold">
            <TableCell>{t('reports.weekTotal')}</TableCell>
            <TableCell className="text-right tabular-nums text-amber-600">
              {formatPkr(totalSales)}
            </TableCell>
            <TableCell className="text-right tabular-nums text-emerald-600">
              {formatPkr(totalCollections)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
