import QRCode from "qrcode";
import { normalizeHexColor } from "./color";

const cache = new Map<string, Promise<string>>();

export function getQrDataUrl(text: string, color = "#000000"): Promise<string> {
  const normalizedColor = normalizeHexColor(color);
  const cacheKey = `${text}::${normalizedColor}`;
  const existing = cache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const promise = QRCode.toDataURL(text, {
    width: 1024,
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
