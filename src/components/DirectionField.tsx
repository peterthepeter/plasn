import { useEffect, useRef, useState } from "preact/hooks";
import { t } from "../core/i18n";
import type { GeneratorConfig, Locale } from "../core/types";

interface DirectionFieldProps {
  locale: Locale;
  value: GeneratorConfig["numberingDirection"];
  onChange: (value: GeneratorConfig["numberingDirection"]) => void;
}

export function DirectionField({ locale, value, onChange }: DirectionFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const options: Array<{
    value: GeneratorConfig["numberingDirection"];
    shortLabel: string;
    detail: string;
  }> = [
    {
      value: "row",
      shortLabel: t(locale, "optionRowShort"),
      detail: t(locale, "optionRowDetail"),
    },
    {
      value: "column",
      shortLabel: t(locale, "optionColumnShort"),
      detail: t(locale, "optionColumnDetail"),
    },
  ];

  const activeOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <div class="field field--span-2">
      <span>{t(locale, "fieldDirection")}</span>
      <div class="direction-field" ref={menuRef}>
        <button
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          class="direction-field__trigger"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span class="direction-field__trigger-label">{activeOption.shortLabel}</span>
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
        {isOpen ? (
          <div class="direction-field__popover" role="listbox">
            {options.map((option) => (
              <button
                aria-selected={option.value === value}
                class={`direction-field__option${
                  option.value === value ? " direction-field__option--active" : ""
                }`}
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                type="button"
              >
                <span class="direction-field__option-title">{option.shortLabel}</span>
                <span class="direction-field__option-detail">{option.detail}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
