import { generateSeparatorLayout } from "../core/separatorLayout";
import type { SeparatorConfig } from "../core/types";

function makeSeparatorConfig(
  overrides: Partial<SeparatorConfig> = {},
): SeparatorConfig {
  return {
    separatorPaperSize: "a4",
    separatorBarcodeValue: "PATCHT",
    separatorHeadline: "PATCHT",
    separatorFreeText: "",
    separatorBarcodeColor: "#000000",
    separatorTextColor: "#000000",
    ...overrides,
  };
}

describe("generateSeparatorLayout", () => {
  it("creates a single full-page separator sheet", () => {
    const layout = generateSeparatorLayout(makeSeparatorConfig());

    expect(layout.kind).toBe("separator");
    expect(layout.pages).toHaveLength(1);
    expect(layout.paperSize).toBe("a4");
    expect(layout.barcodeValue).toBe("PATCHT");
    expect(layout.pages[0].barcode.runs.length).toBeGreaterThan(0);
  });

  it("keeps headline and free text separate from the barcode value", () => {
    const layout = generateSeparatorLayout(
      makeSeparatorConfig({
        separatorBarcodeValue: "PATCHT",
        separatorHeadline: "Invoices",
        separatorFreeText: "Use before the next document batch.",
      }),
    );

    expect(layout.barcodeValue).toBe("PATCHT");
    expect(layout.headline).toBe("Invoices");
    expect(layout.freeText).toBe("Use before the next document batch.");
  });

  it("falls back to PATCHT when the barcode contains unsupported characters", () => {
    const layout = generateSeparatorLayout(
      makeSeparatorConfig({
        separatorBarcodeValue: "Trennung ä",
      }),
    );

    expect(layout.barcodeValue).toBe("PATCHT");
    expect(layout.headline).toBe("PATCHT");
    expect(
      layout.warnings.some((warning) => warning.code === "separatorInvalidBarcodeValue"),
    ).toBe(true);
    expect(layout.pages[0].barcode.runs.length).toBeGreaterThan(0);
  });
});
