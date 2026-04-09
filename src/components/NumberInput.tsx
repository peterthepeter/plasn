import type { JSX } from "preact";
import { useRef } from "preact/hooks";

type NumberInputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type">;

export function NumberInput(props: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isDisabled = Boolean(props.disabled || props.readOnly);

  const stepValue = (direction: 1 | -1) => {
    const input = inputRef.current;
    if (!input || isDisabled) {
      return;
    }

    if (direction > 0) {
      input.stepUp();
    } else {
      input.stepDown();
    }

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  };

  return (
    <span class="number-input">
      <input {...props} ref={inputRef} type="number" />
      <span aria-hidden="true" class="number-input__steppers">
        <button
          class="number-input__stepper number-input__stepper--up"
          disabled={isDisabled}
          onClick={() => stepValue(1)}
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
          onClick={() => stepValue(-1)}
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
