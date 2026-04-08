export const MAX_ASN_PREFIX_LENGTH = 7;
export const MAX_ASN_DIGITS = 7;
export const MAX_SEPARATOR_BARCODE_LENGTH = 20;
export const MAX_SEPARATOR_HEADLINE_LENGTH = 40;
export const MAX_SEPARATOR_FREE_TEXT_LENGTH = 200;

export function clampAsnDigits(value: number): number {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(MAX_ASN_DIGITS, Math.max(1, Math.round(value)));
}

export function normalizeAsnPrefix(value: string): string {
  return value.slice(0, MAX_ASN_PREFIX_LENGTH);
}

export function normalizeSeparatorBarcodeValue(value: string): string {
  return value.slice(0, MAX_SEPARATOR_BARCODE_LENGTH);
}

export function normalizeSeparatorHeadline(value: string): string {
  return value.slice(0, MAX_SEPARATOR_HEADLINE_LENGTH);
}

export function normalizeSeparatorFreeText(value: string): string {
  return value.slice(0, MAX_SEPARATOR_FREE_TEXT_LENGTH);
}
