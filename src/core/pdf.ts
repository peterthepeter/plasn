import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { getRunTotalWidth } from "./code128";
import { hexToRgb } from "./color";
import { t } from "./i18n";
import { getPdfLabelFontKind } from "./labelFonts";
import { getQrDataUrlMap } from "./qr";
import type {
  GeneratedDocumentLayout,
  LabelTextFontFamily,
  Locale,
  SeparatorPageLayout,
  SeparatorTextLayout,
} from "./types";

const MM_TO_PT = 72 / 25.4;
const DEBUG_FRAME_INSET_MM = 0.18;

function mm(value: number): number {
  return value * MM_TO_PT;
}

function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  measure: (value: string) => number,
): string[] {
  return text
    .split(/\r?\n/)
    .flatMap((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);
      if (words.length === 0) {
        return [""];
      }

      const lines: string[] = [];
      let current = words[0];

      for (const word of words.slice(1)) {
        const next = `${current} ${word}`;
        if (measure(next) <= maxWidth) {
          current = next;
          continue;
        }

        lines.push(current);
        current = word;
      }

      lines.push(current);
      return lines;
    });
}

function drawCenteredTextBlock(
  page: PDFPage,
  block: SeparatorTextLayout,
  pageHeightMm: number,
  font: PDFFont,
  color: { r: number; g: number; b: number },
): void {
  const fontSize = mm(block.fontSizeMm);
  const x = mm(block.xMm);
  const yTop = mm(pageHeightMm - block.yMm);
  const maxWidth = mm(block.widthMm);
  const lines = wrapText(block.text, maxWidth, fontSize, (value) =>
    font.widthOfTextAtSize(value, fontSize),
  );
  const lineHeight = fontSize * 1.28;
  const totalHeight = lineHeight * lines.length;
  let currentY = yTop - (mm(block.heightMm) - totalHeight) / 2 - fontSize;

  for (const line of lines) {
    const lineWidth = font.widthOfTextAtSize(line, fontSize);
    page.drawText(line, {
      x: x + Math.max(0, (maxWidth - lineWidth) / 2),
      y: currentY,
      size: fontSize,
      font,
      color: rgb(color.r / 255, color.g / 255, color.b / 255),
    });
    currentY -= lineHeight;
  }
}

function renderSeparatorPage(
  page: PDFPage,
  pageLayout: SeparatorPageLayout,
  barcodeColorHex: string,
  textColorHex: string,
  regularFont: PDFFont,
  boldFont: PDFFont,
): void {
  const barcodeColor = hexToRgb(barcodeColorHex);
  const textColor = hexToRgb(textColorHex);
  const barcode = pageLayout.barcode;
  const totalUnits = getRunTotalWidth(barcode.runs);
  const unitWidth = barcode.widthMm / totalUnits;
  let cursor = 0;

  barcode.runs.forEach((run, index) => {
    const runWidth = run * unitWidth;
    if (index % 2 === 0) {
      page.drawRectangle({
        x: mm(barcode.xMm + cursor),
        y: mm(pageLayout.pageHeightMm - barcode.yMm - barcode.heightMm),
        width: mm(runWidth),
        height: mm(barcode.heightMm),
        color: rgb(
          barcodeColor.r / 255,
          barcodeColor.g / 255,
          barcodeColor.b / 255,
        ),
      });
    }
    cursor += runWidth;
  });

  drawCenteredTextBlock(
    page,
    pageLayout.headline,
    pageLayout.pageHeightMm,
    pageLayout.headline.bold ? boldFont : regularFont,
    textColor,
  );

  if (pageLayout.freeText) {
    drawCenteredTextBlock(
      page,
      pageLayout.freeText,
      pageLayout.pageHeightMm,
      regularFont,
      textColor,
    );
  }
}

export async function renderPdf(
  layout: GeneratedDocumentLayout,
  locale: Locale,
  qrColor: string,
  textColorHex: string,
  textFontFamily: LabelTextFontFamily,
): Promise<Blob> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(
    layout.kind === "separator"
      ? `${t(locale, "appTitle")} Separator Sheets`
      : `${t(locale, "appTitle")} ASN Labels`,
  );
  pdf.setCreator("Plasn");
  const fontKind = getPdfLabelFontKind(textFontFamily);
  const font = await pdf.embedFont(
    fontKind === "courier" ? StandardFonts.Courier : StandardFonts.Helvetica,
  );
  const boldFont = await pdf.embedFont(
    fontKind === "courier" ? StandardFonts.CourierBold : StandardFonts.HelveticaBold,
  );
  const textColor = hexToRgb(textColorHex);

  if (layout.kind === "separator") {
    for (const pageLayout of layout.pages) {
      const page = pdf.addPage([mm(pageLayout.pageWidthMm), mm(pageLayout.pageHeightMm)]);
      renderSeparatorPage(page, pageLayout, qrColor, textColorHex, font, boldFont);
    }
  } else {
    const qrDataUrlMap = await getQrDataUrlMap(
      layout.pages.flatMap((pageLayout) =>
        pageLayout.items.map((item) => item.encodedText),
      ),
      qrColor,
    );
    const qrImageEntries = await Promise.all(
      Object.entries(qrDataUrlMap).map(async ([encodedText, qrDataUrl]) => [
        encodedText,
        await pdf.embedPng(qrDataUrl),
      ] as const),
    );
    const qrImageMap = Object.fromEntries(qrImageEntries);

    for (const pageLayout of layout.pages) {
      const page = pdf.addPage([mm(pageLayout.pageWidthMm), mm(pageLayout.pageHeightMm)]);
      for (const item of pageLayout.items) {
        const qrImage = qrImageMap[item.encodedText];
        const qrX = mm(item.qrXmm);
        const qrY = mm(pageLayout.pageHeightMm - item.qrYmm - item.qrSizeMm);
        const qrSize = mm(item.qrSizeMm);
        const fontSize = mm(item.textSizeMm);
        const lineHeight = mm(item.textLineHeightMm);
        const blockHeight =
          fontSize + lineHeight * Math.max(item.textLines.length - 1, 0);
        const textTop = mm(pageLayout.pageHeightMm - item.textYmm);
        const textBoxX = mm(item.textXmm);
        const textBoxWidth = mm(item.textWidthMm);
        const scaledFontSize = fontSize * item.textScaleX;
        let textY = textTop - (mm(item.textHeightMm) - blockHeight) / 2 - fontSize;

        if (layout.showBorders) {
          page.drawRectangle({
            x: mm(item.xMm + DEBUG_FRAME_INSET_MM),
            y: mm(
              pageLayout.pageHeightMm -
                item.yMm -
                item.heightMm +
                DEBUG_FRAME_INSET_MM,
            ),
            width: mm(Math.max(0, item.widthMm - DEBUG_FRAME_INSET_MM * 2)),
            height: mm(Math.max(0, item.heightMm - DEBUG_FRAME_INSET_MM * 2)),
            borderColor: rgb(0.62, 0.62, 0.62),
            borderWidth: 0.35,
            opacity: 0.85,
          });
        }

        page.drawImage(qrImage, {
          x: qrX,
          y: qrY,
          width: qrSize,
          height: qrSize,
        });

        for (const line of item.textLines) {
          const lineWidth = font.widthOfTextAtSize(line, scaledFontSize);
          page.drawText(line, {
            x: textBoxX + Math.max(0, (textBoxWidth - lineWidth) / 2),
            y: textY,
            size: scaledFontSize,
            font,
            color: rgb(textColor.r / 255, textColor.g / 255, textColor.b / 255),
          });
          textY -= lineHeight;
        }
      }
    }
  }

  const bytes = await pdf.save();
  const copiedBytes = Uint8Array.from(bytes);
  return new Blob([copiedBytes], { type: "application/pdf" });
}
