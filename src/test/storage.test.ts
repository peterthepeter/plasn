import {
  ensureCalibrationProfiles,
  parseCalibrationProfilesImport,
  serializeCalibrationProfiles,
} from "../core/storage";
import type { CalibrationProfile } from "../core/types";

describe("calibration profile import/export", () => {
  it("roundtrips exported profiles", () => {
    const profiles: CalibrationProfile[] = [
      {
        id: "default",
        name: "Default",
        presetId: "avery-l4731",
        offsetXMm: 0,
        offsetYMm: 0,
        pitchAdjustXMm: 0,
        pitchAdjustYMm: 0,
      },
      {
        id: "laser",
        name: "Brother Laser",
        presetId: "avery-l4731",
        offsetXMm: 0.2,
        offsetYMm: -0.1,
        pitchAdjustXMm: 0,
        pitchAdjustYMm: 0.03,
      },
    ];

    const raw = serializeCalibrationProfiles("avery-l4731", profiles, "laser");
    const parsed = parseCalibrationProfilesImport(raw);

    expect(parsed).not.toBeNull();
    expect(parsed?.presetId).toBe("avery-l4731");
    expect(parsed?.selectedProfileId).toBe("laser");
    expect(parsed?.profiles).toEqual(profiles);
  });

  it("rejects invalid import files", () => {
    const parsed = parseCalibrationProfilesImport('{"version":1,"profiles":[]}');

    expect(parsed).toBeNull();
  });

  it("restores a default profile when it is missing", () => {
    const profiles = ensureCalibrationProfiles(
      {
        "avery-l4731": [
          {
            id: "test",
            name: "Test",
            presetId: "avery-l4731",
            offsetXMm: 0,
            offsetYMm: 0,
            pitchAdjustXMm: 0,
            pitchAdjustYMm: 0,
          },
        ],
      },
      "avery-l4731",
    );

    expect(profiles[0].id).toBe("default");
    expect(profiles[1].id).toBe("test");
  });
});
