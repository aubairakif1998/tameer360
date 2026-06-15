export function formatReceiptNumber(sequence: number): string {
  return `RCP-${String(sequence).padStart(4, '0')}`;
}
