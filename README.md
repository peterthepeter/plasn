# Plasn

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

## Release model

The GitHub Actions workflow publishes:

- `latest` for the current main branch
- immutable `sha-<commit>` image tags for reproducible deployments

If you want safer long-running deployments, prefer the `sha-...` tags over `latest`.

## GitHub Container Registry (GHCR)

The repository includes a GitHub Actions workflow that:

- runs tests
- builds the app
- builds a Docker image
- publishes it to GitHub Container Registry on every push to `main`

Image name:

```text
ghcr.io/peterthepeter/plasn:latest
```

Additional immutable image tag:

```text
ghcr.io/peterthepeter/plasn:sha-<commit>
```

If the repository or package stays private, Unraid needs a GitHub token with permission to read packages.

## Unraid deployment

Recommended approach:

1. Use the GHCR image as your container source.
2. Expose the container only internally on your server or Docker network.
3. Let Caddy handle the public HTTPS entrypoint.

Example container mapping:

```text
Container port: 80
Host port: 8088
```

Do not forward that host port in your router. Only Caddy should be public.

## Caddy recommendation for Plasn

For Plasn, use a more restrictive public snippet than your generic reverse proxy, because the app only needs static delivery.

Example:

```caddy
(public_static) {
	import security_headers_public
	import tls_desec
	encode gzip zstd

	route {
		crowdsec

		@badMethods not method GET HEAD OPTIONS
		respond @badMethods "Method Not Allowed" 405

		@blockShellInjection path_regexp shellinjection /.*(;|\|).*/
		respond @blockShellInjection "Forbidden" 403

		@blockScannerPaths path /.env /wp-admin /wp-login.php /phpmyadmin /etc/passwd /proc/self/environ
		respond @blockScannerPaths "Not Found" 404

		@blockScannerExt path_regexp \.git|\.sql|\.bak|\.backup|\.htaccess|\.htpasswd
		respond @blockScannerExt "Not Found" 404

		request_body {
			max_size 32KB
		}

		reverse_proxy 192.168.1.3:8088 {
			header_up Host {host}
			header_up X-Real-IP {remote_host}
			transport http {
				dial_timeout 5s
				response_header_timeout 15s
			}
		}
	}
}

plasn.getathome.dedyn.io {
	import public_static
	log {
		output file /var/log/caddy/access.log {
			roll_size 10mb
			roll_keep 2
		}
		format json
	}
}
```

This keeps Plasn separated from more complex public services such as media apps or personal dashboards.

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

## Feedback

If you run into a bug or have an idea for an improvement, the easiest long-term path is a GitHub issue once the repository is opened more broadly. Until then, direct feedback on the hosted app and deployment setup is still useful for improving the tool.

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
