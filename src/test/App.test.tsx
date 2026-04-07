import { fireEvent, render, screen } from "@testing-library/preact";
import { App } from "../App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
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

    fireEvent.click(screen.getByRole("button", { name: /Profile actions/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /New profile/i }));

    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toContain("Default");
    expect(options).toContain("New profile");
  });

  it("creates a new calibration profile in german UI", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /Deutsch/i }));
    fireEvent.click(screen.getByRole("button", { name: /Profilaktionen/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Neues Profil/i }));

    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options).toContain("Default");
    expect(options).toContain("Neues Profil");
  });

  it("keeps the default calibration profile name protected", () => {
    render(<App />);

    expect(screen.getByRole("textbox", { name: /Name/i })).toBeDisabled();
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
      screen.getByRole("button", {
        name: /Paperless-ngx setup for barcode and ASN detection/i,
      }),
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
      screen.getByRole("button", { name: /Show prefix in text|Präfix im Text/i }),
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
      screen.getByRole("button", { name: /Show prefix in text|Präfix im Text/i }),
    );

    expect(
      screen.getByRole("button", { name: /Download PDF|PDF herunterladen/i }),
    ).toBeInTheDocument();
  });
});
