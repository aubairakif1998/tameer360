export function formatOrderNumber(sequence: number): string {
  return `ORD-${String(sequence).padStart(4, '0')}`;
}
