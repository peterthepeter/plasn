import { generateOverlayLayout } from "../core/overlay";
import { PRESET_LIBRARY } from "../core/presets";
import { createDefaultCalibrationProfile } from "../core/storage";

describe("generateOverlayLayout", () => {
  it("creates one slot per label on the selected sheet", () => {
    const preset = PRESET_LIBRARY[0];
    const overlay = generateOverlayLayout(
      preset,
      createDefaultCalibrationProfile(preset.id),
    );

    expect(overlay.slots).toHaveLength(preset.rows * preset.columns);
  });

  it("applies calibration offsets to slot positions", () => {
    const preset = PRESET_LIBRARY[0];
    const profile = {
      ...createDefaultCalibrationProfile(preset.id),
      offsetXMm: 1.25,
      offsetYMm: -0.5,
    };
    const overlay = generateOverlayLayout(preset, profile);

    expect(overlay.slots[0].xMm).toBeCloseTo(preset.marginLeftMm + 1.25);
    expect(overlay.slots[0].yMm).toBeCloseTo(preset.marginTopMm - 0.5);
  });
});
