export const MAX_ASN_PREFIX_LENGTH = 5;
export const MAX_ASN_DIGITS = 6;

export function clampAsnDigits(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(MAX_ASN_DIGITS, Math.max(1, Math.round(value)));
}

export function normalizeAsnPrefix(value: string): string {
  return value.slice(0, MAX_ASN_PREFIX_LENGTH);
}
