/** Pakistan mobile in international form: +92-3XX-XXXXXXX */
export const PAKISTAN_PHONE_SUBMIT_PATTERN = /^\+92-\d{3}-\d{7}$/;

export function normalizePakistanPhoneInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  const digits = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('+92')) {
    const national = digits.slice(2);
    if (national.length <= 3) return `+92-${national}`;
    return `+92-${national.slice(0, 3)}-${national.slice(3, 10)}`;
  }

  if (digits.startsWith('92') && digits.length >= 12) {
    const national = digits.slice(2, 12);
    return `+92-${national.slice(0, 3)}-${national.slice(3)}`;
  }

  if (digits.startsWith('0') && digits.length >= 11) {
    const national = digits.slice(1, 11);
    return `+92-${national.slice(0, 3)}-${national.slice(3)}`;
  }

  if (digits.length <= 3) return `+92-${digits}`;
  return `+92-${digits.slice(0, 3)}-${digits.slice(3, 10)}`;
}

export function isValidPakistanPhone(value: string): boolean {
  if (!value.trim()) return false;
  return PAKISTAN_PHONE_SUBMIT_PATTERN.test(normalizePakistanPhoneInput(value));
}

export function formatPakistanPhoneForSubmit(value: string): string {
  return normalizePakistanPhoneInput(value);
}
