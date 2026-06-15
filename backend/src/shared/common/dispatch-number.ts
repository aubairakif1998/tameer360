export function formatDispatchNumber(sequence: number): string {
  return `DSP-${String(sequence).padStart(4, '0')}`;
}
