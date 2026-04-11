import { type NextRequest } from "next/server";
import { extractPaymentPresentation, parseSayabayarErrorMessage } from "@/lib/payment-extract";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<Response> {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return Response.json(
      { error: "Missing required query parameter: id." },
      { status: 400 }
    );
  }

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
    const parsedDetail = parseSayabayarErrorMessage(text);
    return Response.json(
      { error: "Upstream payment error.", detail: parsedDetail },
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

  const { qrString, qrImageUrl } = extractPaymentPresentation(data);

  return Response.json({
    status: typeof d.status === "string" ? d.status : "unknown",
    invoice_number: typeof d.invoice_number === "string" ? d.invoice_number : null,
    amount: typeof d.amount === "number" ? d.amount : null,
    amount_unique: typeof d.amount_unique === "number" ? d.amount_unique : null,
    expired_at: typeof d.expired_at === "string" ? d.expired_at : null,
    paid_at: typeof d.paid_at === "string" ? d.paid_at : null,
    customer_name: typeof d.customer_name === "string" ? d.customer_name : null,
    customer_email: typeof d.customer_email === "string" ? d.customer_email : null,
    description: typeof d.description === "string" ? d.description : null,
    payment_url: typeof d.payment_url === "string" ? d.payment_url : null,
    qr_string: qrString ?? null,
    qr_image_url: qrImageUrl ?? null,
  });
}
