export function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isTenDigitPhone(value: string) {
  return normalizePhoneDigits(value).length === 10;
}

export function formatPhoneNumber(value: string) {
  const digits = normalizePhoneDigits(value);

  if (digits.length !== 10) {
    return digits;
  }

  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
}
