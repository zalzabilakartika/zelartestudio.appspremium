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

export function parseQrispyErrorMessage(body: string): string {
  try {
    const json = JSON.parse(body) as Record<string, unknown>;
    if (typeof json.message === "string") return json.message;
    if (typeof json.error === "string") return json.error;
    if (json.data && typeof json.data === "object") {
      const d = json.data as Record<string, unknown>;
      if (typeof d.message === "string") return d.message;
    }
  } catch {
    /* ignore */
  }
  return body;
}
