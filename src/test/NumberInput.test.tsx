import { fireEvent, render, screen } from "@testing-library/preact";
import { useState } from "preact/hooks";
import { NumberInput } from "../components/NumberInput";

function NumberInputHarness() {
  const [value, setValue] = useState(210);

  return (
    <>
      <label>
        Page width
        <NumberInput
          onInput={(event) => {
            setValue(Number((event.currentTarget as HTMLInputElement).value) || 210);
          }}
          step="0.01"
          value={value}
        />
      </label>
      <output aria-label="Committed value">{String(value)}</output>
    </>
  );
}

function BoundedNumberInputHarness() {
  const [value, setValue] = useState(100);

  return (
    <>
      <label>
        QR code size
        <NumberInput
          max={100}
          min={85}
          onInput={(event) => {
            const nextValue = Number((event.currentTarget as HTMLInputElement).value);
            setValue(Math.min(100, Math.max(85, Math.round(nextValue))));
          }}
          step="1"
          value={value}
        />
      </label>
      <output aria-label="Bounded committed value">{String(value)}</output>
    </>
  );
}

describe("NumberInput", () => {
  it("allows clearing a field before blur resets it to its fallback value", () => {
    render(<NumberInputHarness />);

    const input = screen.getByRole("spinbutton", {
      name: /page width/i,
    }) as HTMLInputElement;

    fireEvent.input(input, { target: { value: "" } });

    expect(input.value).toBe("");
    expect(screen.getByLabelText(/Committed value/i)).toHaveTextContent("210");

    fireEvent.blur(input);

    expect(input.value).toBe("210");
    expect(screen.getByLabelText(/Committed value/i)).toHaveTextContent("210");
  });

  it("accepts comma decimals and commits them as numeric values", () => {
    render(<NumberInputHarness />);

    const input = screen.getByRole("spinbutton", {
      name: /page width/i,
    }) as HTMLInputElement;

    fireEvent.input(input, { target: { value: "123,45" } });

    expect(input.value).toBe("123,45");
    expect(screen.getByLabelText(/Committed value/i)).toHaveTextContent("123.45");

    fireEvent.blur(input);

    expect(screen.getByLabelText(/Committed value/i)).toHaveTextContent("123.45");
  });

  it("keeps out-of-range intermediate input visible until the value is complete", () => {
    render(<BoundedNumberInputHarness />);

    const input = screen.getByRole("spinbutton", {
      name: /qr code size/i,
    }) as HTMLInputElement;

    fireEvent.input(input, { target: { value: "" } });
    fireEvent.input(input, { target: { value: "9" } });

    expect(input.value).toBe("9");
    expect(screen.getByLabelText(/Bounded committed value/i)).toHaveTextContent("100");

    fireEvent.input(input, { target: { value: "95" } });

    expect(input.value).toBe("95");
    expect(screen.getByLabelText(/Bounded committed value/i)).toHaveTextContent("95");
  });
});
