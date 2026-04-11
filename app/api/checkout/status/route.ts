import { type NextRequest } from "next/server";
import { getQrispyBaseUrl } from "@/lib/payment-config";
import {
  parseQrispyErrorMessage,
  parseSayabayarErrorMessage,
} from "@/lib/payment-errors";

export const dynamic = "force-dynamic";

type Provider = "sayabayar" | "qrispy";

function normalizeProvider(v: string | null): Provider {
  if (v?.toLowerCase() === "qrispy") return "qrispy";
  return "sayabayar";
}

export async function GET(request: NextRequest): Promise<Response> {
  const id = request.nextUrl.searchParams.get("id");
  const provider = normalizeProvider(request.nextUrl.searchParams.get("provider"));

  if (!id) {
    return Response.json(
      { error: "Missing required query parameter: id." },
      { status: 400 }
    );
  }

  if (provider === "qrispy") {
    return getQrispyStatus(id);
  }

  return getSayabayarStatus(id);
}

async function getSayabayarStatus(id: string): Promise<Response> {
  const apiKey = process.env.SAYABAYAR_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Payment service is not configured." },
      { status: 500 }
    );
  }

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(
      `https://api.sayabayar.com/v1/invoices/${encodeURIComponent(id)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        cache: "no-store",
      }
    );
  } catch (err) {
    return Response.json(
      { error: "Failed to connect to payment service.", detail: String(err) },
      { status: 502 }
    );
  }

  const text = await upstream.text();

  if (!upstream.ok) {
    return Response.json(
      { error: "Upstream payment error.", detail: parseSayabayarErrorMessage(text) },
      { status: upstream.status }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return Response.json(
      { error: "Invalid JSON from payment service.", detail: text },
      { status: 502 }
    );
  }

  const d =
    typeof data.data === "object" && data.data !== null
      ? (data.data as Record<string, unknown>)
      : {};

  return Response.json({
    provider: "sayabayar" as const,
    status: typeof d.status === "string" ? d.status : "unknown",
    invoice_number: typeof d.invoice_number === "string" ? d.invoice_number : null,
    amount: typeof d.amount === "number" ? d.amount : null,
    amount_unique: typeof d.amount_unique === "number" ? d.amount_unique : null,
    expired_at: typeof d.expired_at === "string" ? d.expired_at : null,
    paid_at: typeof d.paid_at === "string" ? d.paid_at : null,
  });
}

async function getQrispyStatus(qrisId: string): Promise<Response> {
  const token = process.env.QRISPY_API_TOKEN?.trim();

  if (!token) {
    return Response.json(
      { error: "Payment service is not configured." },
      { status: 500 }
    );
  }

  const base = getQrispyBaseUrl();

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(
      `${base}/api/payment/qris/${encodeURIComponent(qrisId)}/status`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-Token": token,
        },
        cache: "no-store",
      }
    );
  } catch (err) {
    return Response.json(
      { error: "Failed to connect to Qrispy.", detail: String(err) },
      { status: 502 }
    );
  }

  const text = await upstream.text();

  if (!upstream.ok) {
    return Response.json(
      { error: "Qrispy error.", detail: parseQrispyErrorMessage(text) },
      { status: upstream.status >= 400 ? upstream.status : 502 }
    );
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return Response.json(
      { error: "Invalid JSON from Qrispy.", detail: text },
      { status: 502 }
    );
  }

  const d =
    typeof parsed.data === "object" && parsed.data !== null
      ? (parsed.data as Record<string, unknown>)
      : parsed;

  const rawStatus =
    typeof d.status === "string"
      ? d.status
      : typeof (parsed as { status?: string }).status === "string"
        ? (parsed as { status: string }).status
        : "unknown";

  return Response.json({
    provider: "qrispy" as const,
    status: rawStatus,
    invoice_number: null,
    amount: typeof d.amount === "number" ? d.amount : null,
    amount_unique: typeof d.amount === "number" ? d.amount : null,
    expired_at: typeof d.expired_at === "string" ? d.expired_at : null,
    paid_at: typeof d.paid_at === "string" ? d.paid_at : null,
  });
}
