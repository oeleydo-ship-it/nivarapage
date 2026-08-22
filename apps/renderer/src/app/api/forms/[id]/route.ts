import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  const apiUrl = (process.env.API_URL || "http://laravel-api:8000").replace(/\/$/, "");
  const response = await fetch(`${apiUrl}/api/v1/public/forms/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}
