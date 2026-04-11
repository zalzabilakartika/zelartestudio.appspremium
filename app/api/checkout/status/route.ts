import { type NextRequest } from "next/server";

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

  if (!upstream.ok) {
    const errorBody = await upstream.text();
    let parsedDetail: string = errorBody;

    try {
      const json = JSON.parse(errorBody);
      parsedDetail = json?.message ?? json?.error ?? errorBody;
    } catch {
      // keep raw text
    }

    return Response.json(
      { error: "Upstream payment error.", detail: parsedDetail },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();

  return Response.json({
    status: data.data?.status ?? "unknown",
    invoice_number: data.data?.invoice_number,
    amount: data.data?.amount,
    expired_at: data.data?.expired_at,
  });
}
