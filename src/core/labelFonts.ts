import type { LabelTextFontFamily } from "./types";

export const LABEL_TEXT_FONT_OPTIONS: Array<{
  value: LabelTextFontFamily;
  label: string;
}> = [
  { value: "helvetica", label: "Helvetica" },
  { value: "source_code_pro", label: "Source Code Pro" },
  { value: "jetbrains_mono", label: "JetBrains Mono" },
];

export function getLabelTextCssFamily(fontFamily: LabelTextFontFamily): string {
  switch (fontFamily) {
    case "source_code_pro":
      return '"Source Code Pro", "Courier New", monospace';
    case "jetbrains_mono":
      return '"JetBrains Mono", "Courier New", monospace';
    case "helvetica":
    default:
      return "Helvetica, Arial, sans-serif";
  }
}

export function getLabelTextPrintImportCss(): string {
  return '@import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Source+Code+Pro:wght@400;500;600&display=swap");';
}

export function getPdfLabelFontKind(
  fontFamily: LabelTextFontFamily,
): "helvetica" | "courier" {
  return fontFamily === "helvetica" ? "helvetica" : "courier";
}
