import { type NextRequest } from "next/server";
import { getQrispyBaseUrl } from "@/lib/payment-config";
import {
  parseQrispyErrorMessage,
  parseSayabayarErrorMessage,
} from "@/lib/payment-errors";

export const dynamic = "force-dynamic";

function toNum(v: unknown): number | null {
  if (typeof v === "number") return isNaN(v) ? null : v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }
  return null;
}

type Provider = "sayabayar" | "qrispy";

function normalizeProvider(v: unknown): Provider {
  if (typeof v === "string" && v.toLowerCase() === "qrispy") return "qrispy";
  return "sayabayar";
}

export async function POST(request: NextRequest): Promise<Response> {
  const webhookUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL?.trim();

  if (!webhookUrl) {
    return Response.json(
      { error: "Google Sheets logging is not configured (GOOGLE_SHEETS_WEB_APP_URL)." },
      { status: 500 }
    );
  }

  let body: {
    provider?: string;
    invoice_id?: string;
    product_name?: string;
    customer_name?: string;
    customer_email?: string;
    customer_whatsapp?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const provider = normalizeProvider(body.provider);
  const invoiceId =
    typeof body.invoice_id === "string" ? body.invoice_id.trim() : "";
  if (!invoiceId) {
    return Response.json(
      { error: "Missing required field: invoice_id." },
      { status: 422 }
    );
  }

  const productName =
    typeof body.product_name === "string" ? body.product_name.trim() : "";
  const customerName =
    typeof body.customer_name === "string" ? body.customer_name.trim() : "";
  const customerEmail =
    typeof body.customer_email === "string" ? body.customer_email.trim() : "";
  const customerWhatsapp =
    typeof body.customer_whatsapp === "string"
      ? body.customer_whatsapp.trim()
      : "";

  if (provider === "qrispy") {
    return logQrispyPaid({
      qrisId: invoiceId,
      productName,
      customerName,
      customerEmail,
      customerWhatsapp,
      webhookUrl,
    });
  }

  return logSayabayarPaid({
    invoiceId,
    productName,
    webhookUrl,
  });
}

async function logSayabayarPaid(args: {
  invoiceId: string;
  productName: string;
  webhookUrl: string;
}): Promise<Response> {
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
      `https://api.sayabayar.com/v1/invoices/${encodeURIComponent(args.invoiceId)}`,
      {
        method: "GET",
        headers: {
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
      {
        error: "Could not load invoice.",
        detail: parseSayabayarErrorMessage(text),
      },
      { status: upstream.status }
    );
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return Response.json(
      { error: "Invalid JSON from payment service." },
      { status: 502 }
    );
  }

  const d =
    typeof parsed.data === "object" && parsed.data !== null
      ? (parsed.data as Record<string, unknown>)
      : {};

  const status = typeof d.status === "string" ? d.status : "";
  if (status !== "paid") {
    return Response.json(
      { error: "Invoice is not paid yet.", status },
      { status: 409 }
    );
  }

  const payload = {
    event: "invoice.paid",
    provider: "sayabayar" as const,
    invoice_id: typeof d.id === "string" ? d.id : args.invoiceId,
    invoice_number:
      typeof d.invoice_number === "string" ? d.invoice_number : null,
    customer_name: typeof d.customer_name === "string" ? d.customer_name : null,
    customer_email:
      typeof d.customer_email === "string" ? d.customer_email : null,
    amount: toNum(d.amount),
    amount_unique: toNum(d.amount_unique),
    unique_code: toNum(d.unique_code),
    description: typeof d.description === "string" ? d.description : null,
    paid_at: typeof d.paid_at === "string" ? d.paid_at : null,
    product_name: args.productName || null,
  };

  return postToSheets(payload, args.webhookUrl);
}

async function logQrispyPaid(args: {
  qrisId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  webhookUrl: string;
}): Promise<Response> {
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
      `${base}/api/payment/qris/${encodeURIComponent(args.qrisId)}/status`,
      {
        method: "GET",
        headers: {
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
      {
        error: "Could not load QRIS status.",
        detail: parseQrispyErrorMessage(text),
      },
      { status: upstream.status }
    );
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON from Qrispy." }, { status: 502 });
  }

  const d =
    typeof parsed.data === "object" && parsed.data !== null
      ? (parsed.data as Record<string, unknown>)
      : parsed;

  console.log("[log-paid][qrispy] status response data:", JSON.stringify(d));

  const qrisStatus =
    typeof d.status === "string" && d.status !== "success"
      ? d.status
      : typeof d.payment_status === "string"
        ? d.payment_status
        : "unknown";

  if (qrisStatus !== "paid") {
    return Response.json(
      { error: "QRIS is not paid yet.", status: qrisStatus },
      { status: 409 }
    );
  }

  // Get real amount from transactions endpoint (includes unique code/fee)
  let realAmount = toNum(d.amount);
  try {
    const txRes = await fetch(
      `${base}/api/payment/transactions?limit=50`,
      {
        method: "GET",
        headers: { "X-API-Token": token },
        cache: "no-store",
      }
    );
    if (txRes.ok) {
      const txParsed = (await txRes.json()) as Record<string, unknown>;
      const txList = Array.isArray(txParsed.data) ? txParsed.data : [];
      const match = (txList as Record<string, unknown>[]).find(
        (tx) => tx.qris_id === args.qrisId
      );
      const txAmount = match ? toNum(match.amount) : null;
      if (txAmount !== null) {
        realAmount = txAmount;
      }
    }
  } catch {
    // Non-critical
  }

  const payload = {
    event: "qris.paid",
    provider: "qrispy" as const,
    qris_id: args.qrisId,
    invoice_id: args.qrisId,
    invoice_number: null,
    customer_name: args.customerName || null,
    customer_email: args.customerEmail || null,
    customer_whatsapp: args.customerWhatsapp || null,
    amount: realAmount,
    amount_unique: realAmount,
    paid_at: typeof d.paid_at === "string" ? d.paid_at : null,
    expired_at: typeof d.expired_at === "string" ? d.expired_at : null,
    payment_reference:
      typeof d.payment_reference === "string" ? d.payment_reference : null,
    product_name: args.productName || null,
  };

  return postToSheets(payload, args.webhookUrl);
}

const SHEETS_MAX_RETRIES = 3;
const SHEETS_BASE_DELAY_MS = 800;

async function postToSheets(
  payload: Record<string, unknown>,
  webhookUrl: string
): Promise<Response> {
  const body = JSON.stringify(payload);
  let lastError = "";

  for (let attempt = 0; attempt <= SHEETS_MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = SHEETS_BASE_DELAY_MS * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }

    let wh: globalThis.Response;
    try {
      wh = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
    } catch (err) {
      lastError = String(err);
      console.warn(
        `[log-paid] Sheets attempt ${attempt + 1}/${SHEETS_MAX_RETRIES + 1} network error: ${lastError}`
      );
      continue;
    }

    if (wh.ok) {
      return Response.json({ ok: true });
    }

    lastError = await wh.text();
    console.warn(
      `[log-paid] Sheets attempt ${attempt + 1}/${SHEETS_MAX_RETRIES + 1} HTTP ${wh.status}: ${lastError}`
    );

    if (wh.status >= 400 && wh.status < 500) {
      return Response.json(
        { error: "Sheets webhook rejected the request.", detail: lastError },
        { status: 502 }
      );
    }
  }

  return Response.json(
    {
      error: "Failed to reach Google Sheets webhook after retries.",
      detail: lastError,
    },
    { status: 502 }
  );
}
