<h1>
  <img src="public/plasn-mark-256.png" alt="Plasn logo" width="120" align="left" />
  <span>Plasn</span>
</h1>

<br clear="left" />

Plasn is a lightweight web app for generating:

- ASN label sheets for Paperless-ngx
- separator sheets for barcode-based document splitting
- overlay test sheets for label alignment on plain paper

The app runs fully client-side in the browser. No backend is required.

## Live app

- [https://plasn.getathome.dedyn.io](https://plasn.getathome.dedyn.io)

## What Plasn does

Plasn is built for Paperless-ngx users who want to:

- print ASN QR label sheets
- create barcode separator sheets for document splitting
- calibrate label output without wasting real label stock

Everything runs locally in the browser after the app has loaded. The server only delivers static files.

## Features

- ASN QR label generator with multiple A4 presets and custom label geometry
- Separate calibration profiles per label preset
- PDF download and direct printing
- Separator sheet mode using Code 128 barcodes
- Overlay test sheet PDF for alignment on plain paper
- German and English UI

## Quick start

1. Open the live app.
2. Choose your label preset or switch to separator sheets.
3. Configure the values you need.
4. Export a PDF or print directly.
5. For label sheets, use the overlay test sheet first if your printer needs calibration.

## Local development

Requirements:

- Node.js 20+
- npm

Install dependencies:

```bash
npm ci
```

Start development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Create production build:

```bash
npm run build
```

### Optional: Cloudflare Web Analytics

Cloudflare analytics is disabled by default for local builds, forks, and third-party deployments.

To enable it for your own deployment, set the environment variable below before building:

```env
VITE_CF_WEB_ANALYTICS_TOKEN=YOUR_CLOUDFLARE_SITE_TOKEN
```

For GitHub Actions based image builds, store the same value as the repository secret
`CLOUDFLARE_WEB_ANALYTICS_TOKEN`.

## Paperless-ngx configuration

### ASN labels

```env
PAPERLESS_CONSUMER_ENABLE_ASN_BARCODE=true
```

Optional if you use a different ASN prefix and for broader barcode handling or more robust detection:

```env
PAPERLESS_CONSUMER_ASN_BARCODE_PREFIX=YOUR_PREFIX
PAPERLESS_CONSUMER_ENABLE_BARCODES=true
PAPERLESS_CONSUMER_BARCODE_SCANNER=ZXING
PAPERLESS_CONSUMER_BARCODE_DPI=600
PAPERLESS_CONSUMER_BARCODE_UPSCALE=1.5
```

### Separator sheets

```env
PAPERLESS_CONSUMER_ENABLE_BARCODES=true
```

Optional if you use a different separator string or want more robust barcode detection:

```env
PAPERLESS_CONSUMER_BARCODE_STRING=YOUR_SEPARATOR
PAPERLESS_CONSUMER_BARCODE_SCANNER=ZXING
PAPERLESS_CONSUMER_BARCODE_DPI=600
PAPERLESS_CONSUMER_BARCODE_UPSCALE=1.5
```

## Feedback

If you run into a bug or have an idea for an improvement, please open a GitHub issue.

Useful bug reports usually include:

- what you wanted to generate
- which preset or mode you used
- what happened instead
- browser and device details
- screenshots or sample output if helpful
