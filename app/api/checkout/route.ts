import { type NextRequest } from "next/server";
import { getPaymentProvider, getQrispyBaseUrl } from "@/lib/payment-config";
import {
  parseQrispyErrorMessage,
  parseSayabayarErrorMessage,
} from "@/lib/payment-errors";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<Response> {
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
    return Response.json({ error: "Invalid amount." }, { status: 422 });
  }

  const provider = getPaymentProvider();

  if (provider === "qrispy") {
    return createQrispyCheckout({
      name: name.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      product_name: product_name ?? "Product",
      amount,
    });
  }

  return createSayabayarCheckout({
    name: name.trim(),
    email: email.trim(),
    whatsapp: whatsapp.trim(),
    product_name: product_name ?? "Product",
    amount,
  });
}

async function createSayabayarCheckout(args: {
  name: string;
  email: string;
  whatsapp: string;
  product_name: string;
  amount: number;
}): Promise<Response> {
  const apiKey = process.env.SAYABAYAR_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Payment service is not configured (SAYABAYAR_API_KEY)." },
      { status: 500 }
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
        customer_name: args.name,
        customer_email: args.email,
        amount: args.amount,
        description: `Order: ${args.product_name} | WA: ${args.whatsapp}`,
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
    return Response.json(
      { error: "Upstream payment error.", detail: parseSayabayarErrorMessage(errorBody) },
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

  const d =
    typeof data.data === "object" && data.data !== null
      ? (data.data as Record<string, unknown>)
      : {};

  const id = typeof d.id === "string" ? d.id : undefined;
  const paymentUrl = typeof d.payment_url === "string" ? d.payment_url : undefined;
  const invoiceNumber =
    typeof d.invoice_number === "string" ? d.invoice_number : null;
  const amountUnique =
    typeof d.amount_unique === "number" ? d.amount_unique : null;

  if (typeof id !== "string" || typeof paymentUrl !== "string") {
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
      provider: "sayabayar" as const,
      id,
      payment_url: paymentUrl,
      invoice_number: invoiceNumber,
      amount_unique: amountUnique,
    },
    { status: 201 }
  );
}

async function createQrispyCheckout(args: {
  name: string;
  email: string;
  whatsapp: string;
  product_name: string;
  amount: number;
}): Promise<Response> {
  const token = process.env.QRISPY_API_TOKEN?.trim();

  if (!token) {
    return Response.json(
      { error: "Payment service is not configured (QRISPY_API_TOKEN)." },
      { status: 500 }
    );
  }

  const base = getQrispyBaseUrl();
  const paymentRef = [
    args.product_name,
    args.name,
    args.whatsapp,
    args.email,
  ]
    .join(" | ")
    .slice(0, 240);

  const payload: Record<string, unknown> = {
    amount: Math.round(args.amount),
    payment_reference: paymentRef,
  };

  const returnUrl = process.env.QRISPY_RETURN_URL?.trim();
  if (returnUrl) {
    payload.return_url = returnUrl;
  }

  let upstream: globalThis.Response;
  try {
    upstream = await fetch(`${base}/api/payment/qris/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Token": token,
      },
      cache: "no-store",
      body: JSON.stringify(payload),
    });
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

  if (parsed.status !== "success") {
    return Response.json(
      {
        error: "Qrispy did not return success.",
        detail: parseQrispyErrorMessage(text),
      },
      { status: 502 }
    );
  }

  const d =
    typeof parsed.data === "object" && parsed.data !== null
      ? (parsed.data as Record<string, unknown>)
      : {};

  const qrisId = typeof d.qris_id === "string" ? d.qris_id : undefined;
  const qrisImageUrl =
    typeof d.qris_image_url === "string" ? d.qris_image_url : null;
  const qrisImageBase64 =
    typeof d.qris_image_base64 === "string" ? d.qris_image_base64 : null;
  const respAmount = typeof d.amount === "number" ? d.amount : args.amount;
  const expiredAt = typeof d.expired_at === "string" ? d.expired_at : null;

  if (!qrisId || (!qrisImageUrl && !qrisImageBase64)) {
    return Response.json(
      {
        error: "Unexpected response from Qrispy.",
        detail: JSON.stringify(parsed),
      },
      { status: 502 }
    );
  }

  return Response.json(
    {
      provider: "qrispy" as const,
      id: qrisId,
      qris_id: qrisId,
      qris_image_url: qrisImageUrl,
      qris_image_base64: qrisImageBase64,
      amount: respAmount,
      expired_at: expiredAt,
      payment_url: null,
      invoice_number: null,
      amount_unique: null,
    },
    { status: 201 }
  );
}
