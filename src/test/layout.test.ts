import { generateLayout } from "../core/layout";
import { clampAsnDigits, normalizeAsnPrefix } from "../core/limits";
import { PRESET_LIBRARY } from "../core/presets";
import { createDefaultCalibrationProfile } from "../core/storage";
import type { GeneratorConfig } from "../core/types";

function makeConfig(overrides: Partial<GeneratorConfig> = {}): GeneratorConfig {
  return {
    locale: "en",
    startNumber: 1,
    count: 10,
    prefix: "ASN",
    digits: 6,
    qrColor: "#000000",
    textColor: "#000000",
    textFontFamily: "helvetica",
    showTextPrefix: true,
    showTextLeadingZeros: true,
    numberingDirection: "column",
    startPosition: "1",
    presetId: PRESET_LIBRARY[0].id,
    calibrationProfileId: "default",
    showBorders: false,
    ...overrides,
  };
}

describe("generateLayout", () => {
  it("uses endNumber over count", () => {
    const config = makeConfig({
      startNumber: 25,
      endNumber: 30,
      count: 99,
    });
    const layout = generateLayout(
      config,
      createDefaultCalibrationProfile(config.presetId),
    );

    expect(layout.resolvedCount).toBe(6);
    expect(layout.resolvedEndNumber).toBe(30);
  });

  it("flags non-numeric start positions as invalid", () => {
    const config = makeConfig({
      startPosition: "3:2",
    });
    const layout = generateLayout(
      config,
      createDefaultCalibrationProfile(config.presetId),
    );

    expect(layout.warnings.some((warning) => warning.code === "invalidStartPosition")).toBe(
      true,
    );
  });

  it("uses row-wise filling when selected", () => {
    const config = makeConfig({
      numberingDirection: "row",
      count: 2,
    });
    const layout = generateLayout(
      config,
      createDefaultCalibrationProfile(config.presetId),
    );

    expect(layout.pages[0].items[0].column).toBe(0);
    expect(layout.pages[0].items[1].column).toBe(1);
  });

  it("flags overflowing custom presets", () => {
    const config = makeConfig({
      presetId: "custom",
      customPreset: {
        ...PRESET_LIBRARY[0],
        id: "custom",
        isCustom: true,
        pageWidthMm: 50,
      },
    });
    const layout = generateLayout(config, createDefaultCalibrationProfile("custom"));

    expect(layout.warnings.some((warning) => warning.code === "presetOverflowX")).toBe(
      true,
    );
  });

  it("can hide prefix and leading zeros only in visible text", () => {
    const config = makeConfig({
      startNumber: 12,
      count: 1,
      showTextPrefix: false,
      showTextLeadingZeros: false,
    });
    const layout = generateLayout(
      config,
      createDefaultCalibrationProfile(config.presetId),
    );

    expect(layout.pages[0].items[0].encodedText).toBe("ASN000012");
    expect(layout.pages[0].items[0].displayText).toBe("12");
    expect(layout.pages[0].items[0].textOffsetMm).toBeGreaterThan(0);
  });

  it("limits ASN digits and prefix length", () => {
    expect(clampAsnDigits(9)).toBe(7);
    expect(clampAsnDigits(0)).toBe(1);
    expect(normalizeAsnPrefix("PREFIXED")).toBe("PREFIXE");
  });
});
