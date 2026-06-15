export function defaultDispatchSchedule(order?: {
  expectedDeliveryDate: string | null;
}) {
  const date =
    order?.expectedDeliveryDate ?? new Date().toISOString().slice(0, 10);
  return {
    scheduledStartAt: `${date}T08:00`,
    expectedDeliveryAt: `${date}T17:00`,
  };
}

export function isScheduleValid(startLocal: string, endLocal: string): boolean {
  const start = new Date(startLocal).getTime();
  const end = new Date(endLocal).getTime();
  return !Number.isNaN(start) && !Number.isNaN(end) && end > start;
}

export function toIsoDatetime(localValue: string): string {
  return new Date(localValue).toISOString();
}

export function toDatetimeLocalValue(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDispatchDatetime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export const DEFAULT_PICKUP_LOCATION = 'Yard';
