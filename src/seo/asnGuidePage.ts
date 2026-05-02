const APP_SETTINGS_KEY = "plasn.settings.v1";

export const ASN_GUIDE_PATH = "/paperless-ngx-asn-labels/";

type Locale = "en" | "de";

type GuideTranslations = {
  htmlLang: string;
  pageTitle: string;
  metaDescription: string;
  topbarSubtitleBefore: string;
  topbarSubtitleLink: string;
  topbarSubtitleAfter: string;
  themeLabel: string;
  localeLabel: string;
  modeAsnLabel: string;
  modeSeparatorLabel: string;
  modeGuideLabel: string;
  openGeneratorHref: string;
  docsLabel: string;
  docsHref: string;
  supportLabel: string;
  supportHref: string;
  heroEyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroBadgeOne: string;
  heroBadgeTwo: string;
  heroBadgeThree: string;
  heroPrimaryCta: string;
  heroSeparatorCta: string;
  heroSecondaryCta: string;
  heroSecondaryHref: string;
  heroNoteTitle: string;
  heroNoteBody: string;
  whyTitle: string;
  whyLead: string;
  whyPointOne: string;
  whyPointTwo: string;
  whyPointThree: string;
  stepsTitle: string;
  stepOneTitle: string;
  stepOneBody: string;
  stepTwoTitle: string;
  stepTwoBody: string;
  stepThreeTitle: string;
  stepThreeBody: string;
  exampleTitle: string;
  exampleBody: string;
  exampleCaptionOne: string;
  exampleCaptionTwo: string;
  configTitle: string;
  configLead: string;
  configRequiredTitle: string;
  configOptionalTitle: string;
  configNote: string;
  configDocsLabel: string;
  configDocsHref: string;
  sheetsTitle: string;
  sheetsLead: string;
  sheetCardOneTitle: string;
  sheetCardOneBody: string;
  sheetCardTwoTitle: string;
  sheetCardTwoBody: string;
  sheetCardThreeTitle: string;
  sheetCardThreeBody: string;
  printTitle: string;
  printLead: string;
  printPointOne: string;
  printPointTwo: string;
  printPointThree: string;
  printPointFour: string;
  footerGuideLabel: string;
  footerGitHub: string;
  footerIssues: string;
  footerGitHubHref: string;
  footerIssuesHref: string;
};

const translations: Record<Locale, GuideTranslations> = {
  en: {
    htmlLang: "en",
    pageTitle: "ASN Labels for Paperless-ngx | Plasn",
    metaDescription:
      "Print calibrated ASN labels for Paperless-ngx with Plasn. Generate QR label sheets, export exact PDFs, and fine-tune Avery or Zweckform A4 layouts before printing.",
    topbarSubtitleBefore: "Create printable ASN label sheets and separator pages for",
    topbarSubtitleLink: "Paperless-ngx",
    topbarSubtitleAfter: ".",
    themeLabel: "Toggle theme",
    localeLabel: "Switch language",
    modeAsnLabel: "ASN labels",
    modeSeparatorLabel: "Separator sheets",
    modeGuideLabel: "ASN guide",
    openGeneratorHref: "/",
    docsLabel: "Paperless-ngx docs",
    docsHref: "https://docs.paperless-ngx.com/",
    supportLabel: "GitHub",
    supportHref: "https://github.com/peterthepeter/plasn",
    heroEyebrow: "Focused print workflow for Paperless-ngx",
    heroTitle: "Print ASN labels for Paperless-ngx.",
    heroBody:
      "Plasn helps you generate calibrated ASN QR label sheets, preview the result before wasting stock, and export print-ready PDFs for repeatable Paperless-ngx setups.",
    heroBadgeOne: "A4 label sheets",
    heroBadgeTwo: "Calibration aware",
    heroBadgeThree: "Browser based",
    heroPrimaryCta: "Open the ASN label generator",
    heroSeparatorCta: "Open separator sheets",
    heroSecondaryCta: "Jump to configuration",
    heroSecondaryHref: "#paperless-setup",
    heroNoteTitle: "Why this page exists",
    heroNoteBody:
      "People searching for Paperless-ngx ASN labels usually need one thing: a reliable way to print small QR labels that actually line up. Plasn is built exactly for that workflow.",
    whyTitle: "What Plasn is good at",
    whyLead:
      "The app stays focused on the practical parts of ASN printing instead of trying to be a generic design tool.",
    whyPointOne:
      "Generate ASN QR labels with predictable A4 geometry for Paperless-ngx.",
    whyPointTwo:
      "Use overlay test sheets and calibration values before printing on real labels.",
    whyPointThree:
      "Keep repeatable settings in the browser for future batches and sheet types.",
    stepsTitle: "How the workflow usually looks",
    stepOneTitle: "1. Pick the matching sheet",
    stepOneBody:
      "Start with a preset such as Avery or Zweckform when available. If your exact stock is missing, use the custom sheet geometry.",
    stepTwoTitle: "2. Set the ASN range",
    stepTwoBody:
      "Choose the start number, digits, prefix, and label order. Plasn builds the exact visible text and keeps the full ASN value in the QR code.",
    stepThreeTitle: "3. Preview, calibrate, then print",
    stepThreeBody:
      "Check the preview, print the overlay test sheet on plain paper if needed, and export the final PDF at exact size.",
    exampleTitle: "Real-world sheet examples",
    exampleBody:
      "These examples show Avery Zweckform L4731 labels generated with Plasn. They are included here so you can quickly judge the density and readability of the printed output.",
    exampleCaptionOne: "Full printed sheet on Avery Zweckform L4731",
    exampleCaptionTwo: "Close-up of the resulting ASN labels",
    configTitle: "Paperless-ngx configuration for ASN detection",
    configLead:
      "You can set these values in Docker, Compose, or directly in the Paperless-ngx configuration UI. If the same option is set in the UI, the UI value takes precedence.",
    configRequiredTitle: "Required for ASN labels",
    configOptionalTitle:
      "Optional for custom prefixes, broader barcode handling, and better small-code detection",
    configNote:
      "If you keep the default ASN prefix, you usually only need the required option. The optional scanner settings help when labels are very small or printer quality is inconsistent.",
    configDocsLabel: "Open the Paperless-ngx barcode configuration docs",
    configDocsHref: "https://docs.paperless-ngx.com/configuration/#PAPERLESS_CONSUMER_ASN_BARCODE_PREFIX",
    sheetsTitle: "Label sheets that fit this workflow well",
    sheetsLead:
      "Plasn is especially useful for compact A4 label stock where printer drift, small code sizes, and page scaling can ruin otherwise valid ASN labels.",
    sheetCardOneTitle: "Avery and Zweckform presets",
    sheetCardOneBody:
      "Built-in presets cover common label sheets so you can start with sane dimensions instead of measuring everything from scratch.",
    sheetCardTwoTitle: "Custom A4 sheet geometry",
    sheetCardTwoBody:
      "If your label stock is different, Plasn lets you define rows, columns, margins, gaps, and label size yourself.",
    sheetCardThreeTitle: "Calibration profiles per sheet",
    sheetCardThreeBody:
      "Offset and pitch adjustments are stored per preset, which makes it easier to keep one working setup for each label stock.",
    printTitle: "Printing tips",
    printLead:
      "Most bad ASN label results come from printer scaling or sheet drift, not from the QR code itself.",
    printPointOne: "Print at 100% or Actual size only.",
    printPointTwo: "Avoid borderless A4, Fit to page, and automatic margins.",
    printPointThree:
      "If the first labels look fine but later ones drift, adjust pitch rather than offset.",
    printPointFour:
      "If everything is shifted equally, print an overlay sheet and correct offset first.",
    footerGuideLabel: "ASN label guide",
    footerGitHub: "View source on GitHub",
    footerIssues: "Report an issue",
    footerGitHubHref: "https://github.com/peterthepeter/plasn",
    footerIssuesHref: "https://github.com/peterthepeter/plasn/issues",
  },
  de: {
    htmlLang: "de",
    pageTitle: "ASN-Etiketten für Paperless-ngx | Plasn",
    metaDescription:
      "Drucke kalibrierte ASN-Etiketten für Paperless-ngx mit Plasn. Erzeuge QR-Etikettenbögen, exportiere exakte PDFs und richte Avery- oder Zweckform-A4-Layouts vor dem Druck sauber aus.",
    topbarSubtitleBefore: "Erzeugt druckbare ASN-Etiketten und Trennblätter für",
    topbarSubtitleLink: "Paperless-ngx",
    topbarSubtitleAfter: ".",
    themeLabel: "Farbschema wechseln",
    localeLabel: "Sprache wechseln",
    modeAsnLabel: "ASN-Etiketten",
    modeSeparatorLabel: "Trennblätter",
    modeGuideLabel: "ASN-Info",
    openGeneratorHref: "/",
    docsLabel: "Paperless-ngx-Doku",
    docsHref: "https://docs.paperless-ngx.com/",
    supportLabel: "GitHub",
    supportHref: "https://github.com/peterthepeter/plasn",
    heroEyebrow: "Präziser Druck-Workflow für Paperless-ngx",
    heroTitle: "ASN-Etiketten für Paperless-ngx drucken",
    heroBody:
      "Plasn hilft dir dabei, kalibrierte ASN-QR-Etikettenbögen zu erzeugen, das Ergebnis vor dem echten Druck zu prüfen und exakte PDFs für wiederholbare Paperless-ngx-Setups zu exportieren.",
    heroBadgeOne: "A4-Etikettenbögen",
    heroBadgeTwo: "Kalibrierbar",
    heroBadgeThree: "Im Browser",
    heroPrimaryCta: "ASN-Etiketten-Generator öffnen",
    heroSeparatorCta: "Trennblätter öffnen",
    heroSecondaryCta: "Zur Konfiguration springen",
    heroSecondaryHref: "#paperless-setup",
    heroNoteTitle: "Wofür diese Seite gedacht ist",
    heroNoteBody:
      "Wer nach ASN-Etiketten für Paperless-ngx sucht, braucht meist vor allem eins: einen verlässlichen Weg, kleine QR-Etiketten so zu drucken, dass sie wirklich passen. Genau dafür ist Plasn gebaut.",
    whyTitle: "Wobei Plasn besonders hilft",
    whyLead:
      "Die App konzentriert sich auf den praktischen ASN-Druck-Workflow statt auf allgemeine Layout-Spielereien.",
    whyPointOne:
      "ASN-QR-Etiketten mit vorhersehbarer A4-Geometrie für Paperless-ngx erzeugen.",
    whyPointTwo:
      "Overlay-Testbögen und Kalibrierwerte nutzen, bevor echtes Etikettenmaterial verbraucht wird.",
    whyPointThree:
      "Wiederverwendbare Einstellungen pro Bogen und Einsatzzweck direkt im Browser behalten.",
    stepsTitle: "So läuft der Workflow typischerweise ab",
    stepOneTitle: "1. Passenden Bogen wählen",
    stepOneBody:
      "Starte möglichst mit einem Preset wie Avery oder Zweckform. Wenn dein Material fehlt, kannst du die Bogengeometrie frei definieren.",
    stepTwoTitle: "2. ASN-Bereich festlegen",
    stepTwoBody:
      "Setze Startnummer, Stellenzahl, Präfix und Etikettenreihenfolge. Plasn erzeugt den sichtbaren Text und behält den vollständigen ASN-Wert im QR-Code bei.",
    stepThreeTitle: "3. Prüfen, kalibrieren, drucken",
    stepThreeBody:
      "Prüfe die Vorschau, drucke bei Bedarf den Overlay-Testbogen auf Normalpapier und exportiere erst dann das finale PDF in exakter Größe.",
    exampleTitle: "Beispiele aus der Praxis",
    exampleBody:
      "Diese Beispiele zeigen mit Plasn erzeugte Avery-Zweckform-L4731-Etiketten. So lässt sich schnell einschätzen, wie dicht und lesbar das Druckbild in der Praxis wirkt.",
    exampleCaptionOne: "Kompletter Druckbogen auf Avery Zweckform L4731",
    exampleCaptionTwo: "Nahaufnahme der erzeugten ASN-Etiketten",
    configTitle: "Paperless-ngx-Konfiguration für ASN-Erkennung",
    configLead:
      "Du kannst diese Werte in Docker, Compose oder direkt in der Paperless-ngx-Konfiguration setzen. Wenn dieselbe Option in der UI gesetzt ist, hat die UI Vorrang.",
    configRequiredTitle: "Erforderlich für ASN-Etiketten",
    configOptionalTitle:
      "Optional für eigene Präfixe, allgemeine Barcode-Erkennung und bessere Erkennung sehr kleiner Codes",
    configNote:
      "Wenn du das Standardpräfix ASN verwendest, reicht meist die Pflichtoption. Die optionalen Scanner-Einstellungen helfen vor allem bei sehr kleinen Etiketten oder schwankender Druckqualität.",
    configDocsLabel: "Paperless-ngx-Doku zur Barcode-Konfiguration öffnen",
    configDocsHref: "https://docs.paperless-ngx.com/configuration/#PAPERLESS_CONSUMER_ASN_BARCODE_PREFIX",
    sheetsTitle: "Etikettenbögen, für die sich dieser Workflow besonders eignet",
    sheetsLead:
      "Plasn ist vor allem bei kompakten A4-Etikettenbögen hilfreich, bei denen Druckerdrift, kleine Codes und Seitenskalierung sonst schnell zu Problemen führen.",
    sheetCardOneTitle: "Avery- und Zweckform-Presets",
    sheetCardOneBody:
      "Für gängige Etikettenbögen gibt es eingebaute Presets, damit du nicht jede Größe von Hand vermessen musst.",
    sheetCardTwoTitle: "Eigene A4-Bogengeometrie",
    sheetCardTwoBody:
      "Wenn dein Material abweicht, kannst du Zeilen, Spalten, Ränder, Abstände und Etikettengröße selbst festlegen.",
    sheetCardThreeTitle: "Kalibrierprofile pro Etikettenbogen",
    sheetCardThreeBody:
      "Offset- und Pitch-Anpassungen werden pro Preset gespeichert. So bleibt für jeden Bogen ein funktionierendes Setup erhalten.",
    printTitle: "Druckhinweise",
    printLead:
      "Die meisten schlechten ASN-Etiketten entstehen nicht durch den QR-Code selbst, sondern durch Skalierung im Druckdialog oder durch Bogenversatz.",
    printPointOne: "Nur mit 100 % oder Tatsächlicher Größe drucken.",
    printPointTwo: "Kein randloses A4, kein An Seite anpassen und keine automatischen Ränder.",
    printPointThree:
      "Wenn die ersten Etiketten passen, spätere aber driften, zuerst Pitch statt Offset anpassen.",
    printPointFour:
      "Wenn alles gleichmäßig verschoben ist, zuerst den Overlay-Bogen drucken und dann den Offset korrigieren.",
    footerGuideLabel: "Leitfaden für ASN-Etiketten",
    footerGitHub: "Quellcode auf GitHub ansehen",
    footerIssues: "Issue melden",
    footerGitHubHref: "https://github.com/peterthepeter/plasn",
    footerIssuesHref: "https://github.com/peterthepeter/plasn/issues",
  },
};

const pageCss = `
@font-face {
  font-family: "Public Sans";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/public-sans-400.ttf") format("truetype");
}

@font-face {
  font-family: "Public Sans";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/public-sans-500.ttf") format("truetype");
}

@font-face {
  font-family: "Public Sans";
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url("/fonts/public-sans-600.ttf") format("truetype");
}

@font-face {
  font-family: "Public Sans";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("/fonts/public-sans-700.ttf") format("truetype");
}

@font-face {
  font-family: "Public Sans";
  font-style: normal;
  font-weight: 800;
  font-display: swap;
  src: url("/fonts/public-sans-800.ttf") format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("/fonts/source-code-pro-400.ttf") format("truetype");
}

@font-face {
  font-family: "Source Code Pro";
  font-style: normal;
  font-weight: 500;
  font-display: swap;
  src: url("/fonts/source-code-pro-500.ttf") format("truetype");
}

:root {
  color-scheme: dark;
  font-family: "Public Sans", system-ui, sans-serif;
  --page-surface: #121518;
  --canvas-surface: #1b1f23;
  --surface-container: rgba(24, 28, 31, 0.72);
  --primary: #eef2f1;
  --on-surface: #ffffff;
  --on-surface-variant: #adaaaa;
  --card-surface: var(--canvas-surface);
  --card-surface-soft: rgba(255, 255, 255, 0.018);
  --card-border: rgba(255, 255, 255, 0.055);
  --control-radius: 10px;
  --control-height: 2.05rem;
  --control-padding-x: 0.82rem;
  --control-text-size: 0.82rem;
  --button-flat-surface: rgba(24, 28, 31, 0.9);
  --button-flat-surface-hover: rgba(31, 36, 40, 0.96);
  --button-flat-border: rgba(255, 255, 255, 0.09);
  --button-flat-border-strong: rgba(255, 255, 255, 0.16);
  --button-flat-active-surface: rgba(56, 62, 68, 0.96);
  --button-flat-active-border: rgba(255, 255, 255, 0.2);
  --button-flat-shadow: 0 1px 0 rgba(255, 255, 255, 0.035);
  --chrome-link-strong: #ffffff;
  --noise-line: rgba(255, 255, 255, 0.008);
  --icon-button-hover-surface: rgba(255, 255, 255, 0.03);
  --icon-button-active-surface: rgba(255, 255, 255, 0.02);
  --icon-button-active-border: rgba(255, 255, 255, 0.12);
  --segmented-button-surface: rgba(255, 255, 255, 0.018);
  --segmented-button-hover-surface: rgba(255, 255, 255, 0.032);
  --segmented-button-active-surface: rgba(255, 255, 255, 0.05);
  --segmented-button-border: rgba(255, 255, 255, 0.08);
  --segmented-button-border-hover: rgba(255, 255, 255, 0.14);
  --segmented-button-border-active: rgba(255, 255, 255, 0.18);
  --segmented-button-text: #c2c8cd;
  --aux-button-text: #9fa7ad;
  --switcher-accent-line: rgba(255, 255, 255, 0.46);
  --help-note-surface-soft: rgba(169, 192, 187, 0.1);
  --help-note-surface: rgba(169, 192, 187, 0.12);
  --code-surface: rgba(255, 255, 255, 0.02);
  --code-color: #d8dcde;
  --warning-stack-surface: #1f1f1f;
  --layout-width: 76rem;
}

:root[data-theme="light"] {
  color-scheme: light;
  --page-surface: #f3efe8;
  --canvas-surface: #fcfaf7;
  --surface-container: rgba(255, 253, 249, 0.88);
  --primary: #1b2125;
  --on-surface: #1f2428;
  --on-surface-variant: #69706f;
  --card-surface: rgba(255, 253, 250, 0.9);
  --card-surface-soft: rgba(255, 255, 255, 0.58);
  --card-border: rgba(27, 33, 37, 0.09);
  --button-flat-surface: rgba(252, 250, 247, 0.92);
  --button-flat-surface-hover: rgba(245, 240, 233, 0.98);
  --button-flat-border: rgba(27, 33, 37, 0.12);
  --button-flat-border-strong: rgba(27, 33, 37, 0.2);
  --button-flat-active-surface: rgba(226, 235, 231, 0.98);
  --button-flat-active-border: rgba(46, 71, 64, 0.26);
  --button-flat-shadow: 0 1px 0 rgba(255, 255, 255, 0.74);
  --chrome-link-strong: #1f2428;
  --noise-line: rgba(24, 30, 34, 0.035);
  --icon-button-hover-surface: rgba(27, 33, 37, 0.045);
  --icon-button-active-surface: rgba(27, 33, 37, 0.03);
  --icon-button-active-border: rgba(27, 33, 37, 0.12);
  --segmented-button-surface: rgba(27, 33, 37, 0.02);
  --segmented-button-hover-surface: rgba(27, 33, 37, 0.045);
  --segmented-button-active-surface: rgba(46, 71, 64, 0.1);
  --segmented-button-border: rgba(27, 33, 37, 0.08);
  --segmented-button-border-hover: rgba(27, 33, 37, 0.14);
  --segmented-button-border-active: rgba(46, 71, 64, 0.2);
  --segmented-button-text: #4f595f;
  --aux-button-text: #667171;
  --switcher-accent-line: rgba(46, 71, 64, 0.34);
  --help-note-surface-soft: rgba(71, 115, 100, 0.1);
  --help-note-surface: rgba(71, 115, 100, 0.12);
  --code-surface: rgba(27, 33, 37, 0.03);
  --code-color: #20262a;
  --warning-stack-surface: rgba(255, 253, 250, 0.72);
}

* {
  box-sizing: border-box;
}

html,
body {
  min-height: 100%;
}

body {
  margin: 0;
  background: var(--page-surface);
  color: var(--on-surface);
  font-feature-settings: "cv05" 1;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a,
button {
  font: inherit;
}

.landing-shell {
  position: relative;
  padding: 1rem 2rem 2rem;
  overflow: hidden;
}

.app-noise {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(var(--noise-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--noise-line) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at center, black, transparent 80%);
  opacity: 0.12;
}

.topbar {
  position: sticky;
  top: 1rem;
  z-index: 20;
  display: grid;
  gap: 0.55rem;
  margin: 0 auto 1.8rem;
  max-width: var(--layout-width);
  padding: 0.2rem 0.15rem 0.35rem;
  background: transparent;
  border: 0;
}

.topbar__top {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.topbar__controls {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.brand-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.brand-row__logo {
  width: 2.5rem;
  height: 2.5rem;
  display: block;
  margin-top: 0.05rem;
}

.brand-row h1 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--primary);
}

.topbar__subtitle {
  margin: 0;
  color: var(--on-surface-variant);
  font-size: 0.86rem;
  line-height: 1.45;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.2rem;
}

.topbar__subtitle a,
.section-card a,
.guide-footer a {
  color: var(--primary);
  text-decoration: none;
}

.topbar__subtitle a:hover,
.section-card a:hover,
.guide-footer a:hover {
  text-decoration: underline;
}

.locale-switcher__button {
  border: 1px solid transparent;
  background: transparent;
  color: var(--on-surface-variant);
  min-height: 0;
  padding: 0.08rem;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.locale-switcher__button:hover {
  background: var(--icon-button-hover-surface);
  color: var(--on-surface);
}

.locale-switcher__button--active {
  color: var(--on-surface);
  border-color: transparent;
  background: transparent;
}

.locale-switcher__icon {
  width: 1.42rem;
  height: 1.42rem;
}

.mode-switcher {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.mode-switcher__button,
.guide-link-button {
  position: relative;
  border: 1px solid var(--segmented-button-border);
  min-height: 2.42rem;
  padding: 0 0.8rem;
  border-radius: 10px;
  background: var(--segmented-button-surface);
  color: var(--segmented-button-text);
  box-shadow: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: var(--control-text-size);
  font-weight: 560;
  line-height: 1;
  letter-spacing: 0.015em;
  text-decoration: none;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    border-color 180ms ease,
    transform 180ms ease;
}

.mode-switcher__icon {
  width: 1.42rem;
  height: 1.42rem;
  flex: none;
}

.mode-switcher__icon--asn {
  width: 1.28rem;
  height: 1.28rem;
}

.mode-switcher__button:hover,
.guide-link-button:hover {
  background: var(--segmented-button-hover-surface);
  border-color: var(--segmented-button-border-hover);
  color: var(--on-surface);
  transform: translateY(-1px);
  text-decoration: none;
}

.hero-card__actions .guide-link-button:hover {
  text-decoration: none;
}

.mode-switcher__button--active,
.guide-link-button--active {
  background: var(--segmented-button-active-surface);
  border-color: var(--segmented-button-border-active);
  color: var(--on-surface);
}

.mode-switcher__button--active::after,
.guide-link-button--active::after {
  content: none;
}

.mode-switcher__aux-group {
  display: inline-flex;
  align-items: center;
  gap: 1.1rem;
  margin-left: auto;
  flex-wrap: wrap;
}

.mode-switcher__aux-link {
  color: var(--aux-button-text);
  text-decoration: none;
  font-size: var(--control-text-size);
  font-weight: 560;
  line-height: 1;
  padding: 0 0 0.42rem;
}

.mode-switcher__aux-link:hover {
  color: var(--on-surface);
  text-decoration: none;
}

.layout-grid {
  max-width: var(--layout-width);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 23.8rem) minmax(0, 50.8rem);
  gap: 1rem;
  align-items: start;
  justify-content: center;
}

.control-column,
.preview-column {
  display: grid;
  gap: 1rem;
  width: 100%;
  min-width: 0;
}

.section-card {
  padding: 1rem;
  background: var(--card-surface);
  border: 1px solid var(--card-border);
  border-radius: var(--control-radius);
}

.control-column .section-card {
  background: var(--card-surface-soft);
}

.section-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.85rem;
}

.section-card__header h2,
.section-card__header h3 {
  margin: 0;
  color: var(--primary);
  font-size: 1.02rem;
  font-weight: 650;
}

.section-card__meta {
  display: grid;
  gap: 0.3rem;
  margin-bottom: 0.75rem;
}

.section-card__meta strong,
.section-card__meta span,
.section-card p,
.section-card li {
  color: var(--on-surface-variant);
  font-size: 0.88rem;
  line-height: 1.55;
}

.hero-card {
  padding: 1.2rem;
}

.hero-card__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 1.8rem;
  padding: 0 0.72rem;
  border-radius: 999px;
  background: var(--help-note-surface);
  color: var(--primary);
  font-size: 0.76rem;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero-card h2 {
  margin: 0.9rem 0 0;
  color: var(--primary);
  font-size: clamp(1.75rem, 2.55vw, 2.35rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  max-width: none;
}

.hero-card > p {
  margin: 1rem 0 0;
  max-width: 48rem;
  font-size: 0.96rem;
}

.hero-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.hero-card__badge {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  padding: 0 0.72rem;
  border-radius: 999px;
  border: 1px solid var(--card-border);
  background: var(--button-flat-surface);
  color: var(--on-surface-variant);
  font-size: 0.8rem;
}

.hero-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.58rem;
  margin-top: 1.1rem;
}

.hero-card__note {
  margin-top: 1rem;
  padding: 0.95rem 1rem;
  border-radius: 12px;
  background: var(--warning-stack-surface);
  border: 1px solid var(--card-border);
}

.hero-card__note strong {
  display: block;
  color: var(--primary);
  font-size: 0.82rem;
  margin-bottom: 0.35rem;
}

.hero-card__note p {
  margin: 0;
}

.bullet-list,
.steps-list,
.tips-list {
  margin: 0;
  padding-left: 1.05rem;
  display: grid;
  gap: 0.55rem;
}

.steps-list li strong {
  display: block;
  color: var(--primary);
  font-size: 0.86rem;
  margin-bottom: 0.12rem;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.example-figure {
  margin: 0;
  display: grid;
  gap: 0.42rem;
}

.example-figure img {
  width: 100%;
  display: block;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid var(--card-border);
}

.example-figure figcaption {
  color: var(--on-surface-variant);
  font-size: 0.78rem;
  line-height: 1.45;
}

.config-blocks {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.config-block {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--code-surface);
}

.config-block h3 {
  margin: 0 0 0.55rem;
  color: var(--primary);
  font-size: 0.9rem;
}

.config-block pre {
  margin: 0;
  overflow-x: auto;
  font-family: "Source Code Pro", monospace;
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--code-color);
}

.sheet-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 0.9rem;
}

.sheet-card {
  padding: 0.95rem;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--card-surface-soft);
}

.sheet-card h3 {
  margin: 0 0 0.45rem;
  color: var(--primary);
  font-size: 0.92rem;
}

.guide-footer {
  max-width: var(--layout-width);
  margin: 2.5rem auto 0;
  padding: 0 0.25rem 1rem;
  display: flex;
  justify-content: flex-end;
}

.guide-footer__content {
  display: grid;
  gap: 0.8rem;
  justify-items: end;
}

.guide-footer__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.75rem;
}

.github-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 0;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: 0;
  color: var(--on-surface-variant);
  font-size: var(--control-text-size);
  font-weight: 520;
  line-height: 1;
  letter-spacing: 0.01em;
  text-decoration: none;
}

.github-link--primary {
  color: var(--chrome-link-strong);
}

.github-link__icon {
  width: 1rem;
  height: 1rem;
  flex: none;
}

@media (max-width: 980px) {
  .landing-shell {
    padding-inline: 1rem;
  }

  .layout-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .sheet-grid,
  .example-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .mode-switcher__aux-group {
    margin-left: 0;
    width: 100%;
  }

  .hero-card h2 {
    max-width: none;
  }

  .guide-footer {
    justify-content: flex-start;
  }

  .guide-footer__content,
  .guide-footer__links {
    justify-items: start;
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .topbar__top {
    flex-direction: column;
  }

  .topbar__controls {
    align-self: flex-end;
  }
}
`;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function createGuideSchema(siteRootUrl: string): string {
  const url = `${siteRootUrl}${ASN_GUIDE_PATH.slice(1)}`;

  return JSON.stringify(
    [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "ASN Labels for Paperless-ngx",
        url,
        description:
          "Guide to printing ASN labels for Paperless-ngx with calibrated QR label sheets and exact PDFs using Plasn.",
        isPartOf: {
          "@type": "WebSite",
          name: "Plasn",
          url: siteRootUrl,
        },
        about: [
          "Paperless-ngx",
          "ASN labels",
          "QR label sheets",
          "A4 label printing",
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "Print ASN labels for Paperless-ngx",
        step: [
          {
            "@type": "HowToStep",
            name: "Choose the label sheet",
            text: "Start with a matching Avery or Zweckform preset, or define your own A4 sheet geometry.",
          },
          {
            "@type": "HowToStep",
            name: "Configure the ASN range",
            text: "Set start number, digits, prefix, and label order for the sheet.",
          },
          {
            "@type": "HowToStep",
            name: "Preview, calibrate, and print",
            text: "Use the preview and overlay test sheet before exporting the exact PDF.",
          },
        ],
      },
    ],
    null,
    2,
  );
}

export function createAsnGuidePage(siteRootUrl: string): string {
  const defaultLocale = translations.en;
  const localized = JSON.stringify(translations);
  const schemaJson = createGuideSchema(siteRootUrl);

  return `<!doctype html>
<html lang="${defaultLocale.htmlLang}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(defaultLocale.pageTitle)}</title>
    <meta name="description" content="${escapeHtmlAttribute(defaultLocale.metaDescription)}" />
    <link rel="canonical" href="${escapeHtmlAttribute(siteRootUrl + ASN_GUIDE_PATH.slice(1))}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Plasn" />
    <meta property="og:title" content="${escapeHtmlAttribute(defaultLocale.pageTitle)}" />
    <meta property="og:description" content="${escapeHtmlAttribute(defaultLocale.metaDescription)}" />
    <meta property="og:url" content="${escapeHtmlAttribute(siteRootUrl + ASN_GUIDE_PATH.slice(1))}" />
    <meta property="og:image" content="${escapeHtmlAttribute(siteRootUrl + "plasn-mark-256.png")}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtmlAttribute(defaultLocale.pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtmlAttribute(defaultLocale.metaDescription)}" />
    <meta name="twitter:image" content="${escapeHtmlAttribute(siteRootUrl + "plasn-mark-256.png")}" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="icon" type="image/svg+xml" href="/plasn-mark.svg" />
    <link rel="icon" type="image/png" href="/plasn-mark-256.png" />
    <style>${pageCss}</style>
    <script type="application/ld+json">${escapeHtml(schemaJson)}</script>
  </head>
  <body>
    <div class="landing-shell">
      <div class="app-noise"></div>
      <header class="topbar">
        <div class="topbar__top">
          <div class="topbar__brand">
            <div class="brand-row">
              <img alt="" aria-hidden="true" class="brand-row__logo" height="40" src="/plasn-mark.svg" width="40" />
              <h1>Plasn</h1>
              <p class="topbar__subtitle">
                <span data-i18n="topbarSubtitleBefore"></span>
                <a data-i18n="topbarSubtitleLink" href="https://docs.paperless-ngx.com/" rel="noreferrer" target="_blank"></a>
                <span data-i18n="topbarSubtitleAfter"></span>
              </p>
            </div>
          </div>
          <div class="topbar__controls">
            <button aria-label="${escapeHtmlAttribute(defaultLocale.themeLabel)}" class="locale-switcher__button locale-switcher__button--active" data-theme-toggle type="button">
              <span data-theme-icon></span>
            </button>
            <button aria-label="${escapeHtmlAttribute(defaultLocale.localeLabel)}" class="locale-switcher__button locale-switcher__button--active" data-locale-toggle type="button">
              <span data-locale-icon>
                <svg aria-hidden="true" class="locale-switcher__icon" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="10" cy="10" r="7.1" stroke="currentColor" stroke-width="1.6"></circle>
                  <path d="M2.9 10h14.2M10 2.9c1.8 2 2.8 4.5 2.8 7.1 0 2.6-1 5.1-2.8 7.1M10 2.9C8.2 4.9 7.2 7.4 7.2 10c0 2.6 1 5.1 2.8 7.1" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"></path>
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div class="mode-switcher">
          <a class="mode-switcher__button" href="/">
            <svg aria-hidden="true" class="mode-switcher__icon mode-switcher__icon--asn" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <rect x="3.25" y="3.25" width="13.5" height="13.5" rx="3" stroke="currentColor" stroke-width="1.5"></rect>
              <rect x="5.3" y="5.3" width="3.2" height="3.2" rx=".5" fill="currentColor"></rect>
              <rect x="11.5" y="5.3" width="1.6" height="1.6" rx=".3" fill="currentColor"></rect>
              <rect x="13.9" y="5.3" width="1.6" height="3.2" rx=".3" fill="currentColor"></rect>
              <rect x="5.3" y="11.5" width="1.6" height="1.6" rx=".3" fill="currentColor"></rect>
              <rect x="7.7" y="11.5" width="3.2" height="3.2" rx=".4" fill="currentColor"></rect>
              <rect x="12.3" y="10.7" width="3.2" height="1.6" rx=".3" fill="currentColor"></rect>
              <rect x="12.3" y="13.1" width="1.6" height="1.6" rx=".3" fill="currentColor"></rect>
              <rect x="14.7" y="13.1" width=".8" height="1.6" rx=".2" fill="currentColor"></rect>
            </svg>
            <span data-i18n="modeAsnLabel"></span>
          </a>
          <a class="mode-switcher__button" href="/?mode=separator">
            <svg aria-hidden="true" class="mode-switcher__icon" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.1 3.5h5.9l2.8 2.8v9.2a1 1 0 0 1-1 1H6.1a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"></path>
              <path d="M12 3.6v3h3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>
              <path d="M7.3 9.3h5.4M7.3 11.4h5.4M7.3 13.5h3.8" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"></path>
            </svg>
            <span data-i18n="modeSeparatorLabel"></span>
          </a>
          <a class="mode-switcher__button mode-switcher__button--active" href="/paperless-ngx-asn-labels/">
            <svg aria-hidden="true" class="mode-switcher__icon" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="3.5" width="12" height="13" rx="2.25" stroke="currentColor" stroke-width="1.5"></rect>
              <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"></path>
            </svg>
            <span data-i18n="modeGuideLabel"></span>
          </a>
          <div class="mode-switcher__aux-group">
            <a class="mode-switcher__aux-link" data-i18n="docsLabel" href="https://docs.paperless-ngx.com/" rel="noreferrer" target="_blank"></a>
            <a class="mode-switcher__aux-link" data-i18n="supportLabel" href="https://github.com/peterthepeter/plasn" rel="noreferrer" target="_blank"></a>
          </div>
        </div>
      </header>

      <main class="layout-grid">
        <section class="control-column">
          <article class="section-card">
            <div class="section-card__header">
              <h2 data-i18n="whyTitle"></h2>
            </div>
            <p data-i18n="whyLead"></p>
            <ul class="bullet-list">
              <li data-i18n="whyPointOne"></li>
              <li data-i18n="whyPointTwo"></li>
              <li data-i18n="whyPointThree"></li>
            </ul>
          </article>

          <article class="section-card">
            <div class="section-card__header">
              <h2 data-i18n="stepsTitle"></h2>
            </div>
            <ol class="steps-list">
              <li>
                <strong data-i18n="stepOneTitle"></strong>
                <span data-i18n="stepOneBody"></span>
              </li>
              <li>
                <strong data-i18n="stepTwoTitle"></strong>
                <span data-i18n="stepTwoBody"></span>
              </li>
              <li>
                <strong data-i18n="stepThreeTitle"></strong>
                <span data-i18n="stepThreeBody"></span>
              </li>
            </ol>
          </article>

          <article class="section-card">
            <div class="section-card__header">
              <h2 data-i18n="printTitle"></h2>
            </div>
            <p data-i18n="printLead"></p>
            <ul class="tips-list">
              <li data-i18n="printPointOne"></li>
              <li data-i18n="printPointTwo"></li>
              <li data-i18n="printPointThree"></li>
              <li data-i18n="printPointFour"></li>
            </ul>
          </article>
        </section>

        <section class="preview-column">
          <article class="section-card hero-card">
            <span class="hero-card__eyebrow" data-i18n="heroEyebrow"></span>
            <h2 data-i18n="heroTitle"></h2>
            <p data-i18n="heroBody"></p>
            <div class="hero-card__badges">
              <span class="hero-card__badge" data-i18n="heroBadgeOne"></span>
              <span class="hero-card__badge" data-i18n="heroBadgeTwo"></span>
              <span class="hero-card__badge" data-i18n="heroBadgeThree"></span>
            </div>
            <div class="hero-card__actions">
              <a class="guide-link-button" href="/">
                <svg aria-hidden="true" class="mode-switcher__icon mode-switcher__icon--asn" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3.25" y="3.25" width="13.5" height="13.5" rx="3" stroke="currentColor" stroke-width="1.5"></rect>
                  <rect x="5.3" y="5.3" width="3.2" height="3.2" rx=".5" fill="currentColor"></rect>
                  <rect x="11.5" y="5.3" width="1.6" height="1.6" rx=".3" fill="currentColor"></rect>
                  <rect x="13.9" y="5.3" width="1.6" height="3.2" rx=".3" fill="currentColor"></rect>
                  <rect x="5.3" y="11.5" width="1.6" height="1.6" rx=".3" fill="currentColor"></rect>
                  <rect x="7.7" y="11.5" width="3.2" height="3.2" rx=".4" fill="currentColor"></rect>
                  <rect x="12.3" y="10.7" width="3.2" height="1.6" rx=".3" fill="currentColor"></rect>
                  <rect x="12.3" y="13.1" width="1.6" height="1.6" rx=".3" fill="currentColor"></rect>
                  <rect x="14.7" y="13.1" width=".8" height="1.6" rx=".2" fill="currentColor"></rect>
                </svg>
                <span data-i18n="heroPrimaryCta"></span>
              </a>
              <a class="guide-link-button" href="/?mode=separator">
                <svg aria-hidden="true" class="mode-switcher__icon" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.1 3.5h5.9l2.8 2.8v9.2a1 1 0 0 1-1 1H6.1a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-linejoin="round" stroke-width="1.5"></path>
                  <path d="M12 3.6v3h3" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>
                  <path d="M7.3 9.3h5.4M7.3 11.4h5.4M7.3 13.5h3.8" stroke="currentColor" stroke-linecap="round" stroke-width="1.5"></path>
                </svg>
                <span data-i18n="heroSeparatorCta"></span>
              </a>
              <a class="guide-link-button" data-i18n="heroSecondaryCta" href="#paperless-setup"></a>
            </div>
            <div class="hero-card__note">
              <strong data-i18n="heroNoteTitle"></strong>
              <p data-i18n="heroNoteBody"></p>
            </div>
          </article>

          <article class="section-card">
            <div class="section-card__header">
              <h2 data-i18n="exampleTitle"></h2>
            </div>
            <p data-i18n="exampleBody"></p>
            <div class="example-grid">
              <figure class="example-figure">
                <img alt="" src="/print-examples/avery-zweckform-l4731-sheet.jpeg" />
                <figcaption data-i18n="exampleCaptionOne"></figcaption>
              </figure>
              <figure class="example-figure">
                <img alt="" src="/print-examples/avery-zweckform-l4731-closeup.jpeg" />
                <figcaption data-i18n="exampleCaptionTwo"></figcaption>
              </figure>
            </div>
          </article>

          <article class="section-card" id="paperless-setup">
            <div class="section-card__header">
              <h2 data-i18n="configTitle"></h2>
            </div>
            <p data-i18n="configLead"></p>
            <div class="config-blocks">
              <section class="config-block">
                <h3 data-i18n="configRequiredTitle"></h3>
                <pre>PAPERLESS_CONSUMER_ENABLE_ASN_BARCODE=true</pre>
              </section>
              <section class="config-block">
                <h3 data-i18n="configOptionalTitle"></h3>
                <pre>PAPERLESS_CONSUMER_ASN_BARCODE_PREFIX=YOUR_PREFIX
PAPERLESS_CONSUMER_ENABLE_BARCODES=true
PAPERLESS_CONSUMER_BARCODE_SCANNER=ZXING
PAPERLESS_CONSUMER_BARCODE_DPI=600
PAPERLESS_CONSUMER_BARCODE_UPSCALE=1.5</pre>
              </section>
            </div>
            <p data-i18n="configNote"></p>
            <p>
              <a data-i18n="configDocsLabel" href="https://docs.paperless-ngx.com/configuration/#PAPERLESS_CONSUMER_ASN_BARCODE_PREFIX" rel="noreferrer" target="_blank"></a>
            </p>
          </article>

          <article class="section-card">
            <div class="section-card__header">
              <h2 data-i18n="sheetsTitle"></h2>
            </div>
            <p data-i18n="sheetsLead"></p>
            <div class="sheet-grid">
              <section class="sheet-card">
                <h3 data-i18n="sheetCardOneTitle"></h3>
                <p data-i18n="sheetCardOneBody"></p>
              </section>
              <section class="sheet-card">
                <h3 data-i18n="sheetCardTwoTitle"></h3>
                <p data-i18n="sheetCardTwoBody"></p>
              </section>
              <section class="sheet-card">
                <h3 data-i18n="sheetCardThreeTitle"></h3>
                <p data-i18n="sheetCardThreeBody"></p>
              </section>
            </div>
          </article>
        </section>
      </main>

      <footer class="guide-footer">
        <div class="guide-footer__content">
          <div class="guide-footer__links">
            <a class="github-link github-link--primary" href="https://github.com/peterthepeter/plasn" rel="noreferrer" target="_blank">
              <svg aria-hidden="true" class="github-link__icon" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.63 7.63 0 0 1 8 4.84a7.7 7.7 0 0 1 2.01.27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z"></path>
              </svg>
              <span data-i18n="footerGitHub"></span>
            </a>
            <a class="github-link" data-i18n="footerIssues" href="https://github.com/peterthepeter/plasn/issues" rel="noreferrer" target="_blank"></a>
          </div>
        </div>
      </footer>
    </div>
    <script>
      const translations = ${localized};
      const settingsKey = "${APP_SETTINGS_KEY}";
      const root = document.documentElement;
      const localeButton = document.querySelector("[data-locale-toggle]");
      const themeButton = document.querySelector("[data-theme-toggle]");
      const themeIcon = document.querySelector("[data-theme-icon]");

      function themeIconSvg(mode) {
        if (mode === "light") {
          return '<svg aria-hidden="true" class="locale-switcher__icon" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="3.25" stroke="currentColor" stroke-width="1.6"></circle><path d="M10 2.75v2.1M10 15.15v2.1M17.25 10h-2.1M4.85 10h-2.1M15.12 4.88l-1.48 1.48M6.36 13.64l-1.48 1.48M15.12 15.12l-1.48-1.48M6.36 6.36 4.88 4.88" stroke="currentColor" stroke-linecap="round" stroke-width="1.6"></path></svg>';
        }

        if (mode === "dark") {
          return '<svg aria-hidden="true" class="locale-switcher__icon" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M12.85 3.45a6.45 6.45 0 1 0 3.7 11.74 6.7 6.7 0 0 1-2.3.41 6.6 6.6 0 0 1-6.6-6.6c0-.82.15-1.62.42-2.36a6.44 6.44 0 0 0 4.78-3.19Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6"></path></svg>';
        }

        return '<svg aria-hidden="true" class="locale-switcher__icon" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="3.25" y="4" width="13.5" height="9.2" rx="2" stroke="currentColor" stroke-width="1.6"></rect><path d="M7.25 16h5.5M10 13.2V16" stroke="currentColor" stroke-linecap="round" stroke-width="1.6"></path><circle cx="13.5" cy="7.6" r="1.35" stroke="currentColor" stroke-width="1.4"></circle><path d="M13.5 5.1v.7M13.5 9.4v.7M16 7.6h-.7M11.7 7.6H11" stroke="currentColor" stroke-linecap="round" stroke-width="1.4"></path></svg>';
      }

      function loadStoredSettings() {
        try {
          const raw = localStorage.getItem(settingsKey);
          return raw ? JSON.parse(raw) : {};
        } catch {
          return {};
        }
      }

      function detectLocale(settings) {
        if (settings.locale === "de" || settings.locale === "en") {
          return settings.locale;
        }
        return navigator.language && navigator.language.toLowerCase().startsWith("de")
          ? "de"
          : "en";
      }

      function detectThemeMode(settings) {
        if (
          settings.themeMode === "light" ||
          settings.themeMode === "dark" ||
          settings.themeMode === "system"
        ) {
          return settings.themeMode;
        }
        return "system";
      }

      function applyLocale(locale) {
        const copy = translations[locale] || translations.en;
        document.documentElement.lang = copy.htmlLang;
        document.title = copy.pageTitle;
        const description = document.querySelector('meta[name="description"]');
        if (description) {
          description.setAttribute("content", copy.metaDescription);
        }
        document.querySelectorAll("[data-i18n]").forEach((node) => {
          const key = node.getAttribute("data-i18n");
          if (!key || !(key in copy)) {
            return;
          }
          node.textContent = copy[key];
        });
        localeButton.setAttribute("aria-label", copy.localeLabel);
        themeButton.setAttribute("aria-label", copy.themeLabel);
      }

      function resolveTheme(themeMode) {
        if (themeMode === "system") {
          return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
        }
        return themeMode;
      }

      function applyTheme(themeMode) {
        root.setAttribute("data-theme", resolveTheme(themeMode));
        if (themeIcon) {
          themeIcon.innerHTML = themeIconSvg(themeMode);
        }
      }

      const storedSettings = loadStoredSettings();
      let currentLocale = detectLocale(storedSettings);
      let currentThemeMode = detectThemeMode(storedSettings);

      applyLocale(currentLocale);
      applyTheme(currentThemeMode);

      localeButton.addEventListener("click", () => {
        currentLocale = currentLocale === "de" ? "en" : "de";
        applyLocale(currentLocale);
      });

      themeButton.addEventListener("click", () => {
        currentThemeMode =
          currentThemeMode === "system"
            ? "light"
            : currentThemeMode === "light"
              ? "dark"
              : "system";
        applyTheme(currentThemeMode);
      });
    </script>
  </body>
</html>`;
}
