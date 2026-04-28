import { fireEvent, render, screen } from "@testing-library/preact";
import { App } from "../App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = "";
  });

  it("switches between english and german copy", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: /Plasn/i })).toBeInTheDocument();
    expect(screen.getByText(/Start number/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Deutsch/i }));

    expect(screen.getByText(/Startnummer/i)).toBeInTheDocument();
  });

  it("creates a new calibration profile next to default", () => {
    render(<App />);

    fireEvent.input(screen.getByRole("combobox", { name: /Profile/i }), {
      target: { value: "__new_profile__" },
    });

    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toContain("Default");
    expect(options).toContain("New profile");
    expect(options).toContain("New profile…");
  });

  it("creates a new calibration profile in german UI", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Deutsch/i }));
    fireEvent.input(screen.getByRole("combobox", { name: /Profil/i }), {
      target: { value: "__new_profile__" },
    });

    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toContain("Default");
    expect(options).toContain("Neues Profil");
    expect(options).toContain("Neues Profil…");
  });

  it("shows the profile name field only for custom profiles", () => {
    render(<App />);

    expect(screen.queryByRole("textbox", { name: /Name/i })).not.toBeInTheDocument();

    fireEvent.input(screen.getByRole("combobox", { name: /Profile/i }), {
      target: { value: "__new_profile__" },
    });

    expect(screen.getByRole("textbox", { name: /Name/i })).toBeInTheDocument();
  });

  it("switches into separator mode and shows separator-specific fields", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Separator sheets/i }));

    expect(screen.getByText(/Paper size/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Barcode value/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Headline/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Free text/i })).toBeInTheDocument();
  });

  it("shows separator-specific paperless setup variables", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Separator sheets/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /Paperless-ngx setup/i }),
    );

    expect(screen.getByText(/PAPERLESS_CONSUMER_ENABLE_BARCODES=true/i)).toBeInTheDocument();
    expect(
      screen.getByText(/PAPERLESS_CONSUMER_BARCODE_STRING=PATCHT/i),
    ).toBeInTheDocument();
  });

  it("shows export actions only after generating", async () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: /^Generate$|^Generieren$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Download PDF|PDF herunterladen/i }),
    ).not.toBeInTheDocument();
  });

  it("uses the page count field for multi-page previews", () => {
    render(<App />);

    fireEvent.input(screen.getByRole("spinbutton", { name: /Pages/i }), {
      target: { value: "2" },
    });

    expect(
      screen.queryByRole("textbox", { name: /Start position/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /^Generate$|^Generieren$/i }),
    );

    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Next page/i }));

    expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();
  });

  it("clamps the page count field to ten pages", () => {
    render(<App />);

    fireEvent.input(screen.getByRole("spinbutton", { name: /Pages/i }), {
      target: { value: "11" },
    });

    expect(screen.getByRole("spinbutton", { name: /Pages/i })).toHaveValue(10);
  });

  it("shows start position again when returning to one page", () => {
    render(<App />);

    fireEvent.input(screen.getByRole("textbox", { name: /Start position/i }), {
      target: { value: "150" },
    });

    fireEvent.input(screen.getByRole("spinbutton", { name: /Pages/i }), {
      target: { value: "2" },
    });
    expect(
      screen.queryByRole("textbox", { name: /Start position/i }),
    ).not.toBeInTheDocument();

    fireEvent.input(screen.getByRole("spinbutton", { name: /Pages/i }), {
      target: { value: "1" },
    });

    expect(
      screen.getByRole("textbox", { name: /Start position/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /Start position/i }),
    ).toHaveValue("1");
  });

  it("keeps one page selected when start position moves deeper into the sheet", () => {
    render(<App />);

    fireEvent.input(screen.getByRole("textbox", { name: /Start position/i }), {
      target: { value: "150" },
    });

    expect(screen.getByRole("spinbutton", { name: /Pages/i })).toHaveValue(1);
    expect(screen.getByRole("textbox", { name: /Start position/i })).toHaveValue("150");
    expect(screen.getByRole("textbox", { name: /Count/i })).toHaveValue("40");
  });

  it("opens the workflow help modal in german UI", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Deutsch/i }));
    fireEvent.click(screen.getByRole("button", { name: /Ablaufhilfe/i }));

    expect(screen.getByRole("heading", { name: /Ablaufplan/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Etikettenbogen auswählen/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Wenn alle Etiketten ungefähr gleich falsch sitzen/i),
    ).toBeInTheDocument();
  });

  it("marks generated output stale when text visibility toggles change", () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: /^Generate$|^Generieren$/i }),
    );
    expect(
      screen.getByRole("button", { name: /Download PDF|PDF herunterladen/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("switch", { name: /Show prefix|Präfix anzeigen/i }),
    );

    expect(
      screen.getByRole("button", { name: /^Generate$|^Generieren$/i }),
    ).toBeInTheDocument();
  });

  it("auto-generates when enabled", () => {
    render(<App />);

    fireEvent.click(
      screen.getByRole("button", { name: /Auto-generate|Auto-Generieren/i }),
    );
    fireEvent.click(
      screen.getByRole("switch", { name: /Show prefix|Präfix anzeigen/i }),
    );

    expect(
      screen.getByRole("button", { name: /Download PDF|PDF herunterladen/i }),
    ).toBeInTheDocument();
  });

  it("switches to light theme and persists the choice", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /^Theme: Auto/i }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(localStorage.getItem("plasn.settings.v1")).toContain('"themeMode":"light"');
  });

  it("loads a stored dark theme selection on startup", () => {
    localStorage.setItem("plasn.settings.v1", JSON.stringify({ themeMode: "dark" }));

    render(<App />);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(screen.getByRole("button", { name: /^Theme: Dark/i })).toBeInTheDocument();
  });
});
