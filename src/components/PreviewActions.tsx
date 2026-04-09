import type { JSX } from "preact";
import { t } from "../core/i18n";
import type { Locale } from "../core/types";

interface IconProps {
  class?: string;
}

interface PreviewActionsProps {
  locale: Locale;
  hasGeneratedExport: boolean;
  isExporting: boolean;
  canExport: boolean;
  canGenerate: boolean;
  isAutoGenerate: boolean;
  pageCount: number;
  pageIndex: number;
  onGenerate: () => void;
  onDownloadPdf: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPrint: () => void;
  onReset: () => void;
  onToggleAutoGenerate: () => void;
  DownloadIcon: (props: IconProps) => JSX.Element;
  PrintIcon: (props: IconProps) => JSX.Element;
}

export function PreviewActions({
  locale,
  hasGeneratedExport,
  isExporting,
  canExport,
  canGenerate,
  isAutoGenerate,
  pageCount,
  pageIndex,
  onGenerate,
  onDownloadPdf,
  onNextPage,
  onPreviousPage,
  onPrint,
  onReset,
  onToggleAutoGenerate,
  DownloadIcon,
  PrintIcon,
}: PreviewActionsProps) {
  return (
    <div class="preview-actions">
      <div class="preview-actions__primary">
        {hasGeneratedExport ? (
          <>
            <button
              class="button button--primary button--with-icon"
              disabled={isExporting || !canExport}
              onClick={onDownloadPdf}
              type="button"
            >
              <DownloadIcon class="button__icon" />
              {t(locale, "buttonPdf")}
            </button>
            <button
              class="button button--primary button--with-icon"
              disabled={isExporting || !canExport}
              onClick={onPrint}
              type="button"
            >
              <PrintIcon class="button__icon" />
              {t(locale, "buttonPrint")}
            </button>
            {pageCount > 1 ? (
              <div class="preview-actions__pager" role="group">
                <button
                  aria-label={t(locale, "buttonPreviousPage")}
                  class="preview-actions__pager-button"
                  disabled={pageIndex <= 0}
                  onClick={onPreviousPage}
                  type="button"
                >
                  ‹
                </button>
                <button
                  aria-label={t(locale, "buttonNextPage")}
                  class="preview-actions__pager-button"
                  disabled={pageIndex >= pageCount - 1}
                  onClick={onNextPage}
                  type="button"
                >
                  ›
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <button
            class="button button--primary"
            disabled={!canGenerate}
            onClick={onGenerate}
            type="button"
          >
            {t(locale, "buttonGenerate")}
          </button>
        )}
      </div>
      <div class="preview-actions__secondary">
        <button
          class="button button--text preview-actions__link"
          onClick={onReset}
          type="button"
        >
          {t(locale, "buttonReset")}
        </button>
        <button
          aria-pressed={isAutoGenerate}
          class={`output-toggle preview-actions__toggle${
            isAutoGenerate ? " output-toggle--active" : ""
          }`}
          onClick={onToggleAutoGenerate}
          type="button"
        >
          <span class="output-toggle__label">
            {t(locale, "buttonAutoGenerate")}
          </span>
          <span
            aria-hidden="true"
            class={`output-toggle__switch${
              isAutoGenerate ? " output-toggle__switch--active" : ""
            }`}
          >
            <span class="output-toggle__thumb" />
          </span>
        </button>
      </div>
    </div>
  );
}
