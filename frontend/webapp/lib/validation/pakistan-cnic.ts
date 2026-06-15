export const PAKISTAN_CNIC_PATTERN = /^\d{5}-\d{7}-\d{1}$/;

export function normalizePakistanCnicInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function isValidPakistanCnic(value: string): boolean {
  if (!value.trim()) return true;
  return PAKISTAN_CNIC_PATTERN.test(normalizePakistanCnicInput(value));
}

export function formatPakistanCnicForSubmit(value: string): string | undefined {
  const normalized = normalizePakistanCnicInput(value);
  if (!normalized) return undefined;
  return normalized;
}
