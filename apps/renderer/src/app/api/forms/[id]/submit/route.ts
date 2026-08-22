import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  const { id } = await context.params;
  const apiUrl = (process.env.API_URL || "http://laravel-api:8000").replace(/\/$/, "");
  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }
  if (!("website" in payload)) {
    payload.website = "";
  }

  const response = await fetch(`${apiUrl}/api/v1/public/forms/${encodeURIComponent(id)}/submit`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}
