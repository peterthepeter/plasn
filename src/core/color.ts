const HEX_COLOR_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
const FALLBACK_COLOR = "#000000";

function expandShortHex(hex: string): string {
  return hex
    .split("")
    .map((char) => `${char}${char}`)
    .join("");
}

export function normalizeHexColor(
  value: string | undefined,
  fallback = FALLBACK_COLOR,
): string {
  const trimmed = value?.trim() ?? "";
  const match = HEX_COLOR_PATTERN.exec(trimmed);

  if (!match) {
    return fallback;
  }

  const normalized = match[1].length === 3 ? expandShortHex(match[1]) : match[1];
  return `#${normalized.toUpperCase()}`;
}

export function hexToRgb(value: string): { r: number; g: number; b: number } {
  const normalized = normalizeHexColor(value).slice(1);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}
