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

export function getLabelTextPrintFontFaceCss(): string {
  return `
    @font-face {
      font-family: "Source Code Pro";
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url("/fonts/source-code-pro-400.ttf") format("truetype");
    }
    @font-face {
      font-family: "Source Code Pro";
      font-style: normal;
      font-weight: 500;
      font-display: swap;
      src: url("/fonts/source-code-pro-500.ttf") format("truetype");
    }
    @font-face {
      font-family: "Source Code Pro";
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: url("/fonts/source-code-pro-600.ttf") format("truetype");
    }
    @font-face {
      font-family: "JetBrains Mono";
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url("/fonts/jetbrains-mono-400.ttf") format("truetype");
    }
    @font-face {
      font-family: "JetBrains Mono";
      font-style: normal;
      font-weight: 500;
      font-display: swap;
      src: url("/fonts/jetbrains-mono-500.ttf") format("truetype");
    }
    @font-face {
      font-family: "JetBrains Mono";
      font-style: normal;
      font-weight: 600;
      font-display: swap;
      src: url("/fonts/jetbrains-mono-600.ttf") format("truetype");
    }
  `;
}

export function getPdfLabelFontKind(
  fontFamily: LabelTextFontFamily,
): "helvetica" | "courier" {
  return fontFamily === "helvetica" ? "helvetica" : "courier";
}
