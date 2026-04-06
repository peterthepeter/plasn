import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { t } from "./i18n";
import { generateOverlayLayout } from "./overlay";
import type { CalibrationProfile, LabelPreset, Locale } from "./types";

const MM_TO_PT = 72 / 25.4;

function mm(value: number): number {
  return value * MM_TO_PT;
}

export async function renderOverlayPdf(
  preset: LabelPreset,
  calibrationProfile: CalibrationProfile,
  locale: Locale,
): Promise<Blob> {
  const overlay = generateOverlayLayout(preset, calibrationProfile);
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${t(locale, "buttonOverlayPdf")} ${preset.manufacturer} ${preset.name}`);
  pdf.setCreator("Plasn");

  const page = pdf.addPage([mm(overlay.pageWidthMm), mm(overlay.pageHeightMm)]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const textColor = rgb(0.45, 0.45, 0.45);
  const strokeColor = rgb(0.55, 0.55, 0.55);

  for (const slot of overlay.slots) {
    page.drawRectangle({
      x: mm(slot.xMm),
      y: mm(overlay.pageHeightMm - slot.yMm - slot.heightMm),
      width: mm(slot.widthMm),
      height: mm(slot.heightMm),
      borderColor: strokeColor,
      borderWidth: 0.45,
    });

    if (slot.widthMm >= 15 && slot.heightMm >= 8) {
      page.drawText(String(slot.index), {
        x: mm(slot.xMm + Math.min(1.3, slot.widthMm * 0.12)),
        y: mm(overlay.pageHeightMm - slot.yMm - Math.min(2.8, slot.heightMm * 0.32)),
        size: mm(Math.min(2.3, slot.heightMm * 0.22)),
        font,
        color: textColor,
      });
    }
  }

  const bytes = await pdf.save();
  return new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
}
