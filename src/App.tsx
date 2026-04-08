import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { PreviewPanel } from "./components/PreviewPanel";
import { normalizeHexColor } from "./core/color";
import {
  clampAsnDigits,
  MAX_ASN_DIGITS,
  MAX_ASN_PREFIX_LENGTH,
  MAX_SEPARATOR_BARCODE_LENGTH,
  MAX_SEPARATOR_FREE_TEXT_LENGTH,
  MAX_SEPARATOR_HEADLINE_LENGTH,
  normalizeAsnPrefix,
  normalizeSeparatorBarcodeValue,
  normalizeSeparatorFreeText,
  normalizeSeparatorHeadline,
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
} from "./core/types";

const REPOSITORY_URL = "https://github.com/peterthepeter/plasn";
const ISSUES_URL = "https://github.com/peterthepeter/plasn/issues";
const ORIGINAL_PROJECT_URL = "https://github.com/tmaier/asn-qr-code-label-generator";

const LABEL_COLOR_PRESETS = [
  { value: "#000000", label: "Black" },
  { value: "#1D4ED8", label: "Blue" },
  { value: "#1E3A8A", label: "Navy" },
  { value: "#0F766E", label: "Teal" },
  { value: "#166534", label: "Green" },
  { value: "#7C2D12", label: "Brown" },
  { value: "#9A3412", label: "Orange" },
  { value: "#7E22CE", label: "Violet" },
  { value: "#B91C1C", label: "Red" },
  { value: "#374151", label: "Slate" },
];

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

function sanitizeHexDraft(value: string): string {
  const normalized = value.toUpperCase().replace(/[^#0-9A-F]/g, "");
  if (normalized === "") {
    return "";
  }

  const withSingleHash = normalized.startsWith("#")
    ? `#${normalized.slice(1).replace(/#/g, "")}`
    : `#${normalized.replace(/#/g, "")}`;

  return withSingleHash.slice(0, 7);
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

function getPaperlessPrefix(prefix: string): string {
  const trimmed = prefix.trim();
  return trimmed === "" ? "ASN" : trimmed;
}

function getSeparatorPaperLabel(locale: Locale, paperSize: SeparatorPaperSize): string {
  return paperSize === "letter"
    ? t(locale, "optionPaperLetter")
    : t(locale, "optionPaperA4");
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
    },
  });
}

interface ColorFieldProps {
  label: string;
  value: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onCommit: (value: string) => void;
}

function ColorField({
  label,
  value,
  draft,
  onDraftChange,
  onCommit,
}: ColorFieldProps) {
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const colorMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isColorMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!colorMenuRef.current?.contains(event.target as Node)) {
        setIsColorMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isColorMenuOpen]);

  const activeColorPreset =
    LABEL_COLOR_PRESETS.find((entry) => entry.value === value) ?? null;

  return (
    <div class="color-field">
      <span class="color-field__label">{label}</span>
      <div class="color-field__combo" ref={colorMenuRef}>
        <div
          aria-hidden="true"
          class="color-field__swatch-preview"
          style={{ backgroundColor: value }}
        />
        <div class="color-field__input-wrap">
          <input
            aria-label={label}
            class="color-field__input"
            onBlur={() => onCommit(draft)}
            onInput={(event) =>
              onDraftChange(
                sanitizeHexDraft((event.currentTarget as HTMLInputElement).value),
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onCommit(draft);
              }
            }}
            placeholder="#000000"
            spellcheck={false}
            type="text"
            value={draft}
          />
        </div>
        <button
          aria-expanded={isColorMenuOpen}
          aria-haspopup="listbox"
          aria-label={`${label} presets`}
          class="color-menu__trigger"
          onClick={() => setIsColorMenuOpen((current) => !current)}
          type="button"
        >
          <span aria-hidden="true" class="color-menu__chevron">
            <svg
              class="color-menu__chevron-icon"
              fill="none"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m4 6 4 4 4-4"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.6"
              />
            </svg>
          </span>
        </button>
        {isColorMenuOpen ? (
          <div class="color-menu__popover" role="listbox">
            {LABEL_COLOR_PRESETS.map((color) => (
              <button
                aria-selected={value === color.value}
                class={`color-menu__option${
                  value === color.value ? " color-menu__option--active" : ""
                }`}
                key={color.value}
                onClick={() => {
                  onCommit(color.value);
                  setIsColorMenuOpen(false);
                }}
                role="option"
                type="button"
              >
                <span
                  aria-hidden="true"
                  class="color-menu__dot color-menu__dot--option"
                  style={{ backgroundColor: color.value }}
                />
                <span class="color-menu__option-label">{color.label}</span>
                <span class="color-menu__option-value">{color.value}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface DirectionFieldProps {
  locale: Locale;
  value: GeneratorConfig["numberingDirection"];
  onChange: (value: GeneratorConfig["numberingDirection"]) => void;
}

type NumberInputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type">;

function NumberInput(props: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isDisabled = Boolean(props.disabled || props.readOnly);

  const stepValue = (direction: 1 | -1) => {
    const input = inputRef.current;
    if (!input || isDisabled) {
      return;
    }

    if (direction > 0) {
      input.stepUp();
    } else {
      input.stepDown();
    }

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  return (
    <span class="number-input">
      <input {...props} ref={inputRef} type="number" />
      <span aria-hidden="true" class="number-input__steppers">
        <button
          class="number-input__stepper number-input__stepper--up"
          disabled={isDisabled}
          onClick={() => stepValue(1)}
          onMouseDown={(event) => event.preventDefault()}
          tabIndex={-1}
          type="button"
        >
          <svg fill="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 6.5 5 3.5l3 3"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.2"
            />
          </svg>
        </button>
        <button
          class="number-input__stepper number-input__stepper--down"
          disabled={isDisabled}
          onClick={() => stepValue(-1)}
          onMouseDown={(event) => event.preventDefault()}
          tabIndex={-1}
          type="button"
        >
          <svg fill="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
            <path
              d="m2 3.5 3 3 3-3"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.2"
            />
          </svg>
        </button>
      </span>
    </span>
  );
}

function DirectionField({ locale, value, onChange }: DirectionFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const options: Array<{
    value: GeneratorConfig["numberingDirection"];
    shortLabel: string;
    detail: string;
  }> = [
    {
      value: "row",
      shortLabel: t(locale, "optionRowShort"),
      detail: t(locale, "optionRowDetail"),
    },
    {
      value: "column",
      shortLabel: t(locale, "optionColumnShort"),
      detail: t(locale, "optionColumnDetail"),
    },
  ];

  const activeOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div class="field field--span-2">
      <span>{t(locale, "fieldDirection")}</span>
      <div class="direction-field" ref={menuRef}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          class="direction-field__trigger"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span class="direction-field__trigger-label">{activeOption.shortLabel}</span>
          <span aria-hidden="true" class="color-menu__chevron">
            <svg
              class="color-menu__chevron-icon"
              fill="none"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m4 6 4 4 4-4"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.6"
              />
            </svg>
          </span>
        </button>
        {isOpen ? (
          <div class="direction-field__popover" role="listbox">
            {options.map((option) => (
              <button
                aria-selected={option.value === value}
                class={`direction-field__option${
                  option.value === value ? " direction-field__option--active" : ""
                }`}
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                <span class="direction-field__option-title">{option.shortLabel}</span>
                <span class="direction-field__option-detail">{option.detail}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    return loadSettings();
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
  const [generatedSettings, setGeneratedSettings] = useState<AppSettings | null>(null);
  const [generatedProfile, setGeneratedProfile] = useState<CalibrationProfile | null>(
    null,
  );
  const [isWorkflowHelpOpen, setIsWorkflowHelpOpen] = useState(false);
  const [isGeneratorHelpOpen, setIsGeneratorHelpOpen] = useState(false);
  const [isCalibrationHelpOpen, setIsCalibrationHelpOpen] = useState(false);
  const [isProfileActionsOpen, setIsProfileActionsOpen] = useState(false);
  const [isPaperlessSetupOpen, setIsPaperlessSetupOpen] = useState(false);
  const [isCalibrationInfoOpen, setIsCalibrationInfoOpen] = useState(false);
  const [isOverlayInfoOpen, setIsOverlayInfoOpen] = useState(false);
  const [profileTransferNotice, setProfileTransferNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const profileImportRef = useRef<HTMLInputElement | null>(null);
  const profileActionsRef = useRef<HTMLDivElement | null>(null);

  const profiles = ensureCalibrationProfiles(allProfiles, settings.presetId);
  const selectedProfile =
    profiles.find((profile) => profile.id === settings.calibrationProfileId) ??
    profiles[0] ??
    createDefaultCalibrationProfile(settings.presetId);
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
  const canExport = layout !== null && layout.pages.length > 0;
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
  ]);

  function updateSettings(patch: Partial<AppSettings>) {
    setSettings((current) => ({
      ...current,
      ...patch,
    }));
  }

  useEffect(() => {
    if (!isAutoGenerate) {
      return;
    }

    const settingsSnapshot: AppSettings = structuredClone(settings);
    const profileSnapshot: CalibrationProfile = structuredClone(selectedProfile);
    setGeneratedSettings(settingsSnapshot);
    setGeneratedProfile(profileSnapshot);
  }, [isAutoGenerate, liveSettingsKey]);

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
    setSettings((current) => ({
      ...current,
      customPreset: {
        ...current.customPreset,
        [key]: value,
      },
    }));
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
      const { renderPdf } = await import("./core/pdf");
      const blob = await renderPdf(
        layout,
        generatedSettings?.locale ?? settings.locale,
        generatedSettings?.generatorMode === "separator"
          ? generatedSettings.separatorBarcodeColor
          : generatedSettings?.qrColor ?? activeBarcodeColor,
        generatedSettings?.generatorMode === "separator"
          ? generatedSettings.separatorTextColor
          : generatedSettings?.textColor ?? activeTextColor,
        generatedSettings?.textFontFamily ?? settings.textFontFamily,
      );
      downloadBlob(
        blob,
        layout.kind === "separator"
          ? `plasn-separator-${slugifyValue(layout.barcodeValue)}.pdf`
          : `plasn-${layout.preset.id}-${generatedSettings?.startNumber ?? settings.startNumber}.pdf`,
      );
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
        layout,
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
    setGeneratedSettings(settingsSnapshot);
    setGeneratedProfile(profileSnapshot);
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
      <header class="topbar">
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
          <div class="locale-switcher" aria-label={t(settings.locale, "fieldLanguage")}>
            <button
              class={`locale-switcher__button${
                settings.locale === "de" ? " locale-switcher__button--active" : ""
              }`}
              onClick={() => updateSettings({ locale: "de" })}
              type="button"
            >
              {t(settings.locale, "localeDe")}
            </button>
            <button
              class={`locale-switcher__button${
                settings.locale === "en" ? " locale-switcher__button--active" : ""
              }`}
              onClick={() => updateSettings({ locale: "en" })}
              type="button"
            >
              {t(settings.locale, "localeEn")}
            </button>
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
            {t(settings.locale, "optionModeSeparator")}
          </button>
          <button
            class="mode-switcher__button mode-switcher__button--aux"
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
            <div class="form-grid form-grid--generator">
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
                <NumberInput
                  min={1}
                  onInput={(event) =>
                    updateSettings({
                      count: numericValue(
                        (event.currentTarget as HTMLInputElement).value,
                      ),
                    })
                  }
                  value={settings.count ?? ""}
                />
              </label>
              <label class="field field--narrow">
                <span>{t(settings.locale, "fieldStartPosition")}</span>
                <input
                  onInput={(event) =>
                    updateSettings({
                      startPosition: (event.currentTarget as HTMLInputElement).value,
                    })
                  }
                  type="text"
                  value={settings.startPosition}
                />
              </label>
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
              <div class="color-fields field--full">
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
              <div class="sheet-setup__actions field--full">
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
          </div>

          <div class="section-card">
            <div class="section-card__header">
              <div class="section-card__header-title">
                <h3>{t(settings.locale, "sectionCalibration")}</h3>
                <button
                  aria-label={t(settings.locale, "calibrationHelpOpen")}
                  class="info-button"
                  onClick={() => setIsCalibrationHelpOpen(true)}
                  type="button"
                >
                  ?
                </button>
              </div>
            </div>
            <div class="section-card__meta">
              <strong>
                {t(settings.locale, "calibrationForPreset", {
                  preset: `${preset.manufacturer} ${preset.name}`,
                })}
              </strong>
              <button
                aria-expanded={isCalibrationInfoOpen}
                class="accordion-trigger accordion-trigger--inline"
                onClick={() => setIsCalibrationInfoOpen((current) => !current)}
                type="button"
              >
                <span>{t(settings.locale, "calibrationInfoToggle")}</span>
                <span aria-hidden="true" class="accordion-trigger__chevron">
                  {isCalibrationInfoOpen ? "▴" : "▾"}
                </span>
              </button>
              {isCalibrationInfoOpen ? (
                <div class="accordion-content">
                  <span>{t(settings.locale, "calibrationHintScope")}</span>
                  <span>{t(settings.locale, "calibrationStorageNote")}</span>
                  <span>{t(settings.locale, "hintCalibration")}</span>
                </div>
              ) : null}
            </div>
            <div class="form-grid">
              <label class="field">
                <span>{t(settings.locale, "fieldCalibrationProfile")}</span>
                <select
                  onInput={(event) =>
                    updateSettings({
                      calibrationProfileId: (
                        event.currentTarget as HTMLSelectElement
                      ).value,
                    })
                  }
                  value={selectedProfile.id}
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name}
                    </option>
                  ))}
                </select>
              </label>
              <label class="field">
                <span>{t(settings.locale, "fieldProfileName")}</span>
                <input
                  disabled={selectedProfile.id === "default"}
                  onInput={(event) =>
                    updateProfile({
                      name: (event.currentTarget as HTMLInputElement).value,
                    })
                  }
                  type="text"
                  value={selectedProfile.name}
                />
              </label>
            </div>
            <div class="calibration-controls-grid">
              <label class="field field--compact">
                <span>{t(settings.locale, "fieldOffsetX")}</span>
                <NumberInput
                  onInput={(event) =>
                    updateProfile({
                      offsetXMm:
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                    })
                  }
                  step="0.01"
                  value={selectedProfile.offsetXMm}
                />
              </label>
              <label class="field field--compact">
                <span>{t(settings.locale, "fieldOffsetY")}</span>
                <NumberInput
                  onInput={(event) =>
                    updateProfile({
                      offsetYMm:
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                    })
                  }
                  step="0.01"
                  value={selectedProfile.offsetYMm}
                />
              </label>
              <label class="field field--compact">
                <span>{t(settings.locale, "fieldPitchX")}</span>
                <NumberInput
                  onInput={(event) =>
                    updateProfile({
                      pitchAdjustXMm:
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                    })
                  }
                  step="0.01"
                  value={selectedProfile.pitchAdjustXMm}
                />
              </label>
              <label class="field field--compact">
                <span>{t(settings.locale, "fieldPitchY")}</span>
                <NumberInput
                  onInput={(event) =>
                    updateProfile({
                      pitchAdjustYMm:
                        Number((event.currentTarget as HTMLInputElement).value) || 0,
                    })
                  }
                  step="0.01"
                  value={selectedProfile.pitchAdjustYMm}
                />
              </label>
              <label class="field field--compact">
                <span>{t(settings.locale, "fieldShowBorders")}</span>
                <button
                  aria-pressed={settings.showBorders}
                  class={`toggle-row${settings.showBorders ? " toggle-row--active" : ""}`}
                  onClick={() =>
                    updateSettings({ showBorders: !settings.showBorders })
                  }
                  type="button"
                >
                  <span class="toggle-row__status">
                    {t(
                      settings.locale,
                      settings.showBorders ? "toggleEnabled" : "toggleDisabled",
                    )}
                  </span>
                  <span class="toggle-switch" aria-hidden="true">
                    <span class="toggle-switch__thumb" />
                  </span>
                </button>
              </label>
            </div>
            <div class="calibration-actions-row">
              <div class="profile-actions" ref={profileActionsRef}>
                <button
                  aria-expanded={isProfileActionsOpen}
                  aria-haspopup="menu"
                  class="button button--ghost profile-actions__trigger"
                  onClick={() => setIsProfileActionsOpen((current) => !current)}
                  type="button"
                >
                  <span>{t(settings.locale, "buttonProfileActions")}</span>
                  <span aria-hidden="true" class="color-menu__chevron">
                    ▾
                  </span>
                </button>
                {isProfileActionsOpen ? (
                  <div class="profile-actions__menu" role="menu">
                    <button
                      class="profile-actions__item"
                      onClick={handleNewProfile}
                      role="menuitem"
                      type="button"
                    >
                      {t(settings.locale, "buttonNewProfile")}
                    </button>
                    <button
                      class="profile-actions__item"
                      onClick={handleDuplicateProfile}
                      role="menuitem"
                      type="button"
                    >
                      {t(settings.locale, "buttonDuplicateProfile")}
                    </button>
                    <button
                      class="profile-actions__item"
                      disabled={profiles.length <= 1 || selectedProfile.id === "default"}
                      onClick={handleDeleteProfile}
                      role="menuitem"
                      type="button"
                    >
                      {t(settings.locale, "buttonDeleteProfile")}
                    </button>
                    <button
                      class="profile-actions__item"
                      onClick={handleExportProfiles}
                      role="menuitem"
                      type="button"
                    >
                      {t(settings.locale, "buttonExportProfiles")}
                    </button>
                    <button
                      class="profile-actions__item"
                      onClick={() => {
                        setIsProfileActionsOpen(false);
                        profileImportRef.current?.click();
                      }}
                      role="menuitem"
                      type="button"
                    >
                      {t(settings.locale, "buttonImportProfiles")}
                    </button>
                  </div>
                ) : null}
                <input
                  accept="application/json,.json"
                  class="visually-hidden"
                  onInput={handleImportProfiles}
                  ref={profileImportRef}
                  type="file"
                />
              </div>
              <div class="overlay-actions">
                <button
                  class="button button--ghost"
                  disabled={isExporting}
                  onClick={handleOverlayPdfDownload}
                  type="button"
                >
                  {t(settings.locale, "buttonOverlayPdf")}
                </button>
                <button
                  aria-label={t(settings.locale, "overlayHelpOpen")}
                  class="info-button"
                  onClick={() => setIsOverlayInfoOpen(true)}
                  type="button"
                >
                  ?
                </button>
              </div>
            </div>
            {profileTransferNotice ? (
              <p
                class={`field-hint field-hint--${profileTransferNotice.tone}`}
                role="status"
              >
                {profileTransferNotice.message}
              </p>
            ) : null}
          </div>
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
          <div class="section-card section-card--preview section-card--sticky">
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
                <>
                  <div class="button-row__group">
                    {hasGeneratedExport ? (
                      <>
                        <button
                          class="button button--primary"
                          disabled={isExporting || !canExport}
                          onClick={handlePdfDownload}
                          type="button"
                        >
                          {t(settings.locale, "buttonPdf")}
                        </button>
                        <button
                          class="button button--primary"
                          disabled={isExporting || !canExport}
                          onClick={handlePrint}
                          type="button"
                        >
                          {t(settings.locale, "buttonPrint")}
                        </button>
                      </>
                    ) : (
                      <button
                        class="button button--primary"
                        disabled={!canGenerate}
                        onClick={handleGenerateExport}
                        type="button"
                      >
                        {t(settings.locale, "buttonGenerate")}
                      </button>
                    )}
                  </div>
                  <div class="button-row__group button-row__group--end">
                    <button class="button button--text" onClick={handleReset} type="button">
                      {t(settings.locale, "buttonReset")}
                    </button>
                    <button
                      aria-pressed={isAutoGenerate}
                      class={`output-toggle${isAutoGenerate ? " output-toggle--active" : ""}`}
                      onClick={() => setIsAutoGenerate((current) => !current)}
                      type="button"
                    >
                      <span class="output-toggle__label">
                        {t(settings.locale, "buttonAutoGenerate")}
                      </span>
                      <span
                        aria-hidden="true"
                        class={`output-toggle__switch${
                          isAutoGenerate ? " output-toggle__switch--active" : ""
                        }`}
                      >
                        <span class="output-toggle__thumb" />
                      </span>
                    </button>
                  </div>
                </>
              }
              layout={layout}
              locale={settings.locale}
              onPageChange={setPageIndex}
              pageIndex={Math.min(pageIndex, Math.max((layout?.pages.length ?? 1) - 1, 0))}
              qrColor={activeBarcodeColor}
              textColor={activeTextColor}
              textFontFamily={generatedSettings?.textFontFamily ?? settings.textFontFamily}
              footer={
                <div class="output-panel">
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
                <strong>{t(settings.locale, "calibrationHelpOffsetTitle")}</strong>
                <p>{t(settings.locale, "calibrationHelpOffsetBody")}</p>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "calibrationHelpPitchTitle")}</strong>
                <p>{t(settings.locale, "calibrationHelpPitchBody")}</p>
              </div>
              <div class="modal-help-block">
                <strong>{t(settings.locale, "calibrationHelpExampleTitle")}</strong>
                <p>{t(settings.locale, "calibrationHelpExampleBody")}</p>
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
          <p>
            {t(settings.locale, "footerCredit")}{" "}
            <a href={ORIGINAL_PROJECT_URL} rel="noreferrer" target="_blank">
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
