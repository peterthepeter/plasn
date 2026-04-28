import type { LayoutWarning, Locale } from "./types";

type Dictionary = Record<string, string>;

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    appTitle: "Plasn",
    appSubtitle: "Create printable ASN label sheets and separator pages for Paperless-ngx.",
    footerCredit:
      "Inspired from the original ASN QR code label generator by Tobias L. Maier.",
    footerGitHub: "View source on GitHub",
    footerIssues: "Report an issue",
    appTagline: "Precision ASN QR labels for Paperless-ngx.",
    heroTitle: "Editorial-grade ASN label printing without the browser lottery.",
    heroBody:
      "Generate calibrated QR label sheets, export exact PDFs, and keep repeatable settings for Paperless-ngx.",
    heroBadge: "Offline-first. A4-focused. Bilingual.",
    sectionGenerator: "Configuration",
    sectionSeparator: "Separator sheets",
    generatorHelpOpen: "Open configuration help",
    generatorHelpTitle: "Configuration help",
    generatorHelpIntro:
      "These settings define which ASN labels are generated on the current sheet.",
    generatorHelpStartPositionTitle: "Start position",
    generatorHelpStartPositionBody:
      "Use a slot number like 1 to continue on a partly used sheet.",
    generatorHelpRangeTitle: "End number and count",
    generatorHelpRangeBody:
      "If an end number is set, it overrides the count and defines the exact range.",
    generatorHelpPrefixTitle: "Prefix",
    generatorHelpPrefixBody:
      "If this differs from ASN, update the prefix in Paperless-ngx as well.",
    generatorHelpVisibleTextTitle: "Visible label text",
    generatorHelpVisibleTextBody:
      "Turning off the prefix or leading zeros only changes the printed text. The QR code always keeps the full value with prefix and leading zeros.",
    sectionSheet: "Sheet setup",
    sectionCalibration: "Calibration",
    calibrationHelpOpen: "Open calibration help",
    calibrationHelpTitle: "Calibration help",
    overlayHelpOpen: "Open overlay test sheet help",
    overlayHelpTitle: "Overlay test sheet help",
    buttonWorkflowHelp: "Workflow help",
    buttonPaperlessSetup: "Paperless-ngx setup",
    workflowHelpTitle: "Workflow guide",
    workflowHelpIntro:
      "Use this guide when you want a quick answer to what to set first, what to print next, and how to correct a bad fit.",
    workflowHelpSheetTitle: "1. Choose the label sheet",
    workflowHelpSheetBody:
      "Start with a matching preset whenever possible. Only use the custom preset when your exact sheet is missing.",
    workflowHelpSheetNote:
      "Tip: the chosen preset controls preview, PDF, and print geometry together.",
    workflowHelpConfigTitle: "2. Set up the labels",
    workflowHelpConfigBody:
      "Set start number first, then either end number or count. Use prefix and digits to define the ASN format.",
    workflowHelpConfigNote:
      "Use start position and numbering direction mainly when continuing on a partly used sheet.",
    workflowHelpGenerateTitle: "3. Generate and review",
    workflowHelpGenerateBody:
      "Generate the sheet and check the preview before printing.",
    workflowHelpGenerateNote:
      "If the text looks cramped, try fewer digits, a shorter prefix, or a larger label format.",
    workflowHelpPrintTitle: "4. Print without scaling",
    workflowHelpPrintBody:
      "Print at 100% or Actual size only.",
    workflowHelpPrintNote:
      "Use the normal A4 print profile, not borderless A4. Also avoid Fit to page, scaling, or automatic margins, or the labels will miss the sheet.",
    workflowHelpFitTitle: "5. Check alignment on paper",
    workflowHelpFitBody:
      "If you are unsure where the error comes from, print the overlay test sheet on plain paper and compare it with a real label sheet against the light.",
    workflowHelpFitNote:
      "That quickly shows whether everything is shifted equally or whether the spacing drifts across the page.",
    workflowHelpCalibrationTitle: "6. Fix misalignment with calibration",
    workflowHelpCalibrationBody:
      "Change Offset X or Y when every label is off by about the same amount. Change Pitch X or Y when the first labels fit but the error gets worse across the sheet.",
    workflowHelpCalibrationNote:
      "Rule of thumb: equal shift = Offset. Growing drift = Pitch. Work in very small steps.",
    workflowHelpProfilesTitle: "7. Save the working setup",
    workflowHelpProfilesBody:
      "Keep a profile once a sheet works cleanly so you do not have to recalibrate next time.",
    workflowHelpProfilesNote:
      "Profiles are stored per preset and can be exported as a backup or for another browser.",
    calibrationHelpIntro:
      "Use calibration only when the print does not land exactly on the sheet.",
    calibrationHelpProfilesTitle: "Profiles and storage",
    calibrationHelpOffsetTitle: "Offset X/Y",
    calibrationHelpOffsetBody:
      "Moves the whole print area left, right, up, or down. Use this when every label is shifted by roughly the same amount.",
    calibrationHelpPitchTitle: "Pitch adjust X/Y",
    calibrationHelpPitchBody:
      "Changes the distance between labels. Use this when the first label looks fine but the error gets larger across rows or columns.",
    calibrationHelpQrScaleTitle: "QR code size",
    calibrationHelpQrScaleBody:
      "Shrinks only the QR code inside its existing space, so the visible text stays exactly where it is. Smaller QR codes leave more edge tolerance, but can be harder to detect depending on printer, scanner, and Paperless-ngx recognition.",
    calibrationHelpExampleTitle: "Quick rule of thumb",
    calibrationHelpExampleBody:
      "Everything is equally offset: use Offset. The drift grows from label to label: use Pitch adjust.",
    modalClose: "Close",
    sectionCustom: "Custom preset",
    sectionPreview: "Preview",
    sectionOutput: "Output",
    fieldLanguage: "Language",
    fieldTheme: "Theme",
    fieldMode: "Mode",
    fieldStartNumber: "Start number",
    fieldEndNumber: "End number",
    fieldCount: "Count",
    fieldPageCount: "Pages",
    fieldPrefix: "Prefix",
    fieldDigits: "Digits",
    fieldQrColor: "QR color",
    fieldTextColor: "Text color",
    fieldTextFont: "Font",
    fieldLabelColorPreset: "Suggested colors",
    fieldShowTextPrefix: "Show prefix",
    fieldShowLeadingZeros: "Show leading zeros",
    fieldDirection: "Label order",
    fieldStartPosition: "Start position",
    fieldPreset: "Label preset",
    fieldCalibrationProfile: "Profile",
    fieldShowBorders: "Debug borders",
    fieldSeparatorPaperSize: "Paper size",
    fieldSeparatorBarcodeValue: "Barcode value",
    fieldSeparatorHeadline: "Headline",
    fieldSeparatorFreeText: "Free text",
    fieldRows: "Rows",
    fieldColumns: "Columns",
    fieldPageWidth: "Page width (mm)",
    fieldPageHeight: "Page height (mm)",
    fieldLabelWidth: "Label width (mm)",
    fieldLabelHeight: "Label height (mm)",
    fieldGutterX: "Horizontal gap (mm)",
    fieldGutterY: "Vertical gap (mm)",
    fieldMarginLeft: "Left margin (mm)",
    fieldMarginTop: "Top margin (mm)",
    fieldInnerPadding: "Inner padding (mm)",
    fieldQrScale: "QR scale",
    fieldTextGap: "Text gap (mm)",
    fieldOffsetX: "Offset X (mm)",
    fieldOffsetY: "Offset Y (mm)",
    fieldPitchX: "Pitch X (mm)",
    fieldPitchY: "Pitch Y (mm)",
    fieldCalibrationQrScale: "QR code size (85-100%)",
    fieldProfileName: "Name",
    optionColumnShort: "Column-first",
    optionRowShort: "Row-first",
    optionColumnDetail: "Top to bottom, left to right",
    optionRowDetail: "Left to right, top to bottom",
    optionColumn: "Column-first · top to bottom, left to right",
    optionRow: "Row-first · left to right, top to bottom",
    optionCustomPreset: "Custom preset",
    optionModeAsn: "ASN labels",
    optionModeSeparator: "Separator sheets",
    optionPaperA4: "A4",
    optionPaperLetter: "Letter",
    hintCount:
      "If an end number is set, it overrides the count and defines the exact range.",
    hintStartPosition:
      "Use a slot number like 1 to continue on a partly used sheet.",
    hintPrefix:
      "If this differs from ASN, update Paperless-ngx accordingly.",
    hintCalibration:
      "Use debug borders plus tiny offsets when your printer drifts off the sheet.",
    hintCalibrationQrScale:
      "Shrinks only the QR code; text stays unchanged. Smaller QR codes leave more edge tolerance, but can be harder to detect.",
    hintCustom:
      "These measurements drive preview, PDF, and print from the same geometry model.",
    hintSeparatorFreeText:
      "Optional text for humans only. The separator logic uses only the barcode value.",
    buttonGenerate: "Generate",
    buttonAutoGenerate: "Auto-generate",
    buttonPdf: "Download PDF",
    buttonPrint: "Print",
    buttonPreviousPage: "Previous page",
    buttonNextPage: "Next page",
    buttonReset: "Reset settings",
    buttonNewProfile: "New profile",
    optionNewProfile: "New profile…",
    buttonDeleteProfile: "Delete profile",
    buttonDuplicateProfile: "Duplicate",
    buttonExportProfiles: "Export profiles",
    buttonImportProfiles: "Import profiles",
    buttonProfileActions: "Profile actions",
    buttonOverlayPdf: "Overlay test sheet PDF",
    previewMeta:
      "Page {page} of {pages} · {count} labels · next start {nextStart}",
    previewMetaSeparator: "Page {page} of {pages} · separator sheet",
    outputMeta:
      "Resolved range: {start} to {end} ({count} labels) on {pages} page(s).",
    outputPresetStatusVerified: "Verified preset",
    outputPresetStatusProvisional: "Provisional preset",
    outputPrintScaleTitle: "Print scaling",
    outputPrintScaleBody:
      "Set the print dialog to 100% or Actual size and use the normal A4 print profile, not borderless A4. Do not use Fit to page or any automatic scaling.",
    paperlessSetupTitle: "Paperless-ngx setup for barcode and ASN detection",
    paperlessSetupBody:
      "Set these environment variables in your Docker or Compose setup so Paperless-ngx reads ASN labels correctly. The ASN prefix defaults to ASN and only needs to be set explicitly if you use a different prefix.",
    paperlessSetupRequiredTitle: "Required for ASN",
    paperlessSetupOptionalTitle:
      "Optional for a custom ASN prefix, general barcodes, and small codes",
    paperlessSetupBodySeparator:
      "Set these environment variables in your Docker or Compose setup so Paperless-ngx separates documents using this barcode value. PATCHT is the default separator string and only needs to be set explicitly if you use a different value.",
    paperlessSetupRequiredTitleSeparator: "Required for separator sheets",
    paperlessSetupOptionalTitleSeparator:
      "Optional for a custom separator string and improved barcode detection",
    paperlessSetupScannerNote:
      "Scanner selection is optional. Paperless-ngx supports PYZBAR by default and ZXING as an alternative if small or poor-quality barcodes are detected unreliably.",
    paperlessSetupDocsLabel: "Paperless-ngx barcode configuration",
    warningTitle: "Things to watch",
    calibrationTitle: "Printer fit",
    calibrationForPreset: "Active sheet: {preset}",
    calibrationHintScope:
      "Calibration profiles are stored per label preset. Switch the preset above to calibrate a different sheet.",
    calibrationStorageNote:
      "Profiles are stored only in this browser. Export them if you want to keep a backup.",
    calibrationInfoToggle: "Info",
    overlayHelp:
      "Print this overlay on plain paper, place it behind a real label sheet, and hold both against the light. If everything is shifted equally, adjust Offset. If the error grows across the sheet, adjust Pitch.",
    previewNoPages: "No labels to preview yet.",
    previewGenerating: "Generating image…",
    previewGenerateHint: "Press Generate to build the preview, PDF, and print layout.",
    borderLabel: "Debug borders",
    toggleEnabled: "on",
    toggleDisabled: "off",
    themeSystem: "Auto",
    themeLight: "Light",
    themeDark: "Dark",
    localeDe: "Deutsch",
    localeEn: "English",
    profileDefault: "Default",
    profileNew: "New profile",
    profileCopy: "Copy of {name}",
    profileTransferImportSuccess:
      "Imported {count} profile(s) for this sheet.",
    profileTransferInvalidFile:
      "The selected file does not contain valid calibration profiles.",
    profileTransferPresetMismatch:
      "This backup belongs to a different label preset.",
    sheetStatus: "{manufacturer} {name} · {status}",
    separatorStatus: "Code 128 separator · {paperSize}",
    warning_countRequired: "Enter an end number or a count greater than zero.",
    warning_invalidRange: "The end number must be greater than or equal to the start number.",
    warning_invalidStartPosition:
      "The start position must be a positive slot number.",
    warning_startPositionOutOfRange:
      "The selected start position is outside the preset sheet.",
    warning_presetOverflowX:
      "This preset overflows horizontally. Reduce width, columns, spacing, or left margin.",
    warning_presetOverflowY:
      "This preset overflows vertically. Reduce height, rows, spacing, or top margin.",
    warning_textTightFit:
      "Some labels are a tight text fit. Consider more digits space, a shorter prefix, or a larger label.",
    warning_separatorInvalidBarcodeValue:
      "The separator barcode supports printable ASCII only. Falling back to PATCHT.",
    printWindowTitle: "Plasn print layout",
  },
  de: {
    appTitle: "Plasn",
    appSubtitle:
      "Erzeugt druckbare ASN-Etiketten und Trennblätter für Paperless-ngx.",
    footerCredit:
      "Inspiriert vom ursprünglichen ASN QR Code Label Generator von Tobias L. Maier.",
    footerGitHub: "Quellcode auf GitHub ansehen",
    footerIssues: "Issue melden",
    appTagline: "Präzise ASN-QR-Etiketten für Paperless-ngx.",
    heroTitle: "ASN-Etiketten drucken, ohne auf Browser-Zufall zu vertrauen.",
    heroBody:
      "Erzeuge kalibrierte QR-Etikettenbögen, exportiere exakte PDFs und speichere wiederholbare Einstellungen für Paperless-ngx.",
    heroBadge: "Offline-first. A4-fokussiert. Zweisprachig.",
    sectionGenerator: "Konfiguration",
    sectionSeparator: "Trennblätter",
    generatorHelpOpen: "Hilfe zur Konfiguration öffnen",
    generatorHelpTitle: "Hilfe zur Konfiguration",
    generatorHelpIntro:
      "Diese Einstellungen legen fest, welche ASN-Etiketten auf dem aktuellen Bogen erzeugt werden.",
    generatorHelpStartPositionTitle: "Startposition",
    generatorHelpStartPositionBody:
      "Verwende eine Slot-Nummer wie 1, um auf einem angebrochenen Bogen fortzufahren.",
    generatorHelpRangeTitle: "Endnummer und Anzahl",
    generatorHelpRangeBody:
      "Wenn eine Endnummer gesetzt ist, hat sie Vorrang vor der Anzahl und bestimmt den exakten Bereich.",
    generatorHelpPrefixTitle: "Präfix",
    generatorHelpPrefixBody:
      "Falls dies nicht ASN ist, muss der Präfix in Paperless-ngx ebenfalls angepasst werden.",
    generatorHelpVisibleTextTitle: "Sichtbarer Etikettentext",
    generatorHelpVisibleTextBody:
      "Wenn Präfix oder führende Nullen ausgeschaltet werden, betrifft das nur den gedruckten Text. Der QR-Code bleibt immer vollständig mit Präfix und führenden Nullen erhalten.",
    sectionSheet: "Etikettenbogen",
    sectionCalibration: "Kalibrierung",
    calibrationHelpOpen: "Hilfe zur Kalibrierung öffnen",
    calibrationHelpTitle: "Hilfe zur Kalibrierung",
    overlayHelpOpen: "Hilfe zum Overlay-Testbogen öffnen",
    overlayHelpTitle: "Hilfe zum Overlay-Testbogen",
    buttonWorkflowHelp: "Ablaufhilfe",
    buttonPaperlessSetup: "Paperless-ngx Setup",
    workflowHelpTitle: "Ablaufplan",
    workflowHelpIntro:
      "Nutze diese Hilfe, wenn du schnell wissen willst, womit du beginnst, was du als Nächstes druckst und wie du einen schief sitzenden Druck korrigierst.",
    workflowHelpSheetTitle: "1. Etikettenbogen auswählen",
    workflowHelpSheetBody:
      "Starte möglichst immer mit einem passenden Preset. Das eigene Format brauchst du nur, wenn dein exakter Bogen noch nicht vorhanden ist.",
    workflowHelpSheetNote:
      "Tipp: Das gewählte Preset steuert Vorschau, PDF und Druckgeometrie gemeinsam.",
    workflowHelpConfigTitle: "2. Etiketten konfigurieren",
    workflowHelpConfigBody:
      "Lege zuerst die Startnummer fest und dann entweder Endnummer oder Anzahl. Mit Präfix und Stellen definierst du das ASN-Format.",
    workflowHelpConfigNote:
      "Startposition und Nummerierungsrichtung brauchst du vor allem dann, wenn du auf einem angebrochenen Bogen weitermachen willst.",
    workflowHelpGenerateTitle: "3. Generieren und prüfen",
    workflowHelpGenerateBody:
      "Erzeuge den Bogen und prüfe zuerst die Vorschau.",
    workflowHelpGenerateNote:
      "Wenn der Text gequetscht wirkt, helfen meist weniger Stellen, ein kürzeres Präfix oder ein größeres Etikettenformat am schnellsten.",
    workflowHelpPrintTitle: "4. Ohne Skalierung drucken",
    workflowHelpPrintBody:
      "Drucke immer mit 100 % oder Tatsächliche Größe.",
    workflowHelpPrintNote:
      "Nutze das normale A4-Druckprofil, nicht Randlos A4. Sobald der Druckdialog Seitenanpassung, Skalierung oder automatische Ränder verwendet, sitzt der Ausdruck nicht mehr exakt auf dem Etikettenbogen.",
    workflowHelpFitTitle: "5. Ausrichtung auf Papier prüfen",
    workflowHelpFitBody:
      "Wenn du nicht sicher bist, woher der Fehler kommt, drucke den Overlay-Testbogen auf Normalpapier und halte ihn mit einem echten Etikettenbogen gegen das Licht.",
    workflowHelpFitNote:
      "So erkennst du schnell, ob alles gleich verschoben ist oder ob die Abstände über die Seite driften.",
    workflowHelpCalibrationTitle: "6. Abweichungen über Kalibrierung korrigieren",
    workflowHelpCalibrationBody:
      "Ändere Offset X oder Y, wenn alle Etiketten ungefähr gleich falsch sitzen. Ändere Pitch X oder Y, wenn die ersten Etiketten passen, der Fehler über den Bogen aber größer wird.",
    workflowHelpCalibrationNote:
      "Faustregel: gleicher Versatz = Offset. Wachsender Fehler = Pitch. Arbeite in sehr kleinen Schritten.",
    workflowHelpProfilesTitle: "7. Funktionierende Einstellung sichern",
    workflowHelpProfilesBody:
      "Wenn ein Bogen sauber sitzt, behalte das Profil für später, damit du nicht erneut kalibrieren musst.",
    workflowHelpProfilesNote:
      "Profile werden pro Preset gespeichert und lassen sich als Backup oder für einen anderen Browser exportieren.",
    calibrationHelpIntro:
      "Nutze die Kalibrierung nur dann, wenn der Druck nicht exakt auf dem Bogen landet.",
    calibrationHelpProfilesTitle: "Profile und Speicherung",
    calibrationHelpOffsetTitle: "Offset X/Y",
    calibrationHelpOffsetBody:
      "Verschiebt das komplette Druckbild nach links, rechts, oben oder unten. Das nutzt du, wenn alle Etiketten ungefähr gleich falsch sitzen.",
    calibrationHelpPitchTitle: "Pitch-Korrektur X/Y",
    calibrationHelpPitchBody:
      "Ändert den Abstand zwischen den Etiketten. Das nutzt du, wenn das erste Etikett gut aussieht, der Fehler aber über Zeilen oder Spalten immer größer wird.",
    calibrationHelpQrScaleTitle: "QR-Code-Größe",
    calibrationHelpQrScaleBody:
      "Verkleinert nur den QR-Code innerhalb seines bisherigen Bereichs, damit der sichtbare Text exakt an derselben Stelle bleibt. Kleinere QR-Codes lassen mehr Abstand zur Etikettenkante, können je nach Drucker, Scanner und Paperless-ngx-Erkennung aber unzuverlässiger gelesen werden.",
    calibrationHelpExampleTitle: "Faustregel",
    calibrationHelpExampleBody:
      "Alles ist gleich verschoben: Offset. Der Fehler wird von Etikett zu Etikett größer: Pitch-Korrektur.",
    modalClose: "Schließen",
    sectionCustom: "Eigenes Format",
    sectionPreview: "Vorschau",
    sectionOutput: "Ausgabe",
    fieldLanguage: "Sprache",
    fieldTheme: "Farbschema",
    fieldMode: "Modus",
    fieldStartNumber: "Startnummer",
    fieldEndNumber: "Endnummer",
    fieldCount: "Anzahl",
    fieldPageCount: "Seiten",
    fieldPrefix: "Präfix",
    fieldDigits: "Stellen",
    fieldQrColor: "QR-Farbe",
    fieldTextColor: "Textfarbe",
    fieldTextFont: "Schriftart",
    fieldLabelColorPreset: "Vorgeschlagene Farben",
    fieldShowTextPrefix: "Präfix anzeigen",
    fieldShowLeadingZeros: "Führende Nullen anzeigen",
    fieldDirection: "Etikettenreihenfolge",
    fieldStartPosition: "Startposition",
    fieldPreset: "Etikettenformat",
    fieldCalibrationProfile: "Profil",
    fieldShowBorders: "Debug-Rahmen",
    fieldSeparatorPaperSize: "Papierformat",
    fieldSeparatorBarcodeValue: "Barcode-Inhalt",
    fieldSeparatorHeadline: "Überschrift",
    fieldSeparatorFreeText: "Freitext",
    fieldRows: "Zeilen",
    fieldColumns: "Spalten",
    fieldPageWidth: "Seitenbreite (mm)",
    fieldPageHeight: "Seitenhöhe (mm)",
    fieldLabelWidth: "Etikettenbreite (mm)",
    fieldLabelHeight: "Etikettenhöhe (mm)",
    fieldGutterX: "Horizontaler Abstand (mm)",
    fieldGutterY: "Vertikaler Abstand (mm)",
    fieldMarginLeft: "Linker Rand (mm)",
    fieldMarginTop: "Oberer Rand (mm)",
    fieldInnerPadding: "Innenabstand (mm)",
    fieldQrScale: "QR-Skalierung",
    fieldTextGap: "Textabstand (mm)",
    fieldOffsetX: "Offset X (mm)",
    fieldOffsetY: "Offset Y (mm)",
    fieldPitchX: "Pitch X (mm)",
    fieldPitchY: "Pitch Y (mm)",
    fieldCalibrationQrScale: "QR-Code-Größe (85-100 %)",
    fieldProfileName: "Name",
    optionColumnShort: "Spalten zuerst",
    optionRowShort: "Zeilen zuerst",
    optionColumnDetail: "Oben nach unten, links nach rechts",
    optionRowDetail: "Links nach rechts, oben nach unten",
    optionColumn: "Spalten zuerst · oben nach unten, links nach rechts",
    optionRow: "Zeilen zuerst · links nach rechts, oben nach unten",
    optionCustomPreset: "Eigenes Format",
    optionModeAsn: "ASN-Etiketten",
    optionModeSeparator: "Trennblätter",
    optionPaperA4: "A4",
    optionPaperLetter: "Letter",
    hintCount:
      "Wenn eine Endnummer gesetzt ist, hat sie Vorrang vor der Anzahl und bestimmt den exakten Bereich.",
    hintStartPosition:
      "Verwende eine Slot-Nummer wie 1, um auf einem angebrochenen Bogen fortzufahren.",
    hintPrefix:
      "Falls dies nicht ASN ist, muss der Wert in Paperless-ngx ebenfalls angepasst werden.",
    hintCalibration:
      "Nutze Debug-Rahmen und kleine Offsets, wenn dein Drucker leicht vom Bogen abweicht.",
    hintCalibrationQrScale:
      "Verkleinert nur den QR-Code; der Text bleibt unverändert. Kleinere QR-Codes lassen mehr Rand, können aber unzuverlässiger erkannt werden.",
    hintCustom:
      "Diese Maße steuern Vorschau, PDF und Druck über dasselbe Geometriemodell.",
    hintSeparatorFreeText:
      "Optionaler Text nur für Menschen. Für die Trennung zählt ausschließlich der Barcode-Inhalt.",
    buttonGenerate: "Generieren",
    buttonAutoGenerate: "Auto-Generieren",
    buttonPdf: "PDF herunterladen",
    buttonPrint: "Drucken",
    buttonPreviousPage: "Vorherige Seite",
    buttonNextPage: "Nächste Seite",
    buttonReset: "Einstellungen zurücksetzen",
    buttonNewProfile: "Neues Profil",
    optionNewProfile: "Neues Profil…",
    buttonDeleteProfile: "Profil löschen",
    buttonDuplicateProfile: "Duplizieren",
    buttonExportProfiles: "Profile exportieren",
    buttonImportProfiles: "Profile importieren",
    buttonProfileActions: "Profilaktionen",
    buttonOverlayPdf: "Overlay-Testbogen PDF",
    previewMeta:
      "Seite {page} von {pages} · {count} Etiketten · nächster Start {nextStart}",
    previewMetaSeparator: "Seite {page} von {pages} · Trennblatt",
    outputMeta:
      "Aufgelöster Bereich: {start} bis {end} ({count} Etiketten) auf {pages} Seite(n).",
    outputPresetStatusVerified: "Verifiziertes Preset",
    outputPresetStatusProvisional: "Vorläufiges Preset",
    outputPrintScaleTitle: "Druckskalierung",
    outputPrintScaleBody:
      "Stelle im Druckdialog unbedingt 100 % oder Tatsächliche Größe ein und nutze das normale A4-Druckprofil, nicht Randlos A4. Keine Seitenanpassung und keine automatische Skalierung verwenden.",
    paperlessSetupTitle: "Paperless-ngx Setup für Barcode- und ASN-Erkennung",
    paperlessSetupBody:
      "Setze diese Umgebungsvariablen in deinem Docker- oder Compose-Setup, damit Paperless-ngx ASN-Etiketten korrekt erkennt. Das ASN-Präfix ist standardmäßig ASN und muss nur gesetzt werden, wenn du ein anderes Präfix verwendest.",
    paperlessSetupRequiredTitle: "Erforderlich für ASN",
    paperlessSetupOptionalTitle:
      "Optional für ein eigenes ASN-Präfix, allgemeine Barcodes und kleine Codes",
    paperlessSetupBodySeparator:
      "Setze diese Umgebungsvariablen in deinem Docker- oder Compose-Setup, damit Paperless-ngx Dokumente mit diesem Barcode-Inhalt trennt. PATCHT ist der Standardwert für Trennblätter und muss nur gesetzt werden, wenn du einen anderen Wert verwendest.",
    paperlessSetupRequiredTitleSeparator: "Erforderlich für Trennblätter",
    paperlessSetupOptionalTitleSeparator:
      "Optional für einen eigenen Trennwert und für bessere Barcode-Erkennung",
    paperlessSetupScannerNote:
      "Die Scanner-Auswahl ist optional. Paperless-ngx unterstützt standardmäßig PYZBAR und alternativ ZXING, falls kleine oder schlechter gedruckte Barcodes unzuverlässig erkannt werden.",
    paperlessSetupDocsLabel: "Paperless-ngx Barcode-Konfiguration",
    warningTitle: "Zu beachten",
    calibrationTitle: "Druckanpassung",
    calibrationForPreset: "Aktiver Bogen: {preset}",
    calibrationHintScope:
      "Kalibrierprofile werden pro Etikettenformat gespeichert. Wenn du oben das Preset wechselst, kalibrierst du automatisch einen anderen Bogen.",
    calibrationStorageNote:
      "Profile werden nur in diesem Browser gespeichert. Exportiere sie, wenn du ein Backup behalten möchtest.",
    calibrationInfoToggle: "Infos",
    overlayHelp:
      "Drucke diesen Overlay-Testbogen auf Normalpapier, lege ihn hinter einen echten Etikettenbogen und halte beides gegen das Licht. Wenn alles gleich verschoben ist, passe den Offset an. Wenn der Fehler über den Bogen wächst, passe Pitch an.",
    previewNoPages: "Noch keine Etiketten zur Vorschau vorhanden.",
    previewGenerating: "Bild wird generiert…",
    previewGenerateHint:
      "Drücke auf Generieren, um Vorschau, PDF und Drucklayout zu erstellen.",
    borderLabel: "Debug-Rahmen",
    toggleEnabled: "an",
    toggleDisabled: "aus",
    themeSystem: "Auto",
    themeLight: "Hell",
    themeDark: "Dunkel",
    localeDe: "Deutsch",
    localeEn: "English",
    profileDefault: "Standard",
    profileNew: "Neues Profil",
    profileCopy: "Kopie von {name}",
    profileTransferImportSuccess:
      "{count} Profile für diesen Bogen importiert.",
    profileTransferInvalidFile:
      "Die ausgewählte Datei enthält keine gültigen Kalibrierprofile.",
    profileTransferPresetMismatch:
      "Dieses Backup gehört zu einem anderen Etikettenformat.",
    sheetStatus: "{manufacturer} {name} · {status}",
    separatorStatus: "Code-128-Trennblatt · {paperSize}",
    warning_countRequired:
      "Bitte eine Endnummer oder eine Anzahl größer als null angeben.",
    warning_invalidRange:
      "Die Endnummer muss größer oder gleich der Startnummer sein.",
    warning_invalidStartPosition:
      "Die Startposition muss eine positive Slot-Nummer sein.",
    warning_startPositionOutOfRange:
      "Die gewählte Startposition liegt außerhalb des Etikettenbogens.",
    warning_presetOverflowX:
      "Dieses Preset läuft horizontal über die Seite hinaus. Bitte Breite, Spalten, Abstände oder linken Rand reduzieren.",
    warning_presetOverflowY:
      "Dieses Preset läuft vertikal über die Seite hinaus. Bitte Höhe, Zeilen, Abstände oder oberen Rand reduzieren.",
    warning_textTightFit:
      "Einige Etiketten sind textlich sehr knapp. Eventuell weniger Stellen, ein kürzeres Präfix oder ein größeres Etikett verwenden.",
    warning_separatorInvalidBarcodeValue:
      "Der Trennblatt-Barcode unterstützt nur druckbare ASCII-Zeichen. Es wird auf PATCHT zurückgefallen.",
    printWindowTitle: "Plasn Drucklayout",
  },
};

export function detectInitialLocale(): Locale {
  if (typeof navigator === "undefined") {
    return "en";
  }

  const language = navigator.languages?.[0] ?? navigator.language ?? "en";
  return language.toLowerCase().startsWith("de") ? "de" : "en";
}

export function t(
  locale: Locale,
  key: string,
  replacements?: Record<string, string | number>,
): string {
  const template =
    dictionaries[locale][key] ?? dictionaries.en[key] ?? key;

  return template.replaceAll(/\{(\w+)\}/g, (_, token) =>
    String(replacements?.[token] ?? `{${token}}`),
  );
}

export function warningMessage(
  locale: Locale,
  warning: LayoutWarning,
): string {
  return t(locale, `warning_${warning.code}`, warning.meta);
}
