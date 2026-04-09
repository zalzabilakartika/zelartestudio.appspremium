import { type NextRequest } from "next/server";

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

  const upstream = await fetch(`https://api.sayabayar.com/v1/invoices/${id}`, {
    method: "GET",
    headers: {
      "X-API-Key": apiKey,
    },
  });

  if (!upstream.ok) {
    const errorBody = await upstream.text();
    return Response.json(
      { error: "Upstream payment error.", detail: errorBody },
      { status: upstream.status }
    );
  }

  const data = await upstream.json();

  return Response.json({ status: data.status });
}
