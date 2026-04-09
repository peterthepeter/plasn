export const MAX_ASN_PREFIX_LENGTH = 7;
export const MAX_ASN_DIGITS = 7;
export const MAX_COUNT = 9999;
export const MAX_COUNT_LENGTH = 4;
export const MAX_PAGE_COUNT = 10;
export const MAX_PAGE_COUNT_LENGTH = 2;
export const MAX_START_POSITION_LENGTH = 3;
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

export function normalizeStartPosition(value: string): string {
  return value.replaceAll(/\D+/g, "").slice(0, MAX_START_POSITION_LENGTH);
}

export function clampCount(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.min(MAX_COUNT, Math.max(1, Math.round(value)));
}

export function normalizeCountInput(value: string): string {
  return value.replaceAll(/\D+/g, "").slice(0, MAX_COUNT_LENGTH);
}

export function clampPageCount(value: number | undefined): number | undefined {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.min(MAX_PAGE_COUNT, Math.max(1, Math.round(value)));
}

export function normalizePageCountInput(value: string): string {
  return value.replaceAll(/\D+/g, "").slice(0, MAX_PAGE_COUNT_LENGTH);
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
