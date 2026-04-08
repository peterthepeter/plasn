import { detectInitialLocale } from "./i18n";
import { normalizeHexColor } from "./color";
import {
  clampAsnDigits,
  normalizeAsnPrefix,
  normalizeSeparatorBarcodeValue,
  normalizeSeparatorFreeText,
  normalizeSeparatorHeadline,
} from "./limits";
import { createDefaultCustomPreset, PRESET_LIBRARY } from "./presets";
import type {
  AppSettings,
  CalibrationProfile,
  GeneratorConfig,
  LabelPreset,
} from "./types";

const SETTINGS_KEY = "plasn.settings.v1";
const PROFILES_KEY = "plasn.calibration-profiles.v1";
const CALIBRATION_EXPORT_VERSION = 1;

export interface CalibrationProfileExportPayload {
  version: number;
  presetId: string;
  selectedProfileId: string;
  profiles: CalibrationProfile[];
}

function isCalibrationProfile(value: unknown): value is CalibrationProfile {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.presetId === "string" &&
    typeof candidate.offsetXMm === "number" &&
    Number.isFinite(candidate.offsetXMm) &&
    typeof candidate.offsetYMm === "number" &&
    Number.isFinite(candidate.offsetYMm) &&
    typeof candidate.pitchAdjustXMm === "number" &&
    Number.isFinite(candidate.pitchAdjustXMm) &&
    typeof candidate.pitchAdjustYMm === "number" &&
    Number.isFinite(candidate.pitchAdjustYMm)
  );
}

export function createDefaultCalibrationProfile(
  presetId: string,
): CalibrationProfile {
  return {
    id: "default",
    name: "Default",
    presetId,
    offsetXMm: 0,
    offsetYMm: 0,
    pitchAdjustXMm: 0,
    pitchAdjustYMm: 0,
  };
}

export function createDefaultSettings(): AppSettings {
  const preset = PRESET_LIBRARY[0];

  return {
    locale: detectInitialLocale(),
    generatorMode: "asn",
    startNumber: 1,
    count: preset.columns * preset.rows,
    prefix: "ASN",
    digits: 5,
    qrColor: "#000000",
    textColor: "#000000",
    textFontFamily: "helvetica",
    showTextPrefix: true,
    showTextLeadingZeros: true,
    numberingDirection: "column",
    startPosition: "1",
    presetId: preset.id,
    calibrationProfileId: "default",
    showBorders: false,
    separatorPaperSize: "a4",
    separatorBarcodeValue: "PATCHT",
    separatorHeadline: "PATCHT",
    separatorFreeText: "",
    separatorBarcodeColor: "#000000",
    separatorTextColor: "#000000",
    customPreset: createDefaultCustomPreset(),
  };
}

export function loadSettings(): AppSettings {
  if (typeof localStorage === "undefined") {
    return createDefaultSettings();
  }

  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return createDefaultSettings();
    }

    const parsed = JSON.parse(raw) as Partial<AppSettings> & {
      labelColor?: string;
    };
    const fallbackColor = normalizeHexColor(
      parsed.labelColor,
      createDefaultSettings().qrColor,
    );
    return {
      ...createDefaultSettings(),
      ...parsed,
      prefix: normalizeAsnPrefix(parsed.prefix ?? createDefaultSettings().prefix),
      digits: clampAsnDigits(parsed.digits ?? createDefaultSettings().digits),
      separatorBarcodeValue: normalizeSeparatorBarcodeValue(
        parsed.separatorBarcodeValue ??
          createDefaultSettings().separatorBarcodeValue,
      ),
      separatorHeadline: normalizeSeparatorHeadline(
        parsed.separatorHeadline ?? createDefaultSettings().separatorHeadline,
      ),
      separatorFreeText: normalizeSeparatorFreeText(
        parsed.separatorFreeText ?? createDefaultSettings().separatorFreeText,
      ),
      qrColor: normalizeHexColor(parsed.qrColor, fallbackColor),
      textColor: normalizeHexColor(parsed.textColor, fallbackColor),
      textFontFamily:
        parsed.textFontFamily === "source_code_pro" ||
        parsed.textFontFamily === "jetbrains_mono" ||
        parsed.textFontFamily === "helvetica"
          ? parsed.textFontFamily
          : createDefaultSettings().textFontFamily,
      separatorBarcodeColor: normalizeHexColor(
        parsed.separatorBarcodeColor,
        createDefaultSettings().separatorBarcodeColor,
      ),
      separatorTextColor: normalizeHexColor(
        parsed.separatorTextColor,
        createDefaultSettings().separatorTextColor,
      ),
      customPreset: {
        ...createDefaultCustomPreset(),
        ...(parsed.customPreset ?? {}),
      },
    };
  } catch {
    return createDefaultSettings();
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadCalibrationProfiles(): Record<string, CalibrationProfile[]> {
  if (typeof localStorage === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as Record<string, CalibrationProfile[]>;
  } catch {
    return {};
  }
}

export function saveCalibrationProfiles(
  profiles: Record<string, CalibrationProfile[]>,
): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function ensureCalibrationProfiles(
  allProfiles: Record<string, CalibrationProfile[]>,
  presetId: string,
): CalibrationProfile[] {
  const profiles = allProfiles[presetId];
  if (profiles?.length) {
    const storedDefaultProfile = profiles.find((profile) => profile.id === "default");
    const defaultProfile = storedDefaultProfile
      ? {
          ...storedDefaultProfile,
          ...createDefaultCalibrationProfile(presetId),
          offsetXMm: storedDefaultProfile.offsetXMm,
          offsetYMm: storedDefaultProfile.offsetYMm,
          pitchAdjustXMm: storedDefaultProfile.pitchAdjustXMm,
          pitchAdjustYMm: storedDefaultProfile.pitchAdjustYMm,
        }
      : createDefaultCalibrationProfile(presetId);
    const remainingProfiles = profiles.filter((profile) => profile.id !== "default");

    return [defaultProfile, ...remainingProfiles];
  }

  return [createDefaultCalibrationProfile(presetId)];
}

export function toAppSettings(
  config: GeneratorConfig,
  customPreset: LabelPreset,
): AppSettings {
  return {
    ...createDefaultSettings(),
    ...config,
    customPreset,
  };
}

export function serializeCalibrationProfiles(
  presetId: string,
  profiles: CalibrationProfile[],
  selectedProfileId: string,
): string {
  const payload: CalibrationProfileExportPayload = {
    version: CALIBRATION_EXPORT_VERSION,
    presetId,
    selectedProfileId,
    profiles,
  };

  return JSON.stringify(payload, null, 2);
}

export function parseCalibrationProfilesImport(
  raw: string,
): CalibrationProfileExportPayload | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CalibrationProfileExportPayload>;
    if (
      parsed.version !== CALIBRATION_EXPORT_VERSION ||
      typeof parsed.presetId !== "string" ||
      typeof parsed.selectedProfileId !== "string" ||
      !Array.isArray(parsed.profiles) ||
      parsed.profiles.length < 1 ||
      !parsed.profiles.every(isCalibrationProfile)
    ) {
      return null;
    }

    return {
      version: parsed.version,
      presetId: parsed.presetId,
      selectedProfileId: parsed.selectedProfileId,
      profiles: parsed.profiles,
    };
  } catch {
    return null;
  }
}
