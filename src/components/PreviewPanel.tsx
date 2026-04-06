import { useEffect, useRef, useState } from "preact/hooks";
import { getRunTotalWidth } from "../core/code128";
import { getQrDataUrl } from "../core/qr";
import type { GeneratedDocumentLayout, Locale } from "../core/types";
import { t } from "../core/i18n";

interface PreviewPanelProps {
  layout: GeneratedDocumentLayout | null;
  locale: Locale;
  qrColor: string;
  textColor: string;
  pageIndex: number;
  onPageChange: (pageIndex: number) => void;
}

export function PreviewPanel({
  layout,
  locale,
  qrColor,
  textColor,
  pageIndex,
  onPageChange,
}: PreviewPanelProps) {
  if (!layout) {
    return (
      <div class="preview-empty">
        <p>{t(locale, "previewGenerateHint")}</p>
      </div>
    );
  }

  const page = layout.pages[pageIndex];
  const asnPage = layout.kind === "asn" ? layout.pages[pageIndex] : null;
  const separatorPage =
    layout.kind === "separator" ? layout.pages[pageIndex] : null;
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [scale, setScale] = useState(1.8);
  const surfaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!asnPage && !separatorPage) {
      setQrMap({});
      return;
    }

    if (!asnPage) {
      setQrMap({});
      return;
    }

    Promise.all(
      asnPage.items.map(async (item) => ({
        text: item.encodedText,
        url: await getQrDataUrl(item.encodedText, qrColor),
      })),
    ).then((entries) => {
      if (cancelled) {
        return;
      }
      setQrMap(
        Object.fromEntries(entries.map((entry) => [entry.text, entry.url])),
      );
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
      const availableWidth = Math.max(element.clientWidth - 24, 220);
      setScale(Math.min(3.2, availableWidth / page.pageWidthMm));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, [page?.pageWidthMm]);

  if (!page) {
    return (
      <div class="preview-empty">
        <p>{t(locale, "previewNoPages")}</p>
      </div>
    );
  }

  return (
    <div class="preview-shell">
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
        {layout.pages.length > 1 ? (
          <div class="preview-toolbar__actions">
            <button
              class="preview-toolbar__nav"
              disabled={pageIndex <= 0}
              onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
              type="button"
            >
              ‹
            </button>
            <button
              class="preview-toolbar__nav"
              disabled={pageIndex >= layout.pages.length - 1}
              onClick={() =>
                onPageChange(Math.min(layout.pages.length - 1, pageIndex + 1))
              }
              type="button"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>

      <div class="preview-surface" ref={surfaceRef}>
        <div
          class="preview-page"
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
          ) : (
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
                    left: `${(item.textXmm - item.xMm + item.textOffsetMm) * scale}px`,
                    top: `${(item.textYmm - item.yMm) * scale}px`,
                    width: `${item.textWidthMm * scale}px`,
                    height: `${item.textHeightMm * scale}px`,
                    fontSize: `${item.textSizeMm * scale}px`,
                    color: textColor,
                    transform: `scaleX(${item.textScaleX})`,
                  }}
                >
                  {item.displayText}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
