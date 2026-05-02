import {
  getCssLabelTextTransform,
  getPdfLabelTextRotationDeg,
} from "../core/labelTextTransform";

describe("labelTextTransform", () => {
  it("builds the same CSS transform used by preview and print", () => {
    expect(getCssLabelTextTransform(-90, 0.96)).toBe(
      "translate(-50%, -50%) rotate(-90deg) scaleX(0.96)",
    );
  });

  it("mirrors rotated text for PDF coordinates", () => {
    expect(getPdfLabelTextRotationDeg(0)).toBe(0);
    expect(getPdfLabelTextRotationDeg(-90)).toBe(90);
  });
});
