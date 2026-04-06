export type Locale = "de" | "en";
export type GeneratorMode = "asn" | "separator";
export type SeparatorPaperSize = "a4" | "letter";

export type NumberingDirection = "column" | "row";

export type PresetStatus = "verified" | "provisional";

export interface LabelPreset {
  id: string;
  name: string;
  manufacturer: string;
  status: PresetStatus;
  source: string;
  pageWidthMm: number;
  pageHeightMm: number;
  columns: number;
  rows: number;
  labelWidthMm: number;
  labelHeightMm: number;
  gutterXMm: number;
  gutterYMm: number;
  marginLeftMm: number;
  marginTopMm: number;
  innerPaddingMm: number;
  qrScale: number;
  textGapMm: number;
  minTextSizeMm: number;
  maxTextSizeMm: number;
  isCustom?: boolean;
}

export interface CalibrationProfile {
  id: string;
  name: string;
  presetId: string;
  offsetXMm: number;
  offsetYMm: number;
  pitchAdjustXMm: number;
  pitchAdjustYMm: number;
}

export interface GeneratorConfig {
  locale: Locale;
  startNumber: number;
  endNumber?: number;
  count?: number;
  prefix: string;
  digits: number;
  qrColor: string;
  textColor: string;
  showTextPrefix: boolean;
  showTextLeadingZeros: boolean;
  numberingDirection: NumberingDirection;
  startPosition: string;
  presetId: string;
  calibrationProfileId: string;
  showBorders: boolean;
  customPreset?: LabelPreset;
}

export interface SeparatorConfig {
  separatorPaperSize: SeparatorPaperSize;
  separatorBarcodeValue: string;
  separatorHeadline: string;
  separatorFreeText: string;
  separatorBarcodeColor: string;
  separatorTextColor: string;
}

export interface LayoutWarning {
  code:
    | "countRequired"
    | "invalidRange"
    | "invalidStartPosition"
    | "startPositionOutOfRange"
    | "presetOverflowX"
    | "presetOverflowY"
    | "textTightFit"
    | "separatorInvalidBarcodeValue";
  meta?: Record<string, number | string>;
}

export interface LabelItem {
  id: string;
  sequence: number;
  value: number;
  encodedText: string;
  displayText: string;
  pageIndex: number;
  slotIndex: number;
  row: number;
  column: number;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  qrXmm: number;
  qrYmm: number;
  qrSizeMm: number;
  textXmm: number;
  textYmm: number;
  textOffsetMm: number;
  textWidthMm: number;
  textHeightMm: number;
  textSizeMm: number;
  textScaleX: number;
  isTightFit: boolean;
}

export interface PageLayout {
  pageWidthMm: number;
  pageHeightMm: number;
  items: LabelItem[];
}

export interface GeneratedLayout {
  kind: "asn";
  preset: LabelPreset;
  calibrationProfile: CalibrationProfile;
  pages: PageLayout[];
  warnings: LayoutWarning[];
  resolvedCount: number;
  resolvedEndNumber: number;
  showBorders: boolean;
}

export interface SeparatorBarcodeLayout {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  runs: number[];
}

export interface SeparatorTextLayout {
  text: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  fontSizeMm: number;
  bold?: boolean;
}

export interface SeparatorPageLayout {
  pageWidthMm: number;
  pageHeightMm: number;
  barcode: SeparatorBarcodeLayout;
  headline: SeparatorTextLayout;
  freeText?: SeparatorTextLayout;
}

export interface GeneratedSeparatorLayout {
  kind: "separator";
  pages: SeparatorPageLayout[];
  warnings: LayoutWarning[];
  paperSize: SeparatorPaperSize;
  barcodeValue: string;
  headline: string;
  freeText: string;
}

export type GeneratedDocumentLayout = GeneratedLayout | GeneratedSeparatorLayout;

export interface AppSettings extends GeneratorConfig, SeparatorConfig {
  generatorMode: GeneratorMode;
  customPreset: LabelPreset;
}
