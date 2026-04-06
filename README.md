# Plasn

Plasn is a lightweight web app for generating:

- ASN label sheets for Paperless-ngx
- separator sheets for barcode-based document splitting
- overlay test sheets for label alignment on plain paper

The app runs fully client-side in the browser. No backend is required.

## Features

- ASN QR label generator with multiple A4 presets and custom label geometry
- Separate calibration profiles per label preset
- PDF download and direct printing
- Separator sheet mode using Code 128 barcodes
- Overlay test sheet PDF for alignment on plain paper
- German and English UI

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

## Docker

This project can be self-hosted easily as a static site.

Build the image:

```bash
docker build -t plasn .
```

Run the container:

```bash
docker run --rm -p 8080:80 plasn
```

Then open:

```text
http://localhost:8080
```

For Unraid, a simple custom container using the provided `Dockerfile` is enough. If you already use Caddy as reverse proxy, you can publish the container internally and proxy it through your existing setup.

## Paperless-ngx configuration

### ASN labels

```env
PAPERLESS_CONSUMER_ENABLE_ASN_BARCODE=true
PAPERLESS_CONSUMER_ASN_BARCODE_PREFIX=ASN
```

Optional for broader barcode handling and more robust detection:

```env
PAPERLESS_CONSUMER_ENABLE_BARCODES=true
PAPERLESS_CONSUMER_BARCODE_SCANNER=ZXING
PAPERLESS_CONSUMER_BARCODE_DPI=600
PAPERLESS_CONSUMER_BARCODE_UPSCALE=1.5
```

### Separator sheets

```env
PAPERLESS_CONSUMER_ENABLE_BARCODES=true
PAPERLESS_CONSUMER_BARCODE_STRING=PATCHT
```

Optional:

```env
PAPERLESS_CONSUMER_BARCODE_RETAIN_SPLIT_PAGES=true
PAPERLESS_CONSUMER_BARCODE_SCANNER=ZXING
PAPERLESS_CONSUMER_BARCODE_DPI=600
PAPERLESS_CONSUMER_BARCODE_UPSCALE=1.5
```

## Deployment recommendation

For your setup, self-hosting in Docker on Unraid is the most sensible default:

- keeps everything under your control
- fits naturally behind Caddy and CrowdSec
- no dependence on a third-party frontend host

Netlify or Cloudflare Pages are still good options if you want a public demo or very simple external sharing.

## Optional analytics

The app can be prepared for Cloudflare Web Analytics without enabling tracking immediately.

1. Create a Cloudflare Web Analytics property later.
2. Add the token to your environment:

```env
VITE_CLOUDFLARE_ANALYTICS_TOKEN=your-token-here
```

3. Rebuild the app or Docker image.

If the variable is empty, no analytics script is loaded.

For local setup, copy `.env.example` to `.env` and fill in the token when you are ready.
