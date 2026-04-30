# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- Provisional `Avery Zweckform L4730` support for `17,8 x 10 mm` ASN labels with `270` labels per A4 sheet

### Changed
- Narrow label layouts can now use a smaller text floor and a `90°` rotated text block so compact ASN labels stay readable in preview and PDF export

## [0.3.0] - 2026-04-09

### Added
- Multi-page ASN generation with an explicit `Pages` control for up to 10 pages
- Inline page navigation next to the print action for generated multi-page previews
- Reusable PDF warmup and caching so repeated PDF downloads feel much more immediate

### Changed
- Refined the preview action area, loading states, and left-hand setup/calibration panels for a cleaner workflow
- Simplified calibration profile handling by moving new-profile creation into the profile selector and only showing the name field for custom profiles
- PDF downloads now produce a single multi-page file again, while print continues to target the currently visible page
- Numeric setup inputs now use stricter limits and clearer stepper-based controls, including the new pages field

### Fixed
- Start position now behaves consistently with multi-page generation and no longer causes accidental page-count jumps while typing
- QR, print, and PDF generation paths now avoid unnecessary duplicate work and export much faster on large sheets
- Preview loading now shows a clean transient state instead of exposing partially rendered content
- Color menus, preview action alignment, and active button treatments now stay visually consistent across the interface

## [0.2.0] - 2026-04-07

### Added
- ASN label generation with local QR rendering, preview, PDF export, and browser print flow
- Separator sheet mode with Code 128 barcode generation for Paperless-ngx document splitting
- Overlay test sheet PDF for label alignment on plain paper
- Calibration profiles with local persistence plus JSON import/export
- Separate QR/text color controls and optional auto-generate behavior

### Changed
- Preview/PDF generation now uses an explicit generate step instead of constantly rebuilding output
- ASN settings now limit prefix length to 5 characters and digit count to 6
- The app no longer writes configuration state into the browser URL

### Fixed
- Default calibration profile handling so it cannot silently disappear or be renamed away
- Separator barcode fallback behavior so printed output and Paperless setup stay consistent
- Toggle changes now correctly invalidate stale generated output
