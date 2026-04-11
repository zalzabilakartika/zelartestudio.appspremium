import { type NextRequest } from "next/server";

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
        channel_preference: "platform",
      }),
    });
  } catch (err) {
    return Response.json(
      { error: "Failed to connect to payment service.", detail: String(err) },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const errorBody = await upstream.text();
    let parsedDetail: string = errorBody;

    try {
      const json = JSON.parse(errorBody);
      if (typeof json === "string") {
        parsedDetail = json;
      } else if (json?.message) {
        parsedDetail = String(json.message);
      } else if (json?.error) {
        parsedDetail =
          typeof json.error === "string"
            ? json.error
            : JSON.stringify(json.error);
      } else {
        parsedDetail = JSON.stringify(json);
      }
    } catch {
      // keep raw text when response is not JSON
    }

    return Response.json(
      { error: "Upstream payment error.", detail: parsedDetail },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();

  const id = data.data?.id;
  const paymentUrl = data.data?.payment_url;

  if (!id || !paymentUrl) {
    return Response.json(
      { error: "Unexpected response from payment service.", detail: JSON.stringify(data) },
      { status: 502 }
    );
  }

  return Response.json({ id, payment_url: paymentUrl }, { status: 201 });
}
