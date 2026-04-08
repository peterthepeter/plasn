import { renderPdf } from "../core/pdf";
import { generateLayout } from "../core/layout";
import { PRESET_LIBRARY } from "../core/presets";
import { createDefaultCalibrationProfile } from "../core/storage";
import type { GeneratorConfig } from "../core/types";

describe("renderPdf", () => {
  it("creates a non-empty PDF blob", async () => {
    const config: GeneratorConfig = {
      locale: "en",
      startNumber: 1,
      count: 2,
      prefix: "ASN",
      digits: 6,
      qrColor: "#0000FF",
      textColor: "#B91C1C",
      textFontFamily: "helvetica",
      showTextPrefix: true,
      showTextLeadingZeros: true,
      numberingDirection: "column",
      startPosition: "1",
      presetId: PRESET_LIBRARY[0].id,
      calibrationProfileId: "default",
      showBorders: true,
    };

    const layout = generateLayout(
      config,
      createDefaultCalibrationProfile(config.presetId),
    );
    const blob = await renderPdf(
      layout,
      "en",
      config.qrColor,
      config.textColor,
      config.textFontFamily,
    );

    expect(blob.size).toBeGreaterThan(500);
    expect(blob.type).toBe("application/pdf");
  });
});
