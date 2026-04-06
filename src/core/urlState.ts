import { CUSTOM_PRESET_ID } from "./presets";
import { normalizeHexColor } from "./color";
import type { AppSettings, GeneratorConfig, LabelPreset, Locale } from "./types";

type SearchLike = URLSearchParams | string;

function toParams(input?: SearchLike): URLSearchParams {
  if (input instanceof URLSearchParams) {
    return input;
  }

  if (typeof input === "string") {
    return new URLSearchParams(input.startsWith("?") ? input.slice(1) : input);
  }

  if (typeof window !== "undefined") {
    return new URLSearchParams(window.location.search);
  }

  return new URLSearchParams();
}

function parseNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseUrlState(
  baseSettings: AppSettings,
  input?: SearchLike,
): AppSettings {
  const params = toParams(input);
  const presetId = params.get("presetId") ?? baseSettings.presetId;
  const customPreset = { ...baseSettings.customPreset };

  if (presetId === CUSTOM_PRESET_ID) {
    customPreset.columns = parseNumber(params.get("cCols")) ?? customPreset.columns;
    customPreset.rows = parseNumber(params.get("cRows")) ?? customPreset.rows;
    customPreset.pageWidthMm =
      parseNumber(params.get("cPageW")) ?? customPreset.pageWidthMm;
    customPreset.pageHeightMm =
      parseNumber(params.get("cPageH")) ?? customPreset.pageHeightMm;
    customPreset.labelWidthMm =
      parseNumber(params.get("cLabelW")) ?? customPreset.labelWidthMm;
    customPreset.labelHeightMm =
      parseNumber(params.get("cLabelH")) ?? customPreset.labelHeightMm;
    customPreset.gutterXMm =
      parseNumber(params.get("cGapX")) ?? customPreset.gutterXMm;
    customPreset.gutterYMm =
      parseNumber(params.get("cGapY")) ?? customPreset.gutterYMm;
    customPreset.marginLeftMm =
      parseNumber(params.get("cMarginL")) ?? customPreset.marginLeftMm;
    customPreset.marginTopMm =
      parseNumber(params.get("cMarginT")) ?? customPreset.marginTopMm;
    customPreset.innerPaddingMm =
      parseNumber(params.get("cPad")) ?? customPreset.innerPaddingMm;
    customPreset.qrScale =
      parseNumber(params.get("cQrScale")) ?? customPreset.qrScale;
    customPreset.textGapMm =
      parseNumber(params.get("cTextGap")) ?? customPreset.textGapMm;
  }

  return {
    ...baseSettings,
    locale: ((params.get("locale") as Locale | null) ?? baseSettings.locale) as Locale,
    generatorMode:
      (params.get("mode") as AppSettings["generatorMode"] | null) ??
      baseSettings.generatorMode,
    startNumber: parseNumber(params.get("start")) ?? baseSettings.startNumber,
    endNumber: parseNumber(params.get("end")),
    count: parseNumber(params.get("count")) ?? baseSettings.count,
    prefix: params.get("prefix") ?? baseSettings.prefix,
    digits: parseNumber(params.get("digits")) ?? baseSettings.digits,
    qrColor: params.has("qrColor")
      ? normalizeHexColor(params.get("qrColor") ?? baseSettings.qrColor)
      : params.has("color")
        ? normalizeHexColor(params.get("color") ?? baseSettings.qrColor)
        : baseSettings.qrColor,
    textColor: params.has("textColor")
      ? normalizeHexColor(params.get("textColor") ?? baseSettings.textColor)
      : params.has("color")
        ? normalizeHexColor(params.get("color") ?? baseSettings.textColor)
        : baseSettings.textColor,
    showTextPrefix:
      params.has("showTextPrefix")
        ? params.get("showTextPrefix") === "true"
        : baseSettings.showTextPrefix,
    showTextLeadingZeros:
      params.has("showTextLeadingZeros")
        ? params.get("showTextLeadingZeros") === "true"
        : baseSettings.showTextLeadingZeros,
    numberingDirection:
      (params.get("direction") as GeneratorConfig["numberingDirection"] | null) ??
      baseSettings.numberingDirection,
    startPosition: params.get("startPos") ?? baseSettings.startPosition,
    presetId,
    calibrationProfileId:
      params.get("calibrationProfileId") ?? baseSettings.calibrationProfileId,
    showBorders:
      params.has("borders")
        ? params.get("borders") === "true"
        : baseSettings.showBorders,
    separatorPaperSize:
      (params.get("separatorPaper") as AppSettings["separatorPaperSize"] | null) ??
      baseSettings.separatorPaperSize,
    separatorBarcodeValue:
      params.get("separatorBarcode") ?? baseSettings.separatorBarcodeValue,
    separatorHeadline:
      params.get("separatorHeadline") ?? baseSettings.separatorHeadline,
    separatorFreeText:
      params.get("separatorFreeText") ?? baseSettings.separatorFreeText,
    separatorBarcodeColor: params.has("separatorBarcodeColor")
      ? normalizeHexColor(
          params.get("separatorBarcodeColor") ?? baseSettings.separatorBarcodeColor,
        )
      : baseSettings.separatorBarcodeColor,
    separatorTextColor: params.has("separatorTextColor")
      ? normalizeHexColor(
          params.get("separatorTextColor") ?? baseSettings.separatorTextColor,
        )
      : baseSettings.separatorTextColor,
    customPreset,
  };
}

export function writeUrlState(settings: AppSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams();
  params.set("locale", settings.locale);
  params.set("mode", settings.generatorMode);
  params.set("start", String(settings.startNumber));
  if (settings.endNumber) {
    params.set("end", String(settings.endNumber));
  }
  if (settings.count) {
    params.set("count", String(settings.count));
  }
  params.set("prefix", settings.prefix);
  params.set("digits", String(settings.digits));
  params.set("qrColor", normalizeHexColor(settings.qrColor));
  params.set("textColor", normalizeHexColor(settings.textColor));
  params.set("showTextPrefix", String(settings.showTextPrefix));
  params.set("showTextLeadingZeros", String(settings.showTextLeadingZeros));
  params.set("direction", settings.numberingDirection);
  params.set("startPos", settings.startPosition);
  params.set("presetId", settings.presetId);
  params.set("calibrationProfileId", settings.calibrationProfileId);
  params.set("borders", String(settings.showBorders));
  params.set("separatorPaper", settings.separatorPaperSize);
  params.set("separatorBarcode", settings.separatorBarcodeValue);
  params.set("separatorHeadline", settings.separatorHeadline);
  if (settings.separatorFreeText) {
    params.set("separatorFreeText", settings.separatorFreeText);
  }
  params.set(
    "separatorBarcodeColor",
    normalizeHexColor(settings.separatorBarcodeColor),
  );
  params.set("separatorTextColor", normalizeHexColor(settings.separatorTextColor));

  if (settings.presetId === CUSTOM_PRESET_ID) {
    const custom = settings.customPreset;
    params.set("cCols", String(custom.columns));
    params.set("cRows", String(custom.rows));
    params.set("cPageW", String(custom.pageWidthMm));
    params.set("cPageH", String(custom.pageHeightMm));
    params.set("cLabelW", String(custom.labelWidthMm));
    params.set("cLabelH", String(custom.labelHeightMm));
    params.set("cGapX", String(custom.gutterXMm));
    params.set("cGapY", String(custom.gutterYMm));
    params.set("cMarginL", String(custom.marginLeftMm));
    params.set("cMarginT", String(custom.marginTopMm));
    params.set("cPad", String(custom.innerPaddingMm));
    params.set("cQrScale", String(custom.qrScale));
    params.set("cTextGap", String(custom.textGapMm));
  }

  const query = params.toString();
  const nextUrl = query ? `${window.location.pathname}?${query}` : window.location.pathname;
  window.history.replaceState({}, "", nextUrl);
}
