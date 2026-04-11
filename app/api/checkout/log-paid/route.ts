import { type NextRequest } from "next/server";
import { parseSayabayarErrorMessage } from "@/lib/payment-extract";

export const dynamic = "force-dynamic";

/**
 * Verifies invoice is paid with Sayabayar, then POSTs one row payload to a Google Apps Script
 * Web App URL (GOOGLE_SHEETS_WEB_APP_URL). Set that URL in env; if unset, returns ok with skipped: true.
 *
 * Apps Script minimal example:
 *   function doPost(e) {
 *     const row = JSON.parse(e.postData.contents);
 *     const sh = SpreadsheetApp.openById('YOUR_SHEET_ID').getSheetByName('Orders');
 *     sh.appendRow([
 *       new Date(), row.invoice_id, row.invoice_number, row.customer_name,
 *       row.customer_email, row.amount_unique, row.product_name, row.paid_at
 *     ]);
 *     return ContentService.createTextOutput(JSON.stringify({ ok: true }));
 *   }
 */

export async function POST(request: NextRequest): Promise<Response> {
  const apiKey = process.env.SAYABAYAR_API_KEY;
  const webhookUrl = process.env.GOOGLE_SHEETS_WEB_APP_URL?.trim();

  if (!apiKey) {
    return Response.json(
      { error: "Payment service is not configured." },
      { status: 500 }
    );
  }

  let body: { invoice_id?: string; product_name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const invoiceId = typeof body.invoice_id === "string" ? body.invoice_id.trim() : "";
  if (!invoiceId) {
    return Response.json(
      { error: "Missing required field: invoice_id." },
      { status: 422 }
    );
  }

  const productName =
    typeof body.product_name === "string" ? body.product_name.trim() : "";

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(
      `https://api.sayabayar.com/v1/invoices/${encodeURIComponent(invoiceId)}`,
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

  if (!webhookUrl) {
    return Response.json({
      ok: true,
      skipped: true,
      reason: "GOOGLE_SHEETS_WEB_APP_URL is not configured.",
    });
  }

  const payload = {
    event: "invoice.paid",
    invoice_id: typeof d.id === "string" ? d.id : invoiceId,
    invoice_number: typeof d.invoice_number === "string" ? d.invoice_number : null,
    customer_name: typeof d.customer_name === "string" ? d.customer_name : null,
    customer_email: typeof d.customer_email === "string" ? d.customer_email : null,
    amount: typeof d.amount === "number" ? d.amount : null,
    amount_unique: typeof d.amount_unique === "number" ? d.amount_unique : null,
    unique_code: typeof d.unique_code === "number" ? d.unique_code : null,
    description: typeof d.description === "string" ? d.description : null,
    paid_at: typeof d.paid_at === "string" ? d.paid_at : null,
    product_name: productName || null,
  };

  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim();

  let wh: globalThis.Response;
  try {
    wh = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Webhook-Secret": secret } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return Response.json(
      { error: "Failed to reach Google Sheets webhook.", detail: String(err) },
      { status: 502 }
    );
  }

  if (!wh.ok) {
    const detail = await wh.text();
    return Response.json(
      { error: "Sheets webhook returned an error.", detail },
      { status: 502 }
    );
  }

  return Response.json({ ok: true });
}
