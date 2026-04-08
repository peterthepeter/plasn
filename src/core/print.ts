import { getRunTotalWidth } from "./code128";
import { t } from "./i18n";
import { getLabelTextCssFamily, getLabelTextPrintImportCss } from "./labelFonts";
import { getQrDataUrl } from "./qr";
import type {
  GeneratedDocumentLayout,
  LabelTextFontFamily,
  Locale,
  SeparatorPageLayout,
} from "./types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildPrintDocument(
  layout: GeneratedDocumentLayout,
  locale: Locale,
  textFontFamily: LabelTextFontFamily,
  pageMarkup: string,
): string {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(t(locale, "printWindowTitle"))}</title>
        <style>
          ${getLabelTextPrintImportCss()}
          @page {
            size: ${layout.pages[0]?.pageWidthMm ?? 210}mm ${layout.pages[0]?.pageHeightMm ?? 297}mm;
            margin: 0;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: Helvetica, Arial, sans-serif;
          }
          .sheet {
            position: relative;
            page-break-after: always;
            background: white;
          }
          .sheet:last-child {
            page-break-after: auto;
          }
          .label {
            position: absolute;
            box-sizing: border-box;
            overflow: hidden;
          }
          .label img,
          .label .label-text {
            position: absolute;
          }
          .label .label-debug {
            position: absolute;
            inset: 0.18mm;
            border: 0.12mm solid rgba(145, 145, 145, 0.9);
            box-sizing: border-box;
          }
          .label-text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            white-space: nowrap;
            color: black;
            transform-origin: center center;
          }
          .label-text__line {
            display: block;
            width: 100%;
          }
          .separator-sheet {
            position: relative;
            page-break-after: always;
            background: white;
            overflow: hidden;
          }
          .separator-sheet:last-child {
            page-break-after: auto;
          }
          .separator-barcode {
            position: absolute;
          }
          .separator-barcode__bar {
            position: absolute;
            top: 0;
            bottom: 0;
          }
          .separator-headline,
          .separator-text {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
          }
          .separator-headline {
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        ${pageMarkup}
      </body>
    </html>
  `;
}

function createPrintFrame(): HTMLIFrameElement {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.position = "fixed";
  frame.style.right = "0";
  frame.style.bottom = "0";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.border = "0";
  frame.style.opacity = "0";
  frame.style.pointerEvents = "none";
  document.body.appendChild(frame);
  return frame;
}

function buildSeparatorBarcodeMarkup(
  page: SeparatorPageLayout,
  color: string,
): string {
  const totalUnits = getRunTotalWidth(page.barcode.runs);
  const unitWidth = page.barcode.widthMm / totalUnits;
  let cursor = 0;
  const bars = page.barcode.runs
    .map((run, index) => {
      const runWidth = run * unitWidth;
      const markup =
        index % 2 === 0
          ? `<span class="separator-barcode__bar" style="left:${cursor}mm;width:${runWidth}mm;background:${escapeHtml(
              color,
            )};"></span>`
          : "";
      cursor += runWidth;
      return markup;
    })
    .join("");

  return `
    <div class="separator-barcode" style="left:${page.barcode.xMm}mm;top:${page.barcode.yMm}mm;width:${page.barcode.widthMm}mm;height:${page.barcode.heightMm}mm;">
      ${bars}
    </div>
  `;
}

export async function printLayout(
  layout: GeneratedDocumentLayout,
  locale: Locale,
  qrColor: string,
  textColor: string,
  textFontFamily: LabelTextFontFamily,
): Promise<boolean> {
  try {
    const pageMarkup =
      layout.kind === "separator"
        ? layout.pages.map(
            (page) => `
              <section class="separator-sheet" style="width:${page.pageWidthMm}mm;height:${page.pageHeightMm}mm;">
                <div class="separator-headline" style="left:${page.headline.xMm}mm;top:${page.headline.yMm}mm;width:${page.headline.widthMm}mm;height:${page.headline.heightMm}mm;font-size:${page.headline.fontSizeMm}mm;color:${escapeHtml(
                  textColor,
                )};">
                  ${escapeHtml(page.headline.text)}
                </div>
                ${buildSeparatorBarcodeMarkup(page, qrColor)}
                ${
                  page.freeText
                    ? `<div class="separator-text" style="left:${page.freeText.xMm}mm;top:${page.freeText.yMm}mm;width:${page.freeText.widthMm}mm;height:${page.freeText.heightMm}mm;font-size:${page.freeText.fontSizeMm}mm;color:${escapeHtml(
                        textColor,
                      )};">${escapeHtml(page.freeText.text)}</div>`
                    : ""
                }
              </section>
            `,
          )
        : await Promise.all(
            layout.pages.map(async (page) => {
              const itemMarkup = await Promise.all(
                page.items.map(async (item) => {
            const qr = await getQrDataUrl(item.encodedText, qrColor);
            return `
              <div class="label${item.isTightFit ? " tight" : ""}" style="left:${item.xMm}mm;top:${item.yMm}mm;width:${item.widthMm}mm;height:${item.heightMm}mm;">
                ${
                  layout.showBorders
                    ? '<div class="label-debug" aria-hidden="true"></div>'
                    : ""
                }
                <img alt="" src="${qr}" style="left:${item.qrXmm - item.xMm}mm;top:${item.qrYmm - item.yMm}mm;width:${item.qrSizeMm}mm;height:${item.qrSizeMm}mm;" />
                <div class="label-text" style="left:${item.textXmm - item.xMm}mm;top:${item.textYmm - item.yMm}mm;width:${item.textWidthMm}mm;height:${item.textHeightMm}mm;font-size:${item.textSizeMm}mm;line-height:${item.textLineHeightMm}mm;color:${escapeHtml(textColor)};font-family:${escapeHtml(getLabelTextCssFamily(textFontFamily))};transform:scaleX(${item.textScaleX});">
                  ${item.textLines
                    .map(
                      (line) =>
                        `<span class="label-text__line">${escapeHtml(line)}</span>`,
                    )
                    .join("")}
                </div>
              </div>
            `;
                }),
              );

              return `
                <section class="sheet" style="width:${page.pageWidthMm}mm;height:${page.pageHeightMm}mm;">
                  ${itemMarkup.join("")}
                </section>
              `;
            }),
          );

    const frame = createPrintFrame();
    const doc = frame.contentDocument;
    const win = frame.contentWindow;

    if (!doc || !win) {
      frame.remove();
      return false;
    }

    const cleanup = () => {
      window.setTimeout(() => frame.remove(), 200);
    };

    win.onafterprint = cleanup;
    doc.open();
    doc.write(buildPrintDocument(layout, locale, textFontFamily, pageMarkup.join("")));
    doc.close();

    const runPrint = () => {
      win.focus();
      window.setTimeout(() => {
        win.print();
      }, 60);
    };

    if (doc.readyState === "complete") {
      runPrint();
    } else {
      win.addEventListener("load", runPrint, { once: true });
    }

    window.setTimeout(cleanup, 60_000);
    return true;
  } catch (error) {
    console.error("Print layout error", error);
    return false;
  }
}
