import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";

type NumberInputProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value"
> & {
  value: number;
};

const PARTIAL_NUMBER_PATTERN = /^[-+]?([.,])?$/;

function parseNumericProp(value: number | string | undefined): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getFractionPrecision(value: number | string | undefined): number {
  if (value === undefined) {
    return 0;
  }

  const normalized = String(value).toLowerCase();
  if (normalized.includes("e-")) {
    return Number.parseInt(normalized.split("e-")[1] ?? "0", 10) || 0;
  }

  const [, fraction = ""] = normalized.split(".");
  return fraction.length;
}

function roundToPrecision(value: number, precision: number): number {
  if (precision <= 0) {
    return Math.round(value);
  }

  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function formatDisplayValue(value: number, lang: string | undefined): string {
  return new Intl.NumberFormat(lang, {
    maximumFractionDigits: 20,
    useGrouping: false,
  }).format(value);
}

function sanitizeRawValue(rawValue: string, allowsFraction: boolean): string {
  let sanitized = "";
  let hasSeparator = false;

  for (const char of rawValue) {
    if ((char === "-" || char === "+") && sanitized.length === 0) {
      sanitized += char;
      continue;
    }

    if (/\d/.test(char)) {
      sanitized += char;
      continue;
    }

    if (allowsFraction && !hasSeparator && (char === "." || char === ",")) {
      sanitized += char;
      hasSeparator = true;
    }
  }

  return sanitized;
}

function parseLocalizedNumber(rawValue: string): number | undefined {
  if (rawValue.trim() === "") {
    return undefined;
  }

  const parsed = Number(rawValue.replaceAll(",", "."));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function isWithinBounds(
  value: number | undefined,
  minimumValue: number | undefined,
  maximumValue: number | undefined,
): boolean {
  if (value === undefined) {
    return false;
  }

  if (minimumValue !== undefined && value < minimumValue) {
    return false;
  }

  if (maximumValue !== undefined && value > maximumValue) {
    return false;
  }

  return true;
}

function shouldCommitOnBlur(rawValue: string): boolean {
  return !PARTIAL_NUMBER_PATTERN.test(rawValue) && parseLocalizedNumber(rawValue) !== undefined;
}

function shouldCommitDuringInput(
  rawValue: string,
  minimumValue: number | undefined,
  maximumValue: number | undefined,
): boolean {
  if (/^[-+]?0$/.test(rawValue)) {
    return false;
  }

  const parsedValue = parseLocalizedNumber(rawValue);
  return (
    shouldCommitOnBlur(rawValue) &&
    isWithinBounds(parsedValue, minimumValue, maximumValue) &&
    !rawValue.endsWith(".") &&
    !rawValue.endsWith(",")
  );
}

export function NumberInput(props: NumberInputProps) {
  const {
    disabled,
    readOnly,
    value,
    min,
    max,
    step,
    onInput,
    onBlur,
    inputMode,
    role,
    lang,
    ...inputProps
  } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isDisabled = Boolean(disabled || readOnly);
  const minimumValue = parseNumericProp(min);
  const maximumValue = parseNumericProp(max);
  const stepValueSize = parseNumericProp(step) ?? 1;
  const fractionPrecision = Math.max(
    getFractionPrecision(step),
    Number.isInteger(value) ? 0 : 20,
    minimumValue !== undefined && !Number.isInteger(minimumValue) ? 20 : 0,
    maximumValue !== undefined && !Number.isInteger(maximumValue) ? 20 : 0,
  );
  const allowsFraction = fractionPrecision > 0;
  const [draft, setDraft] = useState(() => formatDisplayValue(value, lang));
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const formattedValue = formatDisplayValue(value, lang);
    if (!isEditing) {
      setDraft(formattedValue);
      return;
    }

    const parsedDraftValue = parseLocalizedNumber(draft);
    const shouldSyncWhileEditing =
      parsedDraftValue !== undefined &&
      !/^[-+]?0$/.test(draft) &&
      isWithinBounds(parsedDraftValue, minimumValue, maximumValue) &&
      Math.abs(parsedDraftValue - value) > Number.EPSILON &&
      !draft.endsWith(".") &&
      !draft.endsWith(",");

    if (shouldSyncWhileEditing) {
      setDraft(formattedValue);
    }
  }, [draft, isEditing, lang, value]);

  const commitToParent = (rawValue: string, sourceEvent: Event) => {
    if (!onInput) {
      return;
    }

    const input = inputRef.current;
    if (!input) {
      return;
    }

    const nextValue =
      rawValue === ""
        ? ""
        : String(parseLocalizedNumber(rawValue) ?? "");
    const previousValue = input.value;
    input.value = nextValue;
    onInput(sourceEvent as never);
    input.value = previousValue;
  };

  const handleInput = (event: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const input = event.currentTarget;
    const sanitized = sanitizeRawValue(input.value, allowsFraction);
    if (sanitized !== input.value) {
      input.value = sanitized;
    }

    setIsEditing(true);
    setDraft(sanitized);

    if (shouldCommitDuringInput(sanitized, minimumValue, maximumValue)) {
      commitToParent(sanitized, event);
    }
  };

  const handleBlur = (event: JSX.TargetedFocusEvent<HTMLInputElement>) => {
    const rawValue = sanitizeRawValue(event.currentTarget.value, allowsFraction);
    setDraft(rawValue);
    setIsEditing(false);

    if (shouldCommitOnBlur(rawValue)) {
      commitToParent(rawValue, event);
    } else {
      commitToParent("", event);
    }

    onBlur?.(event);
  };

  const stepValue = (direction: 1 | -1, event: MouseEvent) => {
    const input = inputRef.current;
    if (!input || isDisabled) {
      return;
    }

    const parsedDraftValue = parseLocalizedNumber(input.value);
    const currentValue =
      parsedDraftValue ?? value ?? minimumValue ?? 0;
    let nextValue = currentValue + direction * stepValueSize;

    if (minimumValue !== undefined) {
      nextValue = Math.max(minimumValue, nextValue);
    }
    if (maximumValue !== undefined) {
      nextValue = Math.min(maximumValue, nextValue);
    }

    const roundedValue = roundToPrecision(nextValue, fractionPrecision);
    input.value = formatDisplayValue(roundedValue, lang);
    input.dispatchEvent(new Event("input", { bubbles: true }));

    input.focus();
    event.preventDefault();
  };

  return (
    <span class="number-input">
      <input
        {...inputProps}
        aria-valuemax={maximumValue}
        aria-valuemin={minimumValue}
        aria-valuenow={parseLocalizedNumber(draft)}
        disabled={disabled}
        inputMode={inputMode ?? (allowsFraction ? "decimal" : "numeric")}
        onBlur={handleBlur}
        onInput={handleInput}
        readOnly={readOnly}
        ref={inputRef}
        role={role ?? "spinbutton"}
        type="text"
        value={draft}
      />
      <span aria-hidden="true" class="number-input__steppers">
        <button
          class="number-input__stepper number-input__stepper--up"
          disabled={isDisabled}
          onClick={(event) => stepValue(1, event)}
          onMouseDown={(event) => event.preventDefault()}
          tabIndex={-1}
          type="button"
        >
          <svg fill="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 6.5 5 3.5l3 3"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.2"
            />
          </svg>
        </button>
        <button
          class="number-input__stepper number-input__stepper--down"
          disabled={isDisabled}
          onClick={(event) => stepValue(-1, event)}
          onMouseDown={(event) => event.preventDefault()}
          tabIndex={-1}
          type="button"
        >
          <svg fill="none" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
            <path
              d="m2 3.5 3 3 3-3"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.2"
            />
          </svg>
        </button>
      </span>
    </span>
  );
}
