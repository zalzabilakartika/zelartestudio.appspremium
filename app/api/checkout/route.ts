import { type NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  const apiKey = process.env.SAYABAYAR_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "Payment service is not configured." },
      { status: 500 }
    );
  }

  const { name, email, whatsapp, product_name, amount } = await request.json();

  const upstream = await fetch("https://api.sayabayar.com/v1/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      customer_name: name,
      customer_email: email,
      amount,
      description: `Order: ${product_name} | WA: ${whatsapp}`,
    }),
  });

  if (!upstream.ok) {
    const errorBody = await upstream.text();
    let parsedDetail: string = errorBody;

    try {
      const json = JSON.parse(errorBody);
      parsedDetail =
        json.message ?? json.error ?? JSON.stringify(json) ?? errorBody;
    } catch {
      // keep raw text when response is not JSON
    }

    return Response.json(
      { error: "Upstream payment error.", detail: parsedDetail },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();

  return Response.json({
    id: data.data?.id,
    payment_url: data.data?.payment_url,
  });
}
