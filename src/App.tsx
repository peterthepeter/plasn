import { useEffect, useRef, useState } from "preact/hooks";
import { CalibrationPanel } from "./components/CalibrationPanel";
import { ColorField } from "./components/ColorField";
import { DirectionField } from "./components/DirectionField";
import { NumberInput } from "./components/NumberInput";
import { PreviewPanel } from "./components/PreviewPanel";
import { PreviewActions } from "./components/PreviewActions";
import { normalizeHexColor } from "./core/color";
import {
  clampCount,
  clampAsnDigits,
  MAX_COUNT_LENGTH,
  MAX_ASN_DIGITS,
  MAX_ASN_PREFIX_LENGTH,
  MAX_PAGE_COUNT,
  MAX_SEPARATOR_BARCODE_LENGTH,
  MAX_SEPARATOR_FREE_TEXT_LENGTH,
  MAX_SEPARATOR_HEADLINE_LENGTH,
  normalizeAsnPrefix,
  normalizeCountInput,
  clampPageCount,
  normalizePageCountInput,
  normalizeSeparatorBarcodeValue,
  normalizeSeparatorFreeText,
  normalizeSeparatorHeadline,
  normalizeStartPosition,
} from "./core/limits";
import { LABEL_TEXT_FONT_OPTIONS } from "./core/labelFonts";
import { generateLayout } from "./core/layout";
import { fallbackBarcodeValue, generateSeparatorLayout } from "./core/separatorLayout";
import { t, warningMessage } from "./core/i18n";
import { CUSTOM_PRESET_ID, getPresetById, PRESET_LIBRARY } from "./core/presets";
import { printLayout } from "./core/print";
import {
  createDefaultCalibrationProfile,
  createDefaultSettings,
  ensureCalibrationProfiles,
  loadCalibrationProfiles,
  loadSettings,
  parseCalibrationProfilesImport,
  saveCalibrationProfiles,
  saveSettings,
  serializeCalibrationProfiles,
  toAppSettings,
} from "./core/storage";
import type {
  AppSettings,
  CalibrationProfile,
  GeneratedDocumentLayout,
  GeneratorConfig,
  LabelPreset,
  Locale,
  SeparatorConfig,
  SeparatorPaperSize,
  ThemeMode,
} from "./core/types";

const REPOSITORY_URL = "https://github.com/peterthepeter/plasn";
const ISSUES_URL = "https://github.com/peterthepeter/plasn/issues";

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}`;
}

function numericValue(value: string): number | undefined {
  if (value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function formatPresetLabel(locale: Locale, preset: LabelPreset): string {
  const statusKey =
    preset.status === "verified"
      ? "outputPresetStatusVerified"
      : "outputPresetStatusProvisional";
  return t(locale, "sheetStatus", {
    manufacturer: preset.manufacturer,
    name: preset.name,
    status: t(locale, statusKey),
  });
}

function detectSheetSizeLabel(preset: LabelPreset): string {
  const width = Math.round(preset.pageWidthMm);
  const height = Math.round(preset.pageHeightMm);

  if (
    (width === 210 && height === 297) ||
    (width === 297 && height === 210)
  ) {
    return "A4";
  }

  if (
    (width === 148 && height === 210) ||
    (width === 210 && height === 148)
  ) {
    return "A5";
  }

  return `${width}x${height} mm`;
}

function formatPresetOptionLabel(preset: LabelPreset): string {
  const labelCount = preset.columns * preset.rows;
  const sheetSize = detectSheetSizeLabel(preset);
  return `${preset.manufacturer} ${preset.name} (${labelCount} labels, ${sheetSize})`;
}

function getPresetSheetCount(presetId: string, customPreset: LabelPreset): number {
  if (presetId === CUSTOM_PRESET_ID) {
    return customPreset.columns * customPreset.rows;
  }

  const preset = PRESET_LIBRARY.find((entry) => entry.id === presetId);
  if (!preset) {
    return customPreset.columns * customPreset.rows;
  }

  return preset.columns * preset.rows;
}

function getSuggestedEndNumber(settings: AppSettings): number {
  const count = Math.max(0, settings.count ?? 0);
  return Math.max(settings.startNumber, settings.startNumber + count - 1);
}

function getRawStartSlot(settings: AppSettings): number {
  const slotsPerPage = Math.max(
    1,
    getPresetSheetCount(settings.presetId, settings.customPreset),
  );
  const normalizedValue = Number(
    normalizeStartPosition(settings.startPosition) || "1",
  );

  return Math.min(slotsPerPage, Math.max(1, normalizedValue || 1));
}

function usesSinglePageStartPosition(settings: AppSettings): boolean {
  return (
    getRequestedLabelCount(settings) <=
    Math.max(1, getPresetSheetCount(settings.presetId, settings.customPreset))
  );
}

function getClampedStartSlot(settings: AppSettings): number {
  return usesSinglePageStartPosition(settings) ? getRawStartSlot(settings) : 1;
}

function getMaxLabelCountForPageLimit(settings: AppSettings): number {
  const slotsPerPage = Math.max(
    1,
    getPresetSheetCount(settings.presetId, settings.customPreset),
  );
  const startOffset = getClampedStartSlot(settings) - 1;
  return Math.max(1, slotsPerPage * MAX_PAGE_COUNT - startOffset);
}

function getRequestedLabelCount(settings: AppSettings): number {
  if (settings.endNumber !== undefined) {
    return Math.max(1, settings.endNumber - settings.startNumber + 1);
  }

  return Math.max(
    1,
    settings.count ??
      Math.max(1, getPresetSheetCount(settings.presetId, settings.customPreset)),
  );
}

function getConfiguredPageCount(settings: AppSettings): number {
  const slotsPerPage = Math.max(
    1,
    getPresetSheetCount(settings.presetId, settings.customPreset),
  );
  const startOffset = getClampedStartSlot(settings) - 1;
  const labelCount = getRequestedLabelCount(settings);
  return clampPageCount(
    Math.ceil((startOffset + labelCount) / slotsPerPage),
  ) ?? 1;
}

function getCountForPageCount(settings: AppSettings, pageCount: number): number {
  const slotsPerPage = Math.max(
    1,
    getPresetSheetCount(settings.presetId, settings.customPreset),
  );
  const clampedPageCount = clampPageCount(pageCount) ?? 1;
  const startOffset =
    clampedPageCount > 1 ? 0 : getRawStartSlot(settings) - 1;

  return Math.min(
    getMaxLabelCountForPageLimit(settings),
    Math.max(1, slotsPerPage * clampedPageCount - startOffset),
  );
}

function getSinglePageCapacity(settings: AppSettings): number {
  const slotsPerPage = Math.max(
    1,
    getPresetSheetCount(settings.presetId, settings.customPreset),
  );
  return Math.max(1, slotsPerPage - getRawStartSlot(settings) + 1);
}

function applyAsnPageLimit(settings: AppSettings): AppSettings {
  if (settings.generatorMode !== "asn") {
    return settings;
  }

  const usesSinglePagePosition = usesSinglePageStartPosition(settings);
  const singlePageCapacity = getSinglePageCapacity(settings);
  const maxCount = getMaxLabelCountForPageLimit(settings);

  return {
    ...settings,
    startPosition: usesSinglePagePosition
      ? normalizeStartPosition(settings.startPosition) || "1"
      : "1",
    count:
      settings.count === undefined
        ? undefined
        : Math.min(
            settings.count,
            usesSinglePagePosition ? singlePageCapacity : maxCount,
          ),
    endNumber:
      settings.endNumber === undefined
        ? undefined
        : Math.min(
            settings.endNumber,
            settings.startNumber +
              (usesSinglePagePosition ? singlePageCapacity : maxCount) -
              1,
          ),
  };
}

function getLayoutPage(
  layout: GeneratedDocumentLayout,
  pageIndex: number,
): GeneratedDocumentLayout {
  const safeIndex = Math.min(
    Math.max(0, pageIndex),
    Math.max(layout.pages.length - 1, 0),
  );

  if (layout.kind === "separator") {
    return {
      ...layout,
      pages: [layout.pages[safeIndex]],
    };
  }

  const page = layout.pages[safeIndex];
  const lastItem = page.items[page.items.length - 1];
  return {
    ...layout,
    pages: [page],
    resolvedCount: page.items.length,
    resolvedEndNumber: lastItem?.value ?? layout.resolvedEndNumber,
  };
}

function getPaperlessPrefix(prefix: string): string {
  const trimmed = prefix.trim();
  return trimmed === "" ? "ASN" : trimmed;
}

function getSeparatorPaperLabel(locale: Locale, paperSize: SeparatorPaperSize): string {
  return paperSize === "letter"
    ? t(locale, "optionPaperLetter")
    : t(locale, "optionPaperA4");
}

function resolveThemeMode(themeMode: ThemeMode): "light" | "dark" {
  if (themeMode === "light" || themeMode === "dark") {
    return themeMode;
  }

  if (
    typeof window === "undefined" ||
    typeof window.matchMedia !== "function"
  ) {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getNextThemeMode(themeMode: ThemeMode): ThemeMode {
  if (themeMode === "system") {
    return "light";
  }

  if (themeMode === "light") {
    return "dark";
  }

  return "system";
}

function slugifyValue(value: string): string {
  const normalized = value.trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
  return normalized.replaceAll(/^-+|-+$/g, "") || "separator";
}

function buildGenerationKey(
  settings: AppSettings,
  profile: CalibrationProfile,
  barcodeColor: string,
  textColor: string,
): string {
  return JSON.stringify({
    layoutKind: settings.generatorMode,
    locale: settings.locale,
    barcodeColor,
    textColor,
    textFontFamily: settings.textFontFamily,
    settings: {
      generatorMode: settings.generatorMode,
      startNumber: settings.startNumber,
      endNumber: settings.endNumber,
      count: settings.count,
      prefix: settings.prefix,
      digits: settings.digits,
      textFontFamily: settings.textFontFamily,
      showTextPrefix: settings.showTextPrefix,
      showTextLeadingZeros: settings.showTextLeadingZeros,
      numberingDirection: settings.numberingDirection,
      startPosition: settings.startPosition,
      presetId: settings.presetId,
      showBorders: settings.showBorders,
      separatorPaperSize: settings.separatorPaperSize,
      separatorBarcodeValue: settings.separatorBarcodeValue,
      separatorHeadline: settings.separatorHeadline,
      separatorFreeText: settings.separatorFreeText,
    },
    calibration: {
      id: profile.id,
      offsetXMm: profile.offsetXMm,
      offsetYMm: profile.offsetYMm,
      pitchAdjustXMm: profile.pitchAdjustXMm,
      pitchAdjustYMm: profile.pitchAdjustYMm,
      qrScalePercent: profile.qrScalePercent,
    },
  });
}

interface GeneratedPreviewState {
  profile: CalibrationProfile;
  settings: AppSettings;
}

interface PdfCacheEntry {
  blob: Blob;
  key: string;
}

interface IconProps {
  class?: string;
}

function GlobeIcon({ class: className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      class={className}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="7.1" stroke="currentColor" stroke-width="1.6" />
      <path
        d="M2.9 10h14.2M10 2.9c1.8 2 2.8 4.5 2.8 7.1 0 2.6-1 5.1-2.8 7.1M10 2.9C8.2 4.9 7.2 7.4 7.2 10c0 2.6 1 5.1 2.8 7.1"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.6"
      />
    </svg>
  );
}

function ThemeModeIcon({
  class: className,
  mode,
}: IconProps & { mode: ThemeMode }) {
  if (mode === "light") {
    return (
      <svg
        aria-hidden="true"
        class={className}
        fill="none"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="10" r="3.25" stroke="currentColor" stroke-width="1.6" />
        <path
          d="M10 2.75v2.1M10 15.15v2.1M17.25 10h-2.1M4.85 10h-2.1M15.12 4.88l-1.48 1.48M6.36 13.64l-1.48 1.48M15.12 15.12l-1.48-1.48M6.36 6.36 4.88 4.88"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-width="1.6"
        />
      </svg>
    );
  }

  if (mode === "dark") {
    return (
      <svg
        aria-hidden="true"
        class={className}
        fill="none"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12.85 3.45a6.45 6.45 0 1 0 3.7 11.74 6.7 6.7 0 0 1-2.3.41 6.6 6.6 0 0 1-6.6-6.6c0-.82.15-1.62.42-2.36a6.44 6.44 0 0 0 4.78-3.19Z"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.6"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      class={className}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3.25"
        y="4"
        width="13.5"
        height="9.2"
        rx="2"
        stroke="currentColor"
        stroke-width="1.6"
      />
      <path
        d="M7.25 16h5.5M10 13.2V16"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="1.6"
      />
      <circle cx="13.5" cy="7.6" r="1.35" stroke="currentColor" stroke-width="1.4" />
      <path
        d="M13.5 5.1v.7M13.5 9.4v.7M16 7.6h-.7M11.7 7.6H11"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="1.4"
      />
    </svg>
  );
}

function DownloadIcon({ class: className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      class={className}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4.25v7.5m0 0 3-3m-3 3-3-3M4.5 14.75v.75c0 .41.34.75.75.75h9.5c.41 0 .75-.34.75-.75v-.75"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.8"
      />
    </svg>
  );
}

function PrintIcon({ class: className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      class={className}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.25 7V4.75c0-.41.34-.75.75-.75h6c.41 0 .75.34.75.75V7m-7.5 5.5h7.5m-7.5 2.5h7.5m-8.25 1h9a.75.75 0 0 0 .75-.75v-3.5H5.5v3.5c0 .41.34.75.75.75ZM5 7h10c.69 0 1.25.56 1.25 1.25v2.5c0 .69-.56 1.25-1.25 1.25H5c-.69 0-1.25-.56-1.25-1.25v-2.5C3.75 7.56 4.31 7 5 7Z"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.6"
      />
      <circle cx="14.1" cy="9.45" r=".8" fill="currentColor" />
    </svg>
  );
}

function AsnLabelIcon({ class: className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      class={className}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="3.25" y="3.25" width="13.5" height="13.5" rx="3" stroke="currentColor" stroke-width="1.5" />
      <rect x="5.3" y="5.3" width="3.2" height="3.2" rx=".5" fill="currentColor" />
      <rect x="11.5" y="5.3" width="1.6" height="1.6" rx=".3" fill="currentColor" />
      <rect x="13.9" y="5.3" width="1.6" height="3.2" rx=".3" fill="currentColor" />
      <rect x="5.3" y="11.5" width="1.6" height="1.6" rx=".3" fill="currentColor" />
      <rect x="7.7" y="11.5" width="3.2" height="3.2" rx=".4" fill="currentColor" />
      <rect x="12.3" y="10.7" width="3.2" height="1.6" rx=".3" fill="currentColor" />
      <rect x="12.3" y="13.1" width="1.6" height="1.6" rx=".3" fill="currentColor" />
      <rect x="14.7" y="13.1" width=".8" height="1.6" rx=".2" fill="currentColor" />
    </svg>
  );
}

function SeparatorSheetIcon({ class: className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      class={className}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.1 3.5h5.9l2.8 2.8v9.2a1 1 0 0 1-1 1H6.1a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M12 3.5v2.2c0 .44.36.8.8.8H15"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="1.5"
      />
      <path
        d="M7.4 9.2h5.2M7.4 11.7h5.2M7.4 14.2h3.3"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-width="1.5"
      />
    </svg>
  );
}


export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    return applyAsnPageLimit(loadSettings());
  });
  const [qrColorDraft, setQrColorDraft] = useState(settings.qrColor);
  const [textColorDraft, setTextColorDraft] = useState(settings.textColor);
  const [separatorBarcodeColorDraft, setSeparatorBarcodeColorDraft] = useState(
    settings.separatorBarcodeColor,
  );
  const [separatorTextColorDraft, setSeparatorTextColorDraft] = useState(
    settings.separatorTextColor,
  );
  const [allProfiles, setAllProfiles] = useState<
    Record<string, CalibrationProfile[]>
  >(() => loadCalibrationProfiles());
  const [pageIndex, setPageIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isAutoGenerate, setIsAutoGenerate] = useState(false);
  const [generatedByMode, setGeneratedByMode] = useState<{
    asn: GeneratedPreviewState | null;
    separator: GeneratedPreviewState | null;
  }>({
    asn: null,
    separator: null,
  });
  const [isWorkflowHelpOpen, setIsWorkflowHelpOpen] = useState(false);
  const [isGeneratorHelpOpen, setIsGeneratorHelpOpen] = useState(false);
  const [isCalibrationHelpOpen, setIsCalibrationHelpOpen] = useState(false);
  const [isProfileActionsOpen, setIsProfileActionsOpen] = useState(false);
  const [isPaperlessSetupOpen, setIsPaperlessSetupOpen] = useState(false);
  const [isOverlayInfoOpen, setIsOverlayInfoOpen] = useState(false);
  const [profileTransferNotice, setProfileTransferNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const nextLocale = settings.locale === "de" ? "en" : "de";
  const localeSwitchLabel =
    settings.locale === "de" ? "Switch to English" : "Zu Deutsch wechseln";
  const themeLabels: Record<ThemeMode, string> = {
    system: t(settings.locale, "themeSystem"),
    light: t(settings.locale, "themeLight"),
    dark: t(settings.locale, "themeDark"),
  };
  const nextThemeMode = getNextThemeMode(settings.themeMode);
  const themeSwitchLabel =
    settings.locale === "de"
      ? `Farbschema: ${themeLabels[settings.themeMode]}. Wechselt zu ${themeLabels[nextThemeMode]}.`
      : `Theme: ${themeLabels[settings.themeMode]}. Switches to ${themeLabels[nextThemeMode]}.`;
  const profileImportRef = useRef<HTMLInputElement | null>(null);
  const profileActionsRef = useRef<HTMLDivElement | null>(null);
  const cachedPdfRef = useRef<PdfCacheEntry | null>(null);
  const pendingPdfRef = useRef<{ key: string; promise: Promise<Blob> } | null>(null);

  const profiles = ensureCalibrationProfiles(allProfiles, settings.presetId);
  const selectedProfile =
    profiles.find((profile) => profile.id === settings.calibrationProfileId) ??
    profiles[0] ??
    createDefaultCalibrationProfile(settings.presetId);
  const generatedPreview = generatedByMode[settings.generatorMode];
  const generatedSettings = generatedPreview?.settings ?? null;
  const generatedProfile = generatedPreview?.profile ?? null;
  const isCustomCalibrationProfile = selectedProfile.id !== "default";
  const layout: GeneratedDocumentLayout | null =
    generatedSettings && generatedProfile
      ? generatedSettings.generatorMode === "separator"
        ? generateSeparatorLayout(generatedSettings as SeparatorConfig)
        : generateLayout(
            generatedSettings as GeneratorConfig,
            generatedProfile,
          )
      : null;
  const preset = getPresetById(settings.presetId, settings.customPreset);
  const suggestedEndNumber = getSuggestedEndNumber(settings);
  const paperlessPrefix = getPaperlessPrefix(settings.prefix);
  const separatorBarcodeValue =
    layout?.kind === "separator"
      ? layout.barcodeValue
      : fallbackBarcodeValue(settings.separatorBarcodeValue);
  const activeBarcodeColor =
    settings.generatorMode === "separator"
      ? settings.separatorBarcodeColor
      : settings.qrColor;
  const activeTextColor =
    settings.generatorMode === "separator"
      ? settings.separatorTextColor
      : settings.textColor;
  const paperlessSetupBody =
    settings.generatorMode === "separator"
      ? t(settings.locale, "paperlessSetupBodySeparator")
      : t(settings.locale, "paperlessSetupBody");
  const paperlessRequiredTitle =
    settings.generatorMode === "separator"
      ? t(settings.locale, "paperlessSetupRequiredTitleSeparator")
      : t(settings.locale, "paperlessSetupRequiredTitle");
  const paperlessOptionalTitle =
    settings.generatorMode === "separator"
      ? t(settings.locale, "paperlessSetupOptionalTitleSeparator")
      : t(settings.locale, "paperlessSetupOptionalTitle");
  const paperlessRequiredEnv =
    settings.generatorMode === "separator"
      ? ["PAPERLESS_CONSUMER_ENABLE_BARCODES=true"].join("\n")
      : ["PAPERLESS_CONSUMER_ENABLE_ASN_BARCODE=true"].join("\n");
  const paperlessOptionalEnv =
    settings.generatorMode === "separator"
      ? [
          `PAPERLESS_CONSUMER_BARCODE_STRING=${separatorBarcodeValue}`,
          "PAPERLESS_CONSUMER_BARCODE_SCANNER=ZXING",
          "PAPERLESS_CONSUMER_BARCODE_DPI=600",
          "PAPERLESS_CONSUMER_BARCODE_UPSCALE=1.5",
        ].join("\n")
      : [
          `PAPERLESS_CONSUMER_ASN_BARCODE_PREFIX=${paperlessPrefix}`,
          "PAPERLESS_CONSUMER_ENABLE_BARCODES=true",
          "PAPERLESS_CONSUMER_BARCODE_SCANNER=ZXING",
          "PAPERLESS_CONSUMER_BARCODE_DPI=600",
          "PAPERLESS_CONSUMER_BARCODE_UPSCALE=1.5",
        ].join("\n");
  const configuredPageCount = getConfiguredPageCount(settings);
  const canExport = layout !== null && layout.pages.length > 0;
  const currentPageIndex = Math.min(
    pageIndex,
    Math.max((layout?.pages.length ?? 1) - 1, 0),
  );
  const canGenerate = !isExporting;
  const liveSettingsKey = buildGenerationKey(
    settings,
    selectedProfile,
    activeBarcodeColor,
    activeTextColor,
  );
  const generatedStateKey =
    generatedSettings && generatedProfile
      ? buildGenerationKey(
          generatedSettings,
          generatedProfile,
          generatedSettings.generatorMode === "separator"
            ? generatedSettings.separatorBarcodeColor
            : generatedSettings.qrColor,
          generatedSettings.generatorMode === "separator"
            ? generatedSettings.separatorTextColor
            : generatedSettings.textColor,
        )
      : null;
  const hasGeneratedExport =
    layout !== null && generatedStateKey === liveSettingsKey;

  function getPdfExportFilename(currentLayout: GeneratedDocumentLayout): string {
    return currentLayout.kind === "separator"
      ? `plasn-separator-${slugifyValue(currentLayout.barcodeValue)}.pdf`
      : `plasn-${currentLayout.preset.id}-${generatedSettings?.startNumber ?? settings.startNumber}.pdf`;
  }

  function getPdfExportOptions() {
    if (!layout) {
      return null;
    }

    return {
      barcodeColor:
        generatedSettings?.generatorMode === "separator"
          ? generatedSettings.separatorBarcodeColor
          : generatedSettings?.qrColor ?? activeBarcodeColor,
      fontFamily:
        generatedSettings?.textFontFamily ?? settings.textFontFamily,
      locale: generatedSettings?.locale ?? settings.locale,
      textColor:
        generatedSettings?.generatorMode === "separator"
          ? generatedSettings.separatorTextColor
          : generatedSettings?.textColor ?? activeTextColor,
    };
  }

  async function buildPdfBlobForCurrentLayout(): Promise<Blob | null> {
    if (!layout || !generatedStateKey) {
      return null;
    }

    if (cachedPdfRef.current?.key === generatedStateKey) {
      return cachedPdfRef.current.blob;
    }

    if (pendingPdfRef.current?.key === generatedStateKey) {
      return pendingPdfRef.current.promise;
    }

    const exportOptions = getPdfExportOptions();
    if (!exportOptions) {
      return null;
    }

    const promise = import("./core/pdf")
      .then(({ renderPdf }) =>
        renderPdf(
          layout,
          exportOptions.locale,
          exportOptions.barcodeColor,
          exportOptions.textColor,
          exportOptions.fontFamily,
        ),
      )
      .then((blob) => {
        cachedPdfRef.current = {
          blob,
          key: generatedStateKey,
        };
        return blob;
      })
      .finally(() => {
        if (pendingPdfRef.current?.key === generatedStateKey) {
          pendingPdfRef.current = null;
        }
      });

    pendingPdfRef.current = {
      key: generatedStateKey,
      promise,
    };

    return promise;
  }

  useEffect(() => {
    setAllProfiles((current) => {
      const existingProfiles = current[settings.presetId];
      const normalizedProfiles = ensureCalibrationProfiles(current, settings.presetId);

      if (
        existingProfiles &&
        existingProfiles.length === normalizedProfiles.length &&
        existingProfiles.every(
          (profile, index) => profile.id === normalizedProfiles[index]?.id,
        )
      ) {
        return current;
      }

      return {
        ...current,
        [settings.presetId]: normalizedProfiles,
      };
    });
  }, [settings.presetId]);

  useEffect(() => {
    if (selectedProfile.id !== settings.calibrationProfileId) {
      setSettings((current) => ({
        ...current,
        calibrationProfileId: selectedProfile.id,
      }));
    }
  }, [selectedProfile.id]);

  useEffect(() => {
    saveSettings(toAppSettings(settings, settings.customPreset));
  }, [settings]);

  useEffect(() => {
    saveCalibrationProfiles(allProfiles);
  }, [allProfiles]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    const mediaQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: light)")
        : null;

    const applyTheme = () => {
      const resolvedTheme = resolveThemeMode(settings.themeMode);
      root.dataset.theme = resolvedTheme;
      root.style.colorScheme = resolvedTheme;
    };

    applyTheme();

    if (settings.themeMode !== "system" || !mediaQuery) {
      return;
    }

    const handleChange = () => applyTheme();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [settings.themeMode]);

  useEffect(() => {
    setQrColorDraft(settings.qrColor);
  }, [settings.qrColor]);

  useEffect(() => {
    setTextColorDraft(settings.textColor);
  }, [settings.textColor]);

  useEffect(() => {
    setSeparatorBarcodeColorDraft(settings.separatorBarcodeColor);
  }, [settings.separatorBarcodeColor]);

  useEffect(() => {
    setSeparatorTextColorDraft(settings.separatorTextColor);
  }, [settings.separatorTextColor]);

  useEffect(() => {
    if (!isProfileActionsOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!profileActionsRef.current?.contains(event.target as Node)) {
        setIsProfileActionsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isProfileActionsOpen]);

  useEffect(() => {
    setPageIndex(0);
  }, [
    settings.generatorMode,
    settings.startNumber,
    settings.endNumber,
    settings.count,
    settings.prefix,
    settings.digits,
    settings.numberingDirection,
    settings.startPosition,
    settings.presetId,
    settings.showBorders,
    settings.separatorPaperSize,
    settings.separatorBarcodeValue,
    settings.separatorHeadline,
    settings.separatorFreeText,
    selectedProfile.id,
    selectedProfile.offsetXMm,
    selectedProfile.offsetYMm,
    selectedProfile.pitchAdjustXMm,
    selectedProfile.pitchAdjustYMm,
    selectedProfile.qrScalePercent,
  ]);

  function updateSettings(patch: Partial<AppSettings>) {
    const normalizedPatch = { ...patch };
    if (normalizedPatch.startPosition !== undefined) {
      normalizedPatch.startPosition = normalizeStartPosition(
        normalizedPatch.startPosition,
      );
    }
    if (normalizedPatch.count !== undefined) {
      normalizedPatch.count = clampCount(normalizedPatch.count);
    }

    setSettings((current) =>
      applyAsnPageLimit({
        ...current,
        ...normalizedPatch,
      }),
    );
  }

  useEffect(() => {
    if (!isAutoGenerate) {
      return;
    }

    const settingsSnapshot: AppSettings = structuredClone(settings);
    const profileSnapshot: CalibrationProfile = structuredClone(selectedProfile);
    setGeneratedByMode((current) => ({
      ...current,
      [settingsSnapshot.generatorMode]: {
        settings: settingsSnapshot,
        profile: profileSnapshot,
      },
    }));
  }, [isAutoGenerate, liveSettingsKey]);

  useEffect(() => {
    if (!hasGeneratedExport || !layout || !generatedStateKey) {
      return;
    }

    if (cachedPdfRef.current?.key === generatedStateKey) {
      return;
    }

    if (pendingPdfRef.current?.key === generatedStateKey) {
      return;
    }

    void buildPdfBlobForCurrentLayout();
  }, [generatedStateKey, hasGeneratedExport, layout]);

  function commitQrColor(rawValue: string) {
    const normalized = normalizeHexColor(rawValue, settings.qrColor);
    setQrColorDraft(normalized);
    updateSettings({ qrColor: normalized });
  }

  function commitTextColor(rawValue: string) {
    const normalized = normalizeHexColor(rawValue, settings.textColor);
    setTextColorDraft(normalized);
    updateSettings({ textColor: normalized });
  }

  function commitSeparatorBarcodeColor(rawValue: string) {
    const normalized = normalizeHexColor(
      rawValue,
      settings.separatorBarcodeColor,
    );
    setSeparatorBarcodeColorDraft(normalized);
    updateSettings({ separatorBarcodeColor: normalized });
  }

  function commitSeparatorTextColor(rawValue: string) {
    const normalized = normalizeHexColor(rawValue, settings.separatorTextColor);
    setSeparatorTextColorDraft(normalized);
    updateSettings({ separatorTextColor: normalized });
  }

  function updateSeparatorBarcodeValue(nextValue: string) {
    const normalizedValue = normalizeSeparatorBarcodeValue(nextValue);
    setSettings((current) => {
      const shouldMirrorHeadline =
        current.separatorHeadline.trim() === "" ||
        current.separatorHeadline === current.separatorBarcodeValue;

      return {
        ...current,
        separatorBarcodeValue: normalizedValue,
        separatorHeadline: shouldMirrorHeadline
          ? normalizeSeparatorHeadline(normalizedValue || current.separatorHeadline)
          : current.separatorHeadline,
      };
    });
  }

  function updateCustomPreset<K extends keyof LabelPreset>(
    key: K,
    value: LabelPreset[K],
  ) {
    setSettings((current) =>
      applyAsnPageLimit({
        ...current,
        customPreset: {
          ...current.customPreset,
          [key]: value,
        },
      }),
    );
  }

  function updateProfile(patch: Partial<CalibrationProfile>) {
    const nextPatch =
      selectedProfile.id === "default" && "name" in patch
        ? { ...patch, name: selectedProfile.name }
        : patch;

    setAllProfiles((current) => ({
      ...current,
      [settings.presetId]: ensureCalibrationProfiles(current, settings.presetId).map(
        (profile) =>
          profile.id === selectedProfile.id ? { ...profile, ...nextPatch } : profile,
      ),
    }));
  }

  async function handlePdfDownload() {
    if (!layout) {
      return;
    }

    setIsExporting(true);
    try {
      const blob = await buildPdfBlobForCurrentLayout();
      if (!blob) {
        return;
      }

      downloadBlob(blob, getPdfExportFilename(layout));
    } finally {
      setIsExporting(false);
    }
  }

  async function handleOverlayPdfDownload() {
    setIsExporting(true);
    try {
      const { renderOverlayPdf } = await import("./core/overlayPdf");
      const blob = await renderOverlayPdf(preset, selectedProfile, settings.locale);
      downloadBlob(blob, `plasn-overlay-${preset.id}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  async function handlePrint() {
    if (!layout) {
      return;
    }

    setIsExporting(true);
    try {
      await printLayout(
        getLayoutPage(layout, currentPageIndex),
        settings.locale,
        activeBarcodeColor,
        activeTextColor,
        generatedSettings?.textFontFamily ?? settings.textFontFamily,
      );
    } finally {
      setIsExporting(false);
    }
  }

  async function handleGenerateExport() {
    const settingsSnapshot: AppSettings = structuredClone(settings);
    const profileSnapshot: CalibrationProfile = structuredClone(selectedProfile);
    setGeneratedByMode((current) => ({
      ...current,
      [settingsSnapshot.generatorMode]: {
        settings: settingsSnapshot,
        profile: profileSnapshot,
      },
    }));
  }

  function handlePageCountChange(value: string) {
    const normalizedPageCount = clampPageCount(
      numericValue(normalizePageCountInput(value)),
    );
    updateSettings({
      count: getCountForPageCount(settings, normalizedPageCount ?? 1),
      endNumber: undefined,
    });
  }

  function handleNewProfile() {
    setIsProfileActionsOpen(false);
    const profile: CalibrationProfile = {
      ...selectedProfile,
      id: randomId(),
      name: t(settings.locale, "profileNew"),
    };

    setAllProfiles((current) => ({
      ...current,
      [settings.presetId]: [
        ...ensureCalibrationProfiles(current, settings.presetId),
        profile,
      ],
    }));
    updateSettings({ calibrationProfileId: profile.id });
  }

  function handleDuplicateProfile() {
    setIsProfileActionsOpen(false);
    const profile: CalibrationProfile = {
      ...selectedProfile,
      id: randomId(),
      name: t(settings.locale, "profileCopy", { name: selectedProfile.name }),
    };

    setAllProfiles((current) => ({
      ...current,
      [settings.presetId]: [
        ...ensureCalibrationProfiles(current, settings.presetId),
        profile,
      ],
    }));
    updateSettings({ calibrationProfileId: profile.id });
  }

  function handleDeleteProfile() {
    setIsProfileActionsOpen(false);
    const currentProfiles = ensureCalibrationProfiles(allProfiles, settings.presetId);
    if (currentProfiles.length <= 1 || selectedProfile.id === "default") {
      return;
    }

    const remaining = ensureCalibrationProfiles(
      {
        ...allProfiles,
        [settings.presetId]: currentProfiles.filter(
          (profile) => profile.id !== selectedProfile.id,
        ),
      },
      settings.presetId,
    );
    setAllProfiles((current) => ({
      ...current,
      [settings.presetId]: remaining,
    }));
    updateSettings({ calibrationProfileId: "default" });
  }

  function handleReset() {
    const defaults = createDefaultSettings();
    updateSettings({
      ...defaults,
      locale: settings.locale,
      generatorMode: settings.generatorMode,
    });
  }

  function handleSheetSetupReset() {
    const defaults = createDefaultSettings();
    setQrColorDraft(defaults.qrColor);
    setTextColorDraft(defaults.textColor);
    updateSettings({
      startNumber: defaults.startNumber,
      endNumber: defaults.endNumber,
      count: defaults.count,
      prefix: defaults.prefix,
      digits: defaults.digits,
      numberingDirection: defaults.numberingDirection,
      startPosition: defaults.startPosition,
      qrColor: defaults.qrColor,
      textColor: defaults.textColor,
      textFontFamily: defaults.textFontFamily,
      showTextPrefix: defaults.showTextPrefix,
      showTextLeadingZeros: defaults.showTextLeadingZeros,
    });
  }

  function handleExportProfiles() {
    setIsProfileActionsOpen(false);
    const payload = serializeCalibrationProfiles(
      settings.presetId,
      profiles,
      selectedProfile.id,
    );
    const blob = new Blob([payload], { type: "application/json" });
    downloadBlob(blob, `plasn-calibration-${settings.presetId}.json`);
    setProfileTransferNotice(null);
  }

  async function handleImportProfiles(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const imported = parseCalibrationProfilesImport(raw);

      if (!imported) {
        setProfileTransferNotice({
          tone: "error",
          message: t(settings.locale, "profileTransferInvalidFile"),
        });
        return;
      }

      if (imported.presetId !== settings.presetId) {
        setProfileTransferNotice({
          tone: "error",
          message: t(settings.locale, "profileTransferPresetMismatch"),
        });
        return;
      }

      const nextProfiles = ensureCalibrationProfiles(
        {
          ...allProfiles,
          [settings.presetId]: imported.profiles.map((profile) => ({
            ...profile,
            presetId: settings.presetId,
          })),
        },
        settings.presetId,
      );
      const nextSelectedProfileId = nextProfiles.some(
        (profile) => profile.id === imported.selectedProfileId,
      )
        ? imported.selectedProfileId
        : "default";

      setAllProfiles((current) => ({
        ...current,
        [settings.presetId]: nextProfiles,
      }));
      updateSettings({ calibrationProfileId: nextSelectedProfileId });
      setProfileTransferNotice({
        tone: "success",
        message: t(settings.locale, "profileTransferImportSuccess", {
          count: nextProfiles.length,
        }),
      });
    } catch {
      setProfileTransferNotice({
        tone: "error",
        message: t(settings.locale, "profileTransferInvalidFile"),
      });
    } finally {
      input.value = "";
    }
  }

  return (
    <div class="app-shell">
      <div class="app-noise" />
      <header class="topbar topbar--frameless">
        <div class="topbar__top">
          <div class="topbar__brand">
            <div class="brand-row">
              <img
                alt=""
                aria-hidden="true"
                class="brand-row__logo"
                height="40"
                src="/plasn-mark.svg"
                width="40"
              />
              <h1>{t(settings.locale, "appTitle")}</h1>
              <p class="topbar__subtitle">
                {settings.locale === "de"
                  ? "Erzeugt druckbare ASN-Etiketten und Trennblätter für "
                  : "Create printable ASN label sheets and separator pages for "}
                <a
                  href="https://docs.paperless-ngx.com/"
                  rel="noreferrer"
                  target="_blank"
                >
                  Paperless-ngx
                </a>
                .
              </p>
            </div>
          </div>
          <div class="topbar__controls">
            <div class="locale-switcher" aria-label={t(settings.locale, "fieldTheme")}>
              <button
                aria-label={themeSwitchLabel}
                class="locale-switcher__button locale-switcher__button--icon locale-switcher__button--active"
                onClick={() => updateSettings({ themeMode: nextThemeMode })}
                title={themeSwitchLabel}
                type="button"
              >
                <ThemeModeIcon
                  class="locale-switcher__icon"
                  mode={settings.themeMode}
                />
              </button>
            </div>
            <div class="locale-switcher" aria-label={t(settings.locale, "fieldLanguage")}>
              <button
                aria-label={localeSwitchLabel}
                class="locale-switcher__button locale-switcher__button--icon locale-switcher__button--active"
                onClick={() => updateSettings({ locale: nextLocale })}
                title={localeSwitchLabel}
                type="button"
              >
                <GlobeIcon class="locale-switcher__icon" />
              </button>
            </div>
          </div>
        </div>

        <div class="mode-switcher mode-switcher--topbar" aria-label={t(settings.locale, "fieldMode")}>
          <button
            class={`mode-switcher__button${
              settings.generatorMode === "asn" ? " mode-switcher__button--active" : ""
            }`}
            onClick={() => updateSettings({ generatorMode: "asn" })}
            type="button"
          >
            <AsnLabelIcon class="mode-switcher__icon mode-switcher__icon--asn" />
            {t(settings.locale, "optionModeAsn")}
          </button>
          <button
            class={`mode-switcher__button${
              settings.generatorMode === "separator"
                ? " mode-switcher__button--active"
                : ""
            }`}
            onClick={() => updateSettings({ generatorMode: "separator" })}
            type="button"
          >
            <SeparatorSheetIcon class="mode-switcher__icon" />
            {t(settings.locale, "optionModeSeparator")}
          </button>
          <div class="mode-switcher__aux-group">
            <button
              class="mode-switcher__button"
              onClick={() => setIsWorkflowHelpOpen(true)}
              type="button"
            >
              {t(settings.locale, "buttonWorkflowHelp")}
            </button>
            <button
              class="mode-switcher__button"
              onClick={() => setIsPaperlessSetupOpen(true)}
              type="button"
            >
              {t(settings.locale, "buttonPaperlessSetup")}
            </button>
          </div>
        </div>
      </header>

      <main class="layout-grid">
        <section class="control-column">
          {settings.generatorMode === "asn" ? (
            <>
          <div class="section-card">
            <div class="section-card__header">
              <div class="section-card__header-title">
                <h3>{t(settings.locale, "sectionSheet")}</h3>
                <button
                  aria-label={t(settings.locale, "generatorHelpOpen")}
                  class="info-button"
                  onClick={() => setIsGeneratorHelpOpen(true)}
                  type="button"
                >
                  ?
                </button>
              </div>
            </div>
            <div class="form-grid">
              <label class="field field--full">
                <span>{t(settings.locale, "fieldPreset")}</span>
                <select
                  onInput={(event) => {
                    const nextPresetId = (event.currentTarget as HTMLSelectElement).value;
                    updateSettings({
                      presetId: nextPresetId,
                      count: getPresetSheetCount(nextPresetId, settings.customPreset),
                      endNumber: undefined,
                    });
                  }}
                  value={settings.presetId}
                >
                  {PRESET_LIBRARY.map((option) => (
                    <option key={option.id} value={option.id}>
                      {formatPresetOptionLabel(option)}
                    </option>
                  ))}
                  <option value={CUSTOM_PRESET_ID}>
                    {t(settings.locale, "optionCustomPreset")}
                  </option>
                </select>
              </label>
            </div>

            {settings.presetId === CUSTOM_PRESET_ID ? (
              <div class="form-grid form-grid--dense">
                <label class="field">
                  <span>{t(settings.locale, "fieldRows")}</span>
                  <NumberInput
                    min={1}
                    onInput={(event) =>
                      updateCustomPreset(
                        "rows",
                        Math.max(
                          1,
                          Number((event.currentTarget as HTMLInputElement).value) || 1,
                        ),
                      )
                    }
                    value={settings.customPreset.rows}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldColumns")}</span>
                  <NumberInput
                    min={1}
                    onInput={(event) =>
                      updateCustomPreset(
                        "columns",
                        Math.max(
                          1,
                          Number((event.currentTarget as HTMLInputElement).value) || 1,
                        ),
                      )
                    }
                    value={settings.customPreset.columns}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldPageWidth")}</span>
                  <NumberInput
                    min={10}
                    onInput={(event) =>
                      updateCustomPreset(
                        "pageWidthMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 210,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.pageWidthMm}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldPageHeight")}</span>
                  <NumberInput
                    min={10}
                    onInput={(event) =>
                      updateCustomPreset(
                        "pageHeightMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 297,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.pageHeightMm}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldLabelWidth")}</span>
                  <NumberInput
                    min={1}
                    onInput={(event) =>
                      updateCustomPreset(
                        "labelWidthMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 10,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.labelWidthMm}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldLabelHeight")}</span>
                  <NumberInput
                    min={1}
                    onInput={(event) =>
                      updateCustomPreset(
                        "labelHeightMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 10,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.labelHeightMm}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldGutterX")}</span>
                  <NumberInput
                    onInput={(event) =>
                      updateCustomPreset(
                        "gutterXMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.gutterXMm}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldGutterY")}</span>
                  <NumberInput
                    onInput={(event) =>
                      updateCustomPreset(
                        "gutterYMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.gutterYMm}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldMarginLeft")}</span>
                  <NumberInput
                    onInput={(event) =>
                      updateCustomPreset(
                        "marginLeftMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.marginLeftMm}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldMarginTop")}</span>
                  <NumberInput
                    onInput={(event) =>
                      updateCustomPreset(
                        "marginTopMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.marginTopMm}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldInnerPadding")}</span>
                  <NumberInput
                    min={0}
                    onInput={(event) =>
                      updateCustomPreset(
                        "innerPaddingMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.innerPaddingMm}
                  />
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldQrScale")}</span>
                  <NumberInput
                    min={0.2}
                    max={1}
                    onInput={(event) =>
                      updateCustomPreset(
                        "qrScale",
                        Number((event.currentTarget as HTMLInputElement).value) || 0.8,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.qrScale}
                  />
                </label>
                <label class="field field--full">
                  <span>{t(settings.locale, "fieldTextGap")}</span>
                  <NumberInput
                    min={0}
                    onInput={(event) =>
                      updateCustomPreset(
                        "textGapMm",
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                      )
                    }
                    step="0.01"
                    value={settings.customPreset.textGapMm}
                  />
                </label>
              </div>
            ) : null}

            {settings.presetId === CUSTOM_PRESET_ID ? (
              <p class="field-hint">{t(settings.locale, "hintCustom")}</p>
            ) : null}
            <div class="sheet-setup__config">
            <div
              class={`sheet-setup__row sheet-setup__row--numbers${
                configuredPageCount > 1
                  ? " sheet-setup__row--numbers-multi-page"
                  : ""
              }`}
            >
              <label class="field">
                <span>{t(settings.locale, "fieldStartNumber")}</span>
                <NumberInput
                  min={1}
                  onInput={(event) =>
                    updateSettings({
                      startNumber: Math.max(
                        1,
                        Number((event.currentTarget as HTMLInputElement).value) || 1,
                      ),
                    })
                  }
                  value={settings.startNumber}
                />
              </label>
              <label class="field">
                <span>{t(settings.locale, "fieldEndNumber")}</span>
                <NumberInput
                  min={settings.startNumber}
                  onInput={(event) =>
                    updateSettings({
                      endNumber: numericValue(
                        (event.currentTarget as HTMLInputElement).value,
                      ),
                    })
                  }
                  value={settings.endNumber ?? suggestedEndNumber}
                />
              </label>
              <label class="field">
                <span>{t(settings.locale, "fieldCount")}</span>
                <input
                  inputMode="numeric"
                  maxLength={MAX_COUNT_LENGTH}
                  onInput={(event) =>
                    updateSettings({
                      count: clampCount(
                        numericValue(
                          normalizeCountInput(
                            (event.currentTarget as HTMLInputElement).value,
                          ),
                        ),
                      ),
                    })
                  }
                  pattern="[0-9]*"
                  type="text"
                  value={settings.count ?? ""}
                />
              </label>
              <label class="field field--narrow">
                <span>{t(settings.locale, "fieldPageCount")}</span>
                <NumberInput
                  max={MAX_PAGE_COUNT}
                  min={1}
                  onInput={(event) =>
                    handlePageCountChange(
                      (event.currentTarget as HTMLInputElement).value,
                    )
                  }
                  step={1}
                  value={configuredPageCount}
                />
              </label>
              {configuredPageCount <= 1 ? (
                <label class="field field--narrow">
                  <span>{t(settings.locale, "fieldStartPosition")}</span>
                  <input
                    inputMode="numeric"
                    maxLength={3}
                    onInput={(event) =>
                      updateSettings({
                        startPosition: normalizeStartPosition(
                          (event.currentTarget as HTMLInputElement).value,
                        ),
                      })
                    }
                    pattern="[0-9]*"
                    type="text"
                    value={settings.startPosition}
                  />
                </label>
              ) : null}
            </div>
            <div class="sheet-setup__row sheet-setup__row--details">
              <label class="field">
                <span>{t(settings.locale, "fieldPrefix")}</span>
                <input
                  onInput={(event) =>
                    updateSettings({
                      prefix: normalizeAsnPrefix(
                        (event.currentTarget as HTMLInputElement).value,
                      ),
                    })
                  }
                  maxLength={MAX_ASN_PREFIX_LENGTH}
                  type="text"
                  value={settings.prefix}
                />
              </label>
              <label class="field">
                <span>{t(settings.locale, "fieldDigits")}</span>
                <NumberInput
                  min={1}
                  onInput={(event) =>
                    updateSettings({
                      digits: clampAsnDigits(
                        Number((event.currentTarget as HTMLInputElement).value) || 1,
                      ),
                    })
                  }
                  max={MAX_ASN_DIGITS}
                  value={settings.digits}
                />
              </label>
              <DirectionField
                locale={settings.locale}
                onChange={(numberingDirection) => updateSettings({ numberingDirection })}
                value={settings.numberingDirection}
              />
            </div>
            <div class="sheet-setup__row sheet-setup__row--appearance">
                <ColorField
                  draft={qrColorDraft}
                  label={t(settings.locale, "fieldQrColor")}
                  onCommit={commitQrColor}
                  onDraftChange={setQrColorDraft}
                  value={settings.qrColor}
                />
                <ColorField
                  draft={textColorDraft}
                  label={t(settings.locale, "fieldTextColor")}
                  onCommit={commitTextColor}
                  onDraftChange={setTextColorDraft}
                  value={settings.textColor}
                />
                <label class="field">
                  <span>{t(settings.locale, "fieldTextFont")}</span>
                  <select
                    onInput={(event) =>
                      updateSettings({
                        textFontFamily: (
                          event.currentTarget as HTMLSelectElement
                        ).value as AppSettings["textFontFamily"],
                      })
                    }
                    value={settings.textFontFamily}
                  >
                    {LABEL_TEXT_FONT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
            </div>
              <div class="sheet-setup__actions">
                <button
                  aria-checked={settings.showTextPrefix}
                  class={`toggle-row toggle-row--minimal sheet-setup__action${
                    settings.showTextPrefix ? " toggle-row--active" : ""
                  }`}
                  onClick={() =>
                    updateSettings({ showTextPrefix: !settings.showTextPrefix })
                  }
                  role="switch"
                  type="button"
                >
                  <span class="toggle-row__label">
                    {t(settings.locale, "fieldShowTextPrefix")}
                  </span>
                  <span class="toggle-switch" aria-hidden="true">
                    <span class="toggle-switch__thumb" />
                  </span>
                </button>
                <button
                  aria-checked={settings.showTextLeadingZeros}
                  class={`toggle-row toggle-row--minimal sheet-setup__action${
                    settings.showTextLeadingZeros ? " toggle-row--active" : ""
                  }`}
                  onClick={() =>
                    updateSettings({
                      showTextLeadingZeros: !settings.showTextLeadingZeros,
                    })
                  }
                  role="switch"
                  type="button"
                >
                  <span class="toggle-row__label">
                    {t(settings.locale, "fieldShowLeadingZeros")}
                  </span>
                  <span class="toggle-switch" aria-hidden="true">
                    <span class="toggle-switch__thumb" />
                  </span>
                </button>
                <button
                  class="button button--text button--inline-reset sheet-setup__action sheet-setup__action--reset"
                  onClick={handleSheetSetupReset}
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <CalibrationPanel
            isCustomCalibrationProfile={isCustomCalibrationProfile}
            isExporting={isExporting}
            isProfileActionsOpen={isProfileActionsOpen}
            locale={settings.locale}
            onCreateProfile={handleNewProfile}
            onDeleteProfile={handleDeleteProfile}
            onDuplicateProfile={handleDuplicateProfile}
            onExportProfiles={handleExportProfiles}
            onImportProfiles={handleImportProfiles}
            onOpenHelp={() => setIsCalibrationHelpOpen(true)}
            onOpenOverlayInfo={() => setIsOverlayInfoOpen(true)}
            onOverlayPdfDownload={handleOverlayPdfDownload}
            onSelectProfile={(calibrationProfileId) =>
              updateSettings({ calibrationProfileId })
            }
            onToggleProfileActions={() => setIsProfileActionsOpen((current) => !current)}
            onToggleShowBorders={() =>
              updateSettings({ showBorders: !settings.showBorders })
            }
            onUpdateProfile={updateProfile}
            profileActionsRef={profileActionsRef}
            profileImportRef={profileImportRef}
            profileTransferNotice={profileTransferNotice}
            profiles={profiles}
            selectedProfile={selectedProfile}
            showBorders={settings.showBorders}
          />
            </>
          ) : (
            <div class="section-card">
              <div class="section-card__header">
                <h3>{t(settings.locale, "sectionSeparator")}</h3>
              </div>
              <div class="form-grid">
                <label class="field">
                  <span>{t(settings.locale, "fieldSeparatorPaperSize")}</span>
                  <select
                    onInput={(event) =>
                      updateSettings({
                        separatorPaperSize: (
                          event.currentTarget as HTMLSelectElement
                        ).value as AppSettings["separatorPaperSize"],
                      })
                    }
                    value={settings.separatorPaperSize}
                  >
                    <option value="a4">{t(settings.locale, "optionPaperA4")}</option>
                    <option value="letter">
                      {t(settings.locale, "optionPaperLetter")}
                    </option>
                  </select>
                </label>
                <label class="field">
                  <span>{t(settings.locale, "fieldSeparatorBarcodeValue")}</span>
                  <input
                    onInput={(event) =>
                      updateSeparatorBarcodeValue(
                        (event.currentTarget as HTMLInputElement).value,
                      )
                    }
                    maxLength={MAX_SEPARATOR_BARCODE_LENGTH}
                    type="text"
                    value={settings.separatorBarcodeValue}
                  />
                </label>
                <label class="field field--full">
                  <span>{t(settings.locale, "fieldSeparatorHeadline")}</span>
                  <input
                    onInput={(event) =>
                      updateSettings({
                        separatorHeadline: normalizeSeparatorHeadline(
                          (event.currentTarget as HTMLInputElement).value,
                        ),
                      })
                    }
                    maxLength={MAX_SEPARATOR_HEADLINE_LENGTH}
                    type="text"
                    value={settings.separatorHeadline}
                  />
                </label>
                <label class="field field--full">
                  <span>{t(settings.locale, "fieldSeparatorFreeText")}</span>
                  <textarea
                    onInput={(event) =>
                      updateSettings({
                        separatorFreeText: normalizeSeparatorFreeText(
                          (event.currentTarget as HTMLTextAreaElement).value,
                        ),
                      })
                    }
                    maxLength={MAX_SEPARATOR_FREE_TEXT_LENGTH}
                    rows={4}
                    value={settings.separatorFreeText}
                  />
                </label>
                <div class="color-fields field--full">
                  <ColorField
                    draft={separatorBarcodeColorDraft}
                    label={t(settings.locale, "fieldQrColor")}
                    onCommit={commitSeparatorBarcodeColor}
                    onDraftChange={setSeparatorBarcodeColorDraft}
                    value={settings.separatorBarcodeColor}
                  />
                  <ColorField
                    draft={separatorTextColorDraft}
                    label={t(settings.locale, "fieldTextColor")}
                    onCommit={commitSeparatorTextColor}
                    onDraftChange={setSeparatorTextColorDraft}
                    value={settings.separatorTextColor}
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        <aside class="preview-column">
          <div class="section-card section-card--preview section-card--preview-plain section-card--sticky">
            {layout?.warnings.length ? (
              <div class="warning-stack" role="status">
                <h4>{t(settings.locale, "warningTitle")}</h4>
                {layout.warnings.map((warning, index) => (
                  <p key={`${warning.code}-${index}`}>
                    {warningMessage(settings.locale, warning)}
                  </p>
                ))}
              </div>
            ) : null}

            <PreviewPanel
              actions={
                <PreviewActions
                  DownloadIcon={DownloadIcon}
                  PrintIcon={PrintIcon}
                  canExport={canExport}
                  canGenerate={canGenerate}
                  hasGeneratedExport={hasGeneratedExport}
                  isAutoGenerate={isAutoGenerate}
                  isExporting={isExporting}
                  locale={settings.locale}
                  onDownloadPdf={handlePdfDownload}
                  onGenerate={handleGenerateExport}
                  onNextPage={() =>
                    setPageIndex((current) =>
                      Math.min((layout?.pages.length ?? 1) - 1, current + 1),
                    )
                  }
                  onPreviousPage={() =>
                    setPageIndex((current) => Math.max(0, current - 1))
                  }
                  onPrint={handlePrint}
                  onReset={handleReset}
                  onToggleAutoGenerate={() =>
                    setIsAutoGenerate((current) => !current)
                  }
                  pageCount={layout?.pages.length ?? 1}
                  pageIndex={currentPageIndex}
                />
              }
              layout={layout}
              locale={settings.locale}
              pageIndex={currentPageIndex}
              qrColor={activeBarcodeColor}
              textColor={activeTextColor}
              textFontFamily={generatedSettings?.textFontFamily ?? settings.textFontFamily}
              footer={
                <div class="output-panel output-panel--preview-note">
                  <div class="source-panel source-panel--plain">
                    <strong>{t(settings.locale, "outputPrintScaleTitle")}</strong>
                    <span>{t(settings.locale, "outputPrintScaleBody")}</span>
                  </div>
                </div>
              }
            />
          </div>
        </aside>
      </main>

      {isCalibrationHelpOpen ? (
        <div
          aria-modal="true"
          class="modal-backdrop"
          onClick={() => setIsCalibrationHelpOpen(false)}
          role="dialog"
        >
          <div
            class="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="modal-card__header">
              <h3>{t(settings.locale, "calibrationHelpTitle")}</h3>
              <button
                aria-label={t(settings.locale, "modalClose")}
                class="modal-close"
                onClick={() => setIsCalibrationHelpOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div class="modal-card__content">
              <p>{t(settings.locale, "calibrationHelpIntro")}</p>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "calibrationHelpProfilesTitle")}</strong>
                <p>{t(settings.locale, "calibrationHintScope")}</p>
                <span class="modal-help-note">{t(settings.locale, "calibrationStorageNote")}</span>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "calibrationHelpOffsetTitle")}</strong>
                <p>{t(settings.locale, "calibrationHelpOffsetBody")}</p>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "calibrationHelpPitchTitle")}</strong>
                <p>{t(settings.locale, "calibrationHelpPitchBody")}</p>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "calibrationHelpQrScaleTitle")}</strong>
                <p>{t(settings.locale, "calibrationHelpQrScaleBody")}</p>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "calibrationHelpExampleTitle")}</strong>
                <p>{t(settings.locale, "calibrationHelpExampleBody")}</p>
                <span class="modal-help-note">{t(settings.locale, "hintCalibration")}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isWorkflowHelpOpen ? (
        <div
          aria-modal="true"
          class="modal-backdrop"
          onClick={() => setIsWorkflowHelpOpen(false)}
          role="dialog"
        >
          <div
            class="modal-card modal-card--workflow"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="modal-card__header">
              <h3>{t(settings.locale, "workflowHelpTitle")}</h3>
              <button
                aria-label={t(settings.locale, "modalClose")}
                class="modal-close"
                onClick={() => setIsWorkflowHelpOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div class="modal-card__content">
              <p>{t(settings.locale, "workflowHelpIntro")}</p>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "workflowHelpSheetTitle")}</strong>
                <p>{t(settings.locale, "workflowHelpSheetBody")}</p>
                <span class="modal-help-note">{t(settings.locale, "workflowHelpSheetNote")}</span>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "workflowHelpConfigTitle")}</strong>
                <p>{t(settings.locale, "workflowHelpConfigBody")}</p>
                <span class="modal-help-note">{t(settings.locale, "workflowHelpConfigNote")}</span>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "workflowHelpGenerateTitle")}</strong>
                <p>{t(settings.locale, "workflowHelpGenerateBody")}</p>
                <span class="modal-help-note">{t(settings.locale, "workflowHelpGenerateNote")}</span>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "workflowHelpPrintTitle")}</strong>
                <p>{t(settings.locale, "workflowHelpPrintBody")}</p>
                <span class="modal-help-note">{t(settings.locale, "workflowHelpPrintNote")}</span>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "workflowHelpFitTitle")}</strong>
                <p>{t(settings.locale, "workflowHelpFitBody")}</p>
                <span class="modal-help-note">{t(settings.locale, "workflowHelpFitNote")}</span>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "workflowHelpCalibrationTitle")}</strong>
                <p>{t(settings.locale, "workflowHelpCalibrationBody")}</p>
                <span class="modal-help-note">{t(settings.locale, "workflowHelpCalibrationNote")}</span>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "workflowHelpProfilesTitle")}</strong>
                <p>{t(settings.locale, "workflowHelpProfilesBody")}</p>
                <span class="modal-help-note">{t(settings.locale, "workflowHelpProfilesNote")}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isPaperlessSetupOpen ? (
        <div
          aria-modal="true"
          class="modal-backdrop"
          onClick={() => setIsPaperlessSetupOpen(false)}
          role="dialog"
        >
          <div
            class="modal-card modal-card--workflow"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="modal-card__header">
              <h3>{t(settings.locale, "paperlessSetupTitle")}</h3>
              <button
                aria-label={t(settings.locale, "modalClose")}
                class="modal-close"
                onClick={() => setIsPaperlessSetupOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div class="modal-card__content">
              <p>{paperlessSetupBody}</p>
              <div class="modal-help-block">
                <strong>{paperlessRequiredTitle}</strong>
                <pre class="setup-block__code">
                  <code>{paperlessRequiredEnv}</code>
                </pre>
              </div>
              <div class="modal-help-block">
                <strong>{paperlessOptionalTitle}</strong>
                <pre class="setup-block__code">
                  <code>{paperlessOptionalEnv}</code>
                </pre>
              </div>
              <div class="modal-help-block">
                <a
                  class="source-panel__link"
                  href="https://docs.paperless-ngx.com/configuration/"
                  rel="noreferrer"
                  target="_blank"
                >
                  {t(settings.locale, "paperlessSetupDocsLabel")}
                </a>
                <p>{t(settings.locale, "paperlessSetupScannerNote")}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isGeneratorHelpOpen ? (
        <div
          aria-modal="true"
          class="modal-backdrop"
          onClick={() => setIsGeneratorHelpOpen(false)}
          role="dialog"
        >
          <div
            class="modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="modal-card__header">
              <h3>{t(settings.locale, "generatorHelpTitle")}</h3>
              <button
                aria-label={t(settings.locale, "modalClose")}
                class="modal-close"
                onClick={() => setIsGeneratorHelpOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div class="modal-card__content">
              <p>{t(settings.locale, "generatorHelpIntro")}</p>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "generatorHelpStartPositionTitle")}</strong>
                <p>{t(settings.locale, "generatorHelpStartPositionBody")}</p>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "generatorHelpRangeTitle")}</strong>
                <p>{t(settings.locale, "generatorHelpRangeBody")}</p>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "generatorHelpPrefixTitle")}</strong>
                <p>
                  {t(settings.locale, "generatorHelpPrefixBody")}{" "}
                  <a
                    href="https://docs.paperless-ngx.com/configuration/#PAPERLESS_CONSUMER_ASN_BARCODE_PREFIX"
                    rel="noreferrer"
                    target="_blank"
                  >
                    PAPERLESS_CONSUMER_ASN_BARCODE_PREFIX
                  </a>
                </p>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "generatorHelpVisibleTextTitle")}</strong>
                <p>{t(settings.locale, "generatorHelpVisibleTextBody")}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isOverlayInfoOpen ? (
        <div
          aria-modal="true"
          class="modal-backdrop"
          onClick={() => setIsOverlayInfoOpen(false)}
          role="dialog"
        >
          <div class="modal-card" onClick={(event) => event.stopPropagation()}>
            <div class="modal-card__header">
              <h3>{t(settings.locale, "overlayHelpTitle")}</h3>
              <button
                aria-label={t(settings.locale, "modalClose")}
                class="modal-close"
                onClick={() => setIsOverlayInfoOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <div class="modal-card__content">
              <p>{t(settings.locale, "overlayHelp")}</p>
            </div>
          </div>
        </div>
      ) : null}

      <footer class="app-footer">
        <div class="app-footer__content">
          <div class="app-footer__links">
            <a
              class="github-link github-link--primary"
              href={REPOSITORY_URL}
              rel="noreferrer"
              target="_blank"
            >
              <svg
                aria-hidden="true"
                class="github-link__icon"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.63 7.63 0 0 1 8 4.84a7.7 7.7 0 0 1 2.01.27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
              </svg>
              <span>{t(settings.locale, "footerGitHub")}</span>
            </a>
            <a
              class="github-link"
              href={ISSUES_URL}
              rel="noreferrer"
              target="_blank"
            >
              {t(settings.locale, "footerIssues")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
