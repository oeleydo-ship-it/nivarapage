import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path?: string[] }> };

async function proxy(request: Request, context: Context) {
  const { path } = await context.params;
  const apiUrl = (process.env.API_URL || "http://laravel-api:8000").replace(/\/$/, "");
  const suffix = (path || []).map(encodeURIComponent).join("/");
  const target = `${apiUrl}/api/v1/public/funnels/${suffix}`;
  const response = await fetch(target, {
    method: request.method,
    headers: { Accept: "application/json", "Content-Type": request.headers.get("Content-Type") || "application/json", "User-Agent": request.headers.get("User-Agent") || "" },
    body: request.method === "POST" ? await request.text() : undefined,
    cache: "no-store",
  });
  return new NextResponse(await response.text(), { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" } });
}

export const POST = proxy;
