import { getPresetById } from "./presets";
import { clampCalibrationQrScalePercent } from "./limits";
import type {
  CalibrationProfile,
  GeneratedLayout,
  GeneratorConfig,
  LabelItem,
  LabelPreset,
  LayoutWarning,
  NumberingDirection,
  PageLayout,
} from "./types";

const MIN_TEXT_SIZE_WARNING_MARGIN = 0.15;

function makeWarning(
  code: LayoutWarning["code"],
  meta?: Record<string, number | string>,
): LayoutWarning {
  return { code, meta };
}

function parseStartPosition(
  input: string,
  preset: LabelPreset,
  _numberingDirection: NumberingDirection,
): { slotIndex: number; warning?: LayoutWarning } {
  const trimmed = input.trim();
  const absolute = Number(trimmed);
  if (!Number.isInteger(absolute) || absolute < 1) {
    return { slotIndex: 0, warning: makeWarning("invalidStartPosition") };
  }

  const zeroBased = absolute - 1;
  if (zeroBased >= preset.rows * preset.columns) {
    return { slotIndex: 0, warning: makeWarning("startPositionOutOfRange") };
  }

  return { slotIndex: zeroBased };
}

function resolveCount(config: GeneratorConfig): {
  count: number;
  resolvedEndNumber: number;
  warning?: LayoutWarning;
} {
  if (typeof config.endNumber === "number") {
    if (config.endNumber < config.startNumber) {
      return {
        count: 0,
        resolvedEndNumber: config.startNumber,
        warning: makeWarning("invalidRange"),
      };
    }

    return {
      count: config.endNumber - config.startNumber + 1,
      resolvedEndNumber: config.endNumber,
    };
  }

  if (!config.count || config.count < 1) {
    return {
      count: 0,
      resolvedEndNumber: config.startNumber,
      warning: makeWarning("countRequired"),
    };
  }

  return {
    count: config.count,
    resolvedEndNumber: config.startNumber + config.count - 1,
  };
}

function getSlotCoordinates(
  pageSlotIndex: number,
  preset: LabelPreset,
  direction: NumberingDirection,
): { row: number; column: number } {
  if (direction === "column") {
    return {
      column: Math.floor(pageSlotIndex / preset.rows),
      row: pageSlotIndex % preset.rows,
    };
  }

  return {
    row: Math.floor(pageSlotIndex / preset.columns),
    column: pageSlotIndex % preset.columns,
  };
}

function fitTextBlockSizeMm(
  lines: string[],
  textWidthMm: number,
  textHeightMm: number,
  preset: LabelPreset,
): {
  sizeMm: number;
  lineHeightMm: number;
  textScaleX: number;
  textOffsetMm: number;
  isTightFit: boolean;
} {
  const widestLine = lines.reduce(
    (widest, line) => (line.length > widest.length ? line : widest),
    "",
  );
  const widthFactor = widestLine.length <= 7 ? 0.63 : 0.69;
  const lineCount = Math.max(lines.length, 1);
  const widthBased = textWidthMm / Math.max(widestLine.length * widthFactor, 1);
  const heightFactor = lineCount === 1 ? 0.64 : 1 / (lineCount * 0.92);
  const heightBased = textHeightMm * heightFactor;
  const candidate = Math.min(widthBased, heightBased, preset.maxTextSizeMm);
  const sizeMm = Math.max(1.2, Math.min(candidate, preset.maxTextSizeMm));
  const lineHeightMm = sizeMm * (lineCount === 1 ? 1 : 0.92);
  const requiredWidth = sizeMm * Math.max(widestLine.length * widthFactor, 1);
  const textScaleX =
    requiredWidth <= textWidthMm ? 1 : Math.max(0.76, textWidthMm / requiredWidth);
  const renderedWidth = requiredWidth * textScaleX;
  const freeSpace = Math.max(0, textWidthMm - renderedWidth);
  const textOffsetMm =
    freeSpace > 0.7 ? Math.min(freeSpace / 2, textWidthMm * 0.34) : 0;
  return {
    sizeMm,
    lineHeightMm,
    textScaleX,
    textOffsetMm,
    isTightFit:
      candidate < preset.minTextSizeMm + MIN_TEXT_SIZE_WARNING_MARGIN ||
      textScaleX < 0.96,
  };
}

function validatePresetGeometry(preset: LabelPreset, warnings: LayoutWarning[]): void {
  const totalWidth =
    preset.marginLeftMm +
    preset.columns * preset.labelWidthMm +
    (preset.columns - 1) * preset.gutterXMm;
  const totalHeight =
    preset.marginTopMm +
    preset.rows * preset.labelHeightMm +
    (preset.rows - 1) * preset.gutterYMm;

  if (totalWidth > preset.pageWidthMm + 0.01) {
    warnings.push(makeWarning("presetOverflowX"));
  }
  if (totalHeight > preset.pageHeightMm + 0.01) {
    warnings.push(makeWarning("presetOverflowY"));
  }
}

function buildEncodedText(prefix: string, digits: number, value: number): string {
  return `${prefix}${String(value).padStart(digits, "0")}`;
}

function buildDisplayLines(
  prefix: string,
  digits: number,
  value: number,
  showTextPrefix: boolean,
  showTextLeadingZeros: boolean,
): string[] {
  const numberPart = showTextLeadingZeros
    ? String(value).padStart(digits, "0")
    : String(value);
  const trimmedPrefix = prefix.trim();
  return showTextPrefix && trimmedPrefix ? [trimmedPrefix, numberPart] : [numberPart];
}

export function generateLayout(
  config: GeneratorConfig,
  calibrationProfile: CalibrationProfile,
): GeneratedLayout {
  const preset = getPresetById(config.presetId, config.customPreset);
  const warnings: LayoutWarning[] = [];
  validatePresetGeometry(preset, warnings);

  const { count, resolvedEndNumber, warning: countWarning } = resolveCount(config);
  if (countWarning) {
    warnings.push(countWarning);
  }

  const { slotIndex: startSlotIndex, warning: startWarning } = parseStartPosition(
    config.startPosition,
    preset,
    config.numberingDirection,
  );
  if (startWarning) {
    warnings.push(startWarning);
  }

  const pages: PageLayout[] = [];
  const slotsPerPage = preset.rows * preset.columns;
  let tightFitFound = false;

  for (let sequence = 0; sequence < count; sequence += 1) {
    const absoluteSlot = startSlotIndex + sequence;
    const pageIndex = Math.floor(absoluteSlot / slotsPerPage);
    const pageSlotIndex = absoluteSlot % slotsPerPage;
    const { row, column } = getSlotCoordinates(
      pageSlotIndex,
      preset,
      config.numberingDirection,
    );
    const page = (pages[pageIndex] ??= {
      pageWidthMm: preset.pageWidthMm,
      pageHeightMm: preset.pageHeightMm,
      items: [],
    });
    const xMm =
      preset.marginLeftMm +
      column * (preset.labelWidthMm + preset.gutterXMm + calibrationProfile.pitchAdjustXMm) +
      calibrationProfile.offsetXMm;
    const yMm =
      preset.marginTopMm +
      row * (preset.labelHeightMm + preset.gutterYMm + calibrationProfile.pitchAdjustYMm) +
      calibrationProfile.offsetYMm;
    const value = config.startNumber + sequence;
    const encodedText = buildEncodedText(config.prefix, config.digits, value);
    const textLines = buildDisplayLines(
      config.prefix,
      config.digits,
      value,
      config.showTextPrefix,
      config.showTextLeadingZeros,
    );
    const displayText = textLines.join(" ");
    const qrSizeMm = Math.max(
      4,
      Math.min(
        preset.labelHeightMm - preset.innerPaddingMm * 2,
        preset.labelHeightMm * preset.qrScale,
      ),
    );
    const qrScaleFactor =
      clampCalibrationQrScalePercent(calibrationProfile.qrScalePercent) / 100;
    const scaledQrSizeMm = qrSizeMm * qrScaleFactor;
    const qrBoxXmm = xMm + preset.innerPaddingMm;
    const qrXmm = qrBoxXmm + (qrSizeMm - scaledQrSizeMm) / 2;
    const qrYmm = yMm + (preset.labelHeightMm - scaledQrSizeMm) / 2;
    const textXmm = qrBoxXmm + qrSizeMm + preset.textGapMm;
    const textWidthMm =
      preset.labelWidthMm - preset.innerPaddingMm * 2 - qrSizeMm - preset.textGapMm;
    const textHeightMm = preset.labelHeightMm - preset.innerPaddingMm * 2;
    const { sizeMm, lineHeightMm, textScaleX, textOffsetMm, isTightFit } = fitTextBlockSizeMm(
      textLines,
      textWidthMm,
      textHeightMm,
      preset,
    );

    if (isTightFit) {
      tightFitFound = true;
    }

    const item: LabelItem = {
      id: `${pageIndex}-${pageSlotIndex}-${encodedText}`,
      sequence,
      value,
      encodedText,
      displayText,
      textLines,
      pageIndex,
      slotIndex: pageSlotIndex,
      row,
      column,
      xMm,
      yMm,
      widthMm: preset.labelWidthMm,
      heightMm: preset.labelHeightMm,
      qrXmm,
      qrYmm,
      qrSizeMm: scaledQrSizeMm,
      textXmm,
      textYmm: yMm + preset.innerPaddingMm,
      textOffsetMm,
      textWidthMm,
      textHeightMm,
      textSizeMm: sizeMm,
      textLineHeightMm: lineHeightMm,
      textScaleX,
      isTightFit,
    };
    page.items.push(item);
  }

  if (tightFitFound) {
    warnings.push(makeWarning("textTightFit"));
  }

  return {
    kind: "asn",
    preset,
    calibrationProfile,
    pages,
    warnings,
    resolvedCount: count,
    resolvedEndNumber,
    showBorders: config.showBorders,
  };
}
