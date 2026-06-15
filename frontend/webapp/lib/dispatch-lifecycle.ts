import type { DispatchStatus } from '@/lib/api/types';

export const DISPATCH_STATUS_FLOW: DispatchStatus[] = [
  'scheduled',
  'loaded',
  'in_transit',
  'delivered',
];

export function getNextDispatchStatus(
  current: DispatchStatus,
): DispatchStatus | null {
  if (current === 'cancelled' || current === 'delivered') return null;
  const index = DISPATCH_STATUS_FLOW.indexOf(current);
  if (index < 0 || index >= DISPATCH_STATUS_FLOW.length - 1) return null;
  return DISPATCH_STATUS_FLOW[index + 1];
}

export function canCancelDispatch(status: DispatchStatus): boolean {
  return status !== 'delivered' && status !== 'cancelled';
}
