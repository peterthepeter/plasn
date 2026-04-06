import { encodeCode128B } from "./code128";
import type {
  GeneratedSeparatorLayout,
  LayoutWarning,
  SeparatorConfig,
  SeparatorPageLayout,
  SeparatorPaperSize,
} from "./types";

const PAPER_SIZES: Record<
  SeparatorPaperSize,
  { pageWidthMm: number; pageHeightMm: number }
> = {
  a4: {
    pageWidthMm: 210,
    pageHeightMm: 297,
  },
  letter: {
    pageWidthMm: 215.9,
    pageHeightMm: 279.4,
  },
};

function makeWarning(
  code: LayoutWarning["code"],
  meta?: Record<string, number | string>,
): LayoutWarning {
  return { code, meta };
}

function fallbackBarcodeValue(value: string): string {
  const trimmed = value.trim();
  return trimmed === "" ? "PATCHT" : trimmed;
}

export function generateSeparatorLayout(
  config: SeparatorConfig,
): GeneratedSeparatorLayout {
  const requestedBarcodeValue = fallbackBarcodeValue(config.separatorBarcodeValue);
  let barcodeValue = requestedBarcodeValue;
  const freeText = config.separatorFreeText.trim();
  const paperSize = PAPER_SIZES[config.separatorPaperSize];
  const warnings: LayoutWarning[] = [];

  let runs: number[];
  try {
    runs = encodeCode128B(barcodeValue);
  } catch {
    warnings.push(makeWarning("separatorInvalidBarcodeValue"));
    barcodeValue = "PATCHT";
    runs = encodeCode128B(barcodeValue);
  }
  const rawHeadline = config.separatorHeadline.trim();
  const headline =
    rawHeadline === "" || rawHeadline === requestedBarcodeValue
      ? barcodeValue
      : rawHeadline;

  const page: SeparatorPageLayout = {
    pageWidthMm: paperSize.pageWidthMm,
    pageHeightMm: paperSize.pageHeightMm,
    headline: {
      text: headline,
      xMm: 22,
      yMm: 26,
      widthMm: paperSize.pageWidthMm - 44,
      heightMm: 18,
      fontSizeMm: 9.2,
      bold: true,
    },
    barcode: {
      xMm: 22,
      yMm: 86,
      widthMm: paperSize.pageWidthMm - 44,
      heightMm: 44,
      runs,
    },
    freeText:
      freeText !== ""
        ? {
            text: freeText,
            xMm: 28,
            yMm: 154,
            widthMm: paperSize.pageWidthMm - 56,
            heightMm: 72,
            fontSizeMm: 4.6,
          }
        : undefined,
  };

  return {
    kind: "separator",
    pages: [page],
    warnings,
    paperSize: config.separatorPaperSize,
    barcodeValue,
    headline,
    freeText,
  };
}
