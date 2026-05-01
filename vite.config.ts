import { defineConfig, loadEnv, type Plugin } from "vite";
import preact from "@preact/preset-vite";

const GOOGLE_SITE_VERIFICATION_FILE = "googleb55a2c9f70d84e9f.html";

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function normalizeSiteUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

function createSeoSchemaJson(siteUrl: string | null): string {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Plasn",
    description:
      "Paperless-ngx ASN label generator for printable ASN QR label sheets, barcode separator pages, and calibration PDFs.",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    inLanguage: ["en", "de"],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "ASN QR label sheet generator for Paperless-ngx",
      "Barcode separator page generator",
      "Print calibration and overlay test sheets",
      "Browser-based workflow with local settings",
    ],
  };

  if (siteUrl) {
    schema.url = `${siteUrl}/`;
  }

  return JSON.stringify(schema, null, 8);
}

function createSiteAssetsPlugin(env: Record<string, string>): Plugin {
  const siteUrl = normalizeSiteUrl(env.PLASN_SITE_URL);
  const siteRootUrl = siteUrl ? `${siteUrl}/` : null;
  const ogImageUrl = siteRootUrl ? `${siteRootUrl}plasn-mark-256.png` : null;
  const schemaJson = createSeoSchemaJson(siteUrl);

  return {
    name: "plasn-site-assets",
    transformIndexHtml(html) {
      const canonicalTag = siteRootUrl
        ? `    <link rel="canonical" href="${escapeHtmlAttribute(siteRootUrl)}" />`
        : "";
      const socialUrlTags = siteRootUrl
        ? [
            `    <meta property="og:url" content="${escapeHtmlAttribute(siteRootUrl)}" />`,
            `    <meta property="og:image" content="${escapeHtmlAttribute(ogImageUrl!)}" />`,
          ].join("\n")
        : "";
      const twitterImageTag = ogImageUrl
        ? `    <meta name="twitter:image" content="${escapeHtmlAttribute(ogImageUrl)}" />`
        : "";

      return html
        .replace("    <!-- PLASN_CANONICAL -->", canonicalTag)
        .replace("    <!-- PLASN_SOCIAL_URLS -->", socialUrlTags)
        .replace("    <!-- PLASN_TWITTER_IMAGE -->", twitterImageTag)
        .replace("__PLASN_SCHEMA_JSON__", schemaJson);
    },
    generateBundle() {
      const robotsTxt = siteRootUrl
        ? `User-agent: *\nAllow: /\n\nSitemap: ${siteRootUrl}sitemap.xml\n`
        : "User-agent: *\nAllow: /\n";

      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: robotsTxt,
      });

      if (siteRootUrl) {
        this.emitFile({
          type: "asset",
          fileName: "sitemap.xml",
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${siteRootUrl}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>\n`,
        });
      }

      if (siteRootUrl) {
        this.emitFile({
          type: "asset",
          fileName: GOOGLE_SITE_VERIFICATION_FILE,
          source: `google-site-verification: ${GOOGLE_SITE_VERIFICATION_FILE}\n`,
        });
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [preact(), createSiteAssetsPlugin(env)],
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
    },
  };
});
