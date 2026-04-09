import { useEffect, useRef, useState } from "preact/hooks";

const LABEL_COLOR_PRESETS = [
  { value: "#000000", label: "Black" },
  { value: "#1D4ED8", label: "Blue" },
  { value: "#1E3A8A", label: "Navy" },
  { value: "#0F766E", label: "Teal" },
  { value: "#166534", label: "Green" },
  { value: "#7C2D12", label: "Brown" },
  { value: "#9A3412", label: "Orange" },
  { value: "#7E22CE", label: "Violet" },
  { value: "#B91C1C", label: "Red" },
  { value: "#374151", label: "Slate" },
];

function sanitizeHexDraft(value: string): string {
  const normalized = value.toUpperCase().replace(/[^#0-9A-F]/g, "");
  if (normalized === "") {
    return "";
  }

  const withSingleHash = normalized.startsWith("#")
    ? `#${normalized.slice(1).replace(/#/g, "")}`
    : `#${normalized.replace(/#/g, "")}`;

  return withSingleHash.slice(0, 7);
}

interface ColorFieldProps {
  label: string;
  value: string;
  draft: string;
  onDraftChange: (value: string) => void;
  onCommit: (value: string) => void;
}

export function ColorField({
  label,
  value,
  draft,
  onDraftChange,
  onCommit,
}: ColorFieldProps) {
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const colorMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isColorMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!colorMenuRef.current?.contains(event.target as Node)) {
        setIsColorMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isColorMenuOpen]);

  return (
    <div class="color-field">
      <span class="color-field__label">{label}</span>
      <div class="color-field__combo" ref={colorMenuRef}>
        <div
          aria-hidden="true"
          class="color-field__swatch-preview"
          style={{ backgroundColor: value }}
        />
        <div class="color-field__input-wrap">
          <input
            aria-label={label}
            class="color-field__input"
            onBlur={() => onCommit(draft)}
            onInput={(event) =>
              onDraftChange(
                sanitizeHexDraft((event.currentTarget as HTMLInputElement).value),
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onCommit(draft);
              }
            }}
            placeholder="#000000"
            spellcheck={false}
            type="text"
            value={draft}
          />
        </div>
        <button
          aria-expanded={isColorMenuOpen}
          aria-haspopup="listbox"
          aria-label={`${label} presets`}
          class="color-menu__trigger"
          onClick={() => setIsColorMenuOpen((current) => !current)}
          type="button"
        >
          <span aria-hidden="true" class="color-menu__chevron">
            <svg
              class="color-menu__chevron-icon"
              fill="none"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m4 6 4 4 4-4"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.6"
              />
            </svg>
          </span>
        </button>
        {isColorMenuOpen ? (
          <div class="color-menu__popover" role="listbox">
            {LABEL_COLOR_PRESETS.map((color) => (
              <button
                aria-selected={value === color.value}
                class={`color-menu__option${
                  value === color.value ? " color-menu__option--active" : ""
                }`}
                key={color.value}
                onClick={() => {
                  onCommit(color.value);
                  setIsColorMenuOpen(false);
                }}
                role="option"
                type="button"
              >
                <span
                  aria-hidden="true"
                  class="color-menu__dot color-menu__dot--option"
                  style={{ backgroundColor: color.value }}
                />
                <span class="color-menu__option-label">{color.label}</span>
                <span class="color-menu__option-value">{color.value}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
