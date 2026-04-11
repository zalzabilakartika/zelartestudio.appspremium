/**
 * Sayabayar (and similar) invoice payloads may include QRIS / QR in various shapes.
 * We normalize what we can for inline display without depending on undocumented fields.
 */

export type ExtractedPaymentPresentation = {
  qrString?: string;
  qrImageUrl?: string;
};

const IMAGE_KEY_HINTS = /^(qr|qris).*(_url|url|image|png|svg)$/i;

function looksLikeEmvQrString(s: string): boolean {
  const t = s.trim();
  if (t.length < 40) return false;
  return /^0{4}20\d/.test(t) || /^0{4}01\d/.test(t);
}

function collectObjects(payload: unknown): Record<string, unknown>[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = root.data;
  const out: Record<string, unknown>[] = [];
  if (data && typeof data === "object" && !Array.isArray(data)) {
    out.push(data as Record<string, unknown>);
  }
  out.push(root);
  return out;
}

function walk(
  obj: Record<string, unknown>,
  depth: number,
  acc: { qrString?: string; qrImageUrl?: string }
): void {
  if (depth > 10) return;

  for (const [key, raw] of Object.entries(obj)) {
    if (typeof raw === "string") {
      const k = key.toLowerCase();
      if (
        IMAGE_KEY_HINTS.test(key) &&
        (raw.startsWith("http://") ||
          raw.startsWith("https://") ||
          raw.startsWith("data:image"))
      ) {
        acc.qrImageUrl = raw;
      }
      if (
        !acc.qrString &&
        raw.length >= 40 &&
        (k.includes("qr") || k.includes("qris") || k.includes("emv")) &&
        looksLikeEmvQrString(raw)
      ) {
        acc.qrString = raw.trim();
      }
      if (!acc.qrString && looksLikeEmvQrString(raw)) {
        acc.qrString = raw.trim();
      }
    } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      walk(raw as Record<string, unknown>, depth + 1, acc);
    }
  }
}

export function extractPaymentPresentation(
  payload: unknown
): ExtractedPaymentPresentation {
  const acc: { qrString?: string; qrImageUrl?: string } = {};
  for (const o of collectObjects(payload)) {
    walk(o, 0, acc);
  }
  return { qrString: acc.qrString, qrImageUrl: acc.qrImageUrl };
}

export function parseSayabayarErrorMessage(body: string): string {
  try {
    const json = JSON.parse(body) as Record<string, unknown>;
    if (json.success === false && json.error && typeof json.error === "object") {
      const err = json.error as Record<string, unknown>;
      const msg = err.message;
      if (typeof msg === "string") return msg;
    }
    if (typeof json.message === "string") return json.message;
    if (typeof json.error === "string") return json.error;
  } catch {
    /* ignore */
  }
  return body;
}
