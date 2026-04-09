import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { getRunTotalWidth } from "../core/code128";
import { getLabelTextCssFamily } from "../core/labelFonts";
import { getQrDataUrlMap } from "../core/qr";
import type { GeneratedDocumentLayout, LabelTextFontFamily, Locale } from "../core/types";
import { t } from "../core/i18n";

interface PreviewPanelProps {
  layout: GeneratedDocumentLayout | null;
  locale: Locale;
  qrColor: string;
  textColor: string;
  textFontFamily: LabelTextFontFamily;
  pageIndex: number;
  actions?: ComponentChildren;
  footer?: ComponentChildren;
}

export function PreviewPanel({
  layout,
  locale,
  qrColor,
  textColor,
  textFontFamily,
  pageIndex,
  actions,
  footer,
}: PreviewPanelProps) {
  if (!layout) {
    return (
      <div class="preview-shell">
        {actions}
        <div class="preview-empty">
          <p>{t(locale, "previewGenerateHint")}</p>
        </div>
      </div>
    );
  }

  const page = layout.pages[pageIndex];
  const asnPage = layout.kind === "asn" ? layout.pages[pageIndex] : null;
  const separatorPage =
    layout.kind === "separator" ? layout.pages[pageIndex] : null;
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [scale, setScale] = useState(1.8);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const hasCompleteQrMap = asnPage
    ? asnPage.items.every((item) => Boolean(qrMap[item.encodedText]))
    : true;
  const showLoadingState = Boolean(asnPage) && (!hasCompleteQrMap || isPreviewLoading);

  useEffect(() => {
    let cancelled = false;

    if (!asnPage && !separatorPage) {
      setQrMap({});
      setIsPreviewLoading(false);
      return;
    }

    if (!asnPage) {
      setQrMap({});
      setIsPreviewLoading(false);
      return;
    }

    setIsPreviewLoading(true);

    getQrDataUrlMap(
      asnPage.items.map((item) => item.encodedText),
      qrColor,
    ).then((entries) => {
      if (cancelled) {
        return;
      }
      setQrMap(entries);
      setIsPreviewLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [asnPage, separatorPage, qrColor]);

  useEffect(() => {
    const element = surfaceRef.current;
    if (!element || !page) {
      return;
    }

    const updateScale = () => {
      const availableWidth = Math.max(element.clientWidth, 220);
      setScale((availableWidth / page.pageWidthMm) * 0.98);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, [page?.pageWidthMm]);

  if (!page) {
    return (
      <div class="preview-shell">
        {actions}
        <div class="preview-empty">
          <p>{t(locale, "previewNoPages")}</p>
        </div>
      </div>
    );
  }

  return (
    <div class="preview-shell">
      <div class="preview-surface" ref={surfaceRef}>
        <div
          class="preview-frame"
          style={{
            width: `${page.pageWidthMm * scale}px`,
          }}
        >
          {actions}

          <div class="preview-toolbar">
            <span class="preview-toolbar__meta">
              {layout.kind === "separator"
                ? t(locale, "previewMetaSeparator", {
                    page: pageIndex + 1,
                    pages: layout.pages.length,
                  })
                : t(locale, "previewMeta", {
                    page: pageIndex + 1,
                    pages: layout.pages.length,
                    count: layout.resolvedCount,
                    nextStart: layout.resolvedEndNumber + 1,
                  })}
            </span>
          </div>

          <div
            class={`preview-page${showLoadingState ? " preview-page--loading" : ""}`}
            style={{
              width: `${page.pageWidthMm * scale}px`,
              height: `${page.pageHeightMm * scale}px`,
            }}
          >
            {separatorPage ? (
              <>
                <div
                  class="preview-separator__headline"
                  style={{
                    left: `${separatorPage.headline.xMm * scale}px`,
                    top: `${separatorPage.headline.yMm * scale}px`,
                    width: `${separatorPage.headline.widthMm * scale}px`,
                    height: `${separatorPage.headline.heightMm * scale}px`,
                    fontSize: `${separatorPage.headline.fontSizeMm * scale}px`,
                    color: textColor,
                  }}
                >
                  {separatorPage.headline.text}
                </div>
                <div
                  class="preview-separator__barcode"
                  style={{
                    left: `${separatorPage.barcode.xMm * scale}px`,
                    top: `${separatorPage.barcode.yMm * scale}px`,
                    width: `${separatorPage.barcode.widthMm * scale}px`,
                    height: `${separatorPage.barcode.heightMm * scale}px`,
                  }}
                >
                  {(() => {
                    const totalUnits = getRunTotalWidth(separatorPage.barcode.runs);
                    const unitWidth =
                      (separatorPage.barcode.widthMm * scale) / totalUnits;
                    let cursor = 0;
                    return separatorPage.barcode.runs.map((run, index) => {
                      const width = run * unitWidth;
                      const node =
                        index % 2 === 0 ? (
                          <span
                            class="preview-separator__bar"
                            key={`bar-${index}`}
                            style={{
                              left: `${cursor}px`,
                              width: `${width}px`,
                              backgroundColor: qrColor,
                            }}
                          />
                        ) : null;
                      cursor += width;
                      return node;
                    });
                  })()}
                </div>
                {separatorPage.freeText ? (
                  <div
                    class="preview-separator__text"
                    style={{
                      left: `${separatorPage.freeText.xMm * scale}px`,
                      top: `${separatorPage.freeText.yMm * scale}px`,
                      width: `${separatorPage.freeText.widthMm * scale}px`,
                      height: `${separatorPage.freeText.heightMm * scale}px`,
                      fontSize: `${separatorPage.freeText.fontSizeMm * scale}px`,
                      color: textColor,
                    }}
                  >
                    {separatorPage.freeText.text}
                  </div>
                ) : null}
              </>
            ) : !showLoadingState ? (
              asnPage?.items.map((item) => (
                <div
                  class={`preview-label${item.isTightFit ? " preview-label--tight" : ""}`}
                  key={item.id}
                  style={{
                    left: `${item.xMm * scale}px`,
                    top: `${item.yMm * scale}px`,
                    width: `${item.widthMm * scale}px`,
                    height: `${item.heightMm * scale}px`,
                  }}
                >
                  {layout.kind === "asn" && layout.showBorders ? (
                    <div class="preview-label__debug" />
                  ) : null}
                  <img
                    alt=""
                    class="preview-label__qr"
                    src={qrMap[item.encodedText]}
                    style={{
                      left: `${(item.qrXmm - item.xMm) * scale}px`,
                      top: `${(item.qrYmm - item.yMm) * scale}px`,
                      width: `${item.qrSizeMm * scale}px`,
                      height: `${item.qrSizeMm * scale}px`,
                    }}
                  />
                  <div
                    class="preview-label__text"
                    style={{
                      left: `${(item.textXmm - item.xMm) * scale}px`,
                      top: `${(item.textYmm - item.yMm) * scale}px`,
                      width: `${item.textWidthMm * scale}px`,
                      height: `${item.textHeightMm * scale}px`,
                      fontSize: `${item.textSizeMm * scale}px`,
                      lineHeight: `${item.textLineHeightMm * scale}px`,
                      color: textColor,
                      fontFamily: getLabelTextCssFamily(textFontFamily),
                      transform: `scaleX(${item.textScaleX})`,
                    }}
                  >
                    {item.textLines.map((line, index) => (
                      <span class="preview-label__line" key={`${item.id}-${index}`}>
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            ) : null
            }

            {showLoadingState ? (
              <div class="preview-loading" aria-live="polite" role="status">
                <span>{t(locale, "previewGenerating")}</span>
              </div>
            ) : null}
          </div>

          {footer}
        </div>
      </div>
    </div>
  );
}
