import type { DispatchStatus } from './dispatch.entity';

export const DISPATCH_STATUS_FLOW: DispatchStatus[] = [
  'scheduled',
  'loaded',
  'in_transit',
  'delivered',
];

export function getDispatchStatusIndex(status: DispatchStatus): number {
  if (status === 'cancelled') return -1;
  return DISPATCH_STATUS_FLOW.indexOf(status);
}

export function canTransitionDispatchStatus(
  from: DispatchStatus,
  to: DispatchStatus,
): boolean {
  if (from === to) return true;
  if (from === 'delivered' || from === 'cancelled') return false;
  if (to === 'cancelled') return true;

  const fromIndex = getDispatchStatusIndex(from);
  const toIndex = getDispatchStatusIndex(to);
  if (fromIndex < 0 || toIndex < 0) return false;

  return toIndex > fromIndex;
}

export function getNextDispatchStatus(
  current: DispatchStatus,
): DispatchStatus | null {
  if (current === 'cancelled' || current === 'delivered') return null;
  const index = getDispatchStatusIndex(current);
  if (index < 0 || index >= DISPATCH_STATUS_FLOW.length - 1) return null;
  return DISPATCH_STATUS_FLOW[index + 1];
}
