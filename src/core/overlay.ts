import type { CalibrationProfile, LabelPreset } from "./types";

export interface OverlaySlot {
  index: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}

export interface OverlayLayout {
  pageWidthMm: number;
  pageHeightMm: number;
  slots: OverlaySlot[];
}

export function generateOverlayLayout(
  preset: LabelPreset,
  calibrationProfile: CalibrationProfile,
): OverlayLayout {
  const slots: OverlaySlot[] = [];

  for (let row = 0; row < preset.rows; row += 1) {
    for (let column = 0; column < preset.columns; column += 1) {
      const index = row * preset.columns + column + 1;
      const xMm =
        preset.marginLeftMm +
        column * (preset.labelWidthMm + preset.gutterXMm + calibrationProfile.pitchAdjustXMm) +
        calibrationProfile.offsetXMm;
      const yMm =
        preset.marginTopMm +
        row * (preset.labelHeightMm + preset.gutterYMm + calibrationProfile.pitchAdjustYMm) +
        calibrationProfile.offsetYMm;

      slots.push({
        index,
        xMm,
        yMm,
        widthMm: preset.labelWidthMm,
        heightMm: preset.labelHeightMm,
      });
    }
  }

  return {
    pageWidthMm: preset.pageWidthMm,
    pageHeightMm: preset.pageHeightMm,
    slots,
  };
}
