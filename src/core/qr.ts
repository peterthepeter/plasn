import QRCode from "qrcode";
import { normalizeHexColor } from "./color";

const QR_IMAGE_WIDTH_PX = 384;
const cache = new Map<string, Promise<string>>();

export function getQrDataUrl(text: string, color = "#000000"): Promise<string> {
  const normalizedColor = normalizeHexColor(color);
  const cacheKey = `${text}::${normalizedColor}::${QR_IMAGE_WIDTH_PX}`;
  const existing = cache.get(cacheKey);
  if (existing) {
    return existing;
  }

  // 384 px remains comfortably above the effective print resolution of these
  // tiny labels while avoiding the heavy 1024 px export cost.
  const promise = QRCode.toDataURL(text, {
    width: QR_IMAGE_WIDTH_PX,
    margin: 1,
    errorCorrectionLevel: "H",
    color: {
      dark: normalizedColor,
      light: "#ffffff",
    },
  });
  cache.set(cacheKey, promise);
  return promise;
}

export async function getQrDataUrlMap(
  texts: Iterable<string>,
  color = "#000000",
): Promise<Record<string, string>> {
  const uniqueTexts = Array.from(new Set(texts));
  const entries = await Promise.all(
    uniqueTexts.map(async (text) => [text, await getQrDataUrl(text, color)] as const),
  );

  return Object.fromEntries(entries);
}
