import { type NextRequest } from "next/server";
import {
  extractPaymentPresentation,
  parseSayabayarErrorMessage,
} from "@/lib/payment-extract";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
  const apiKey = process.env.SAYABAYAR_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Payment service is not configured." },
      { status: 500 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { name, email, whatsapp, product_name, amount } = body as {
    name?: string;
    email?: string;
    whatsapp?: string;
    product_name?: string;
    amount?: number;
  };

  if (!name?.trim() || !email?.trim() || !whatsapp?.trim()) {
    return Response.json(
      { error: "Missing required fields: name, email, whatsapp." },
      { status: 422 }
    );
  }

  if (typeof amount !== "number" || amount <= 0) {
    return Response.json(
      { error: "Invalid amount." },
      { status: 422 }
    );
  }

  const channelPreference =
    process.env.SAYABAYAR_CHANNEL_PREFERENCE?.trim() || "platform";

  let upstream: globalThis.Response;
  try {
    upstream = await fetch("https://api.sayabayar.com/v1/invoices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      cache: "no-store",
      body: JSON.stringify({
        customer_name: name.trim(),
        customer_email: email.trim(),
        amount,
        description: `Order: ${product_name ?? "Product"} | WA: ${whatsapp.trim()}`,
        channel_preference: channelPreference,
      }),
    });
  } catch (err) {
    return Response.json(
      { error: "Failed to connect to payment service.", detail: String(err) },
      { status: 502 }
    );
  }

  const errorBody = await upstream.text();

  if (!upstream.ok) {
    const parsedDetail = parseSayabayarErrorMessage(errorBody);
    return Response.json(
      { error: "Upstream payment error.", detail: parsedDetail },
      { status: upstream.status }
    );
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(errorBody) as Record<string, unknown>;
  } catch {
    return Response.json(
      { error: "Invalid JSON from payment service.", detail: errorBody },
      { status: 502 }
    );
  }

  const id =
    typeof data.data === "object" &&
    data.data !== null &&
    typeof (data.data as Record<string, unknown>).id === "string"
      ? (data.data as Record<string, unknown>).id
      : undefined;

  const paymentUrl =
    typeof data.data === "object" &&
    data.data !== null &&
    typeof (data.data as Record<string, unknown>).payment_url === "string"
      ? (data.data as Record<string, unknown>).payment_url
      : undefined;

  const invoiceNumber =
    typeof data.data === "object" &&
    data.data !== null &&
    typeof (data.data as Record<string, unknown>).invoice_number === "string"
      ? (data.data as Record<string, unknown>).invoice_number
      : undefined;

  const amountUnique =
    typeof data.data === "object" &&
    data.data !== null &&
    typeof (data.data as Record<string, unknown>).amount_unique === "number"
      ? (data.data as Record<string, unknown>).amount_unique
      : undefined;

  const { qrString, qrImageUrl } = extractPaymentPresentation(data);

  const hasPayPath =
    typeof paymentUrl === "string" ||
    typeof qrString === "string" ||
    typeof qrImageUrl === "string";

  if (typeof id !== "string" || !hasPayPath) {
    return Response.json(
      {
        error: "Unexpected response from payment service.",
        detail: JSON.stringify(data),
      },
      { status: 502 }
    );
  }

  return Response.json(
    {
      id,
      payment_url: paymentUrl ?? null,
      invoice_number: invoiceNumber ?? null,
      amount_unique: amountUnique ?? null,
      qr_string: qrString ?? null,
      qr_image_url: qrImageUrl ?? null,
    },
    { status: 201 }
  );
}
