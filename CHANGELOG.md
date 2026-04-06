# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-04-07

### Added
- ASN label generation with local QR rendering, preview, PDF export, and browser print flow
- Separator sheet mode with Code 128 barcode generation for Paperless-ngx document splitting
- Overlay test sheet PDF for label alignment on plain paper
- Calibration profiles with local persistence plus JSON import/export
- Separate QR/text color controls and optional auto-generate behavior
- GHCR Docker publishing workflow and self-hosting documentation for Unraid/Caddy

### Changed
- Preview/PDF generation now uses an explicit generate step instead of constantly rebuilding output
- ASN settings now limit prefix length to 5 characters and digit count to 6
- The app no longer writes configuration state into the browser URL
- The Unraid icon asset now ships as a dedicated PNG for container use

### Fixed
- Default calibration profile handling so it cannot silently disappear or be renamed away
- Separator barcode fallback behavior so printed output and Paperless setup stay consistent
- Toggle changes now correctly invalidate stale generated output
