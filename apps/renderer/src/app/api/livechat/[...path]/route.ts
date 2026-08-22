import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ path?: string[] }> };

async function proxy(request: Request, context: Context) {
  const { path } = await context.params;
  const apiUrl = (process.env.API_URL || "http://laravel-api:8000").replace(/\/$/, "");
  const suffix = (path || []).map(encodeURIComponent).join("/");
  const incoming = new URL(request.url);
  const target = `${apiUrl}/api/v1/public/livechat/${suffix}${incoming.search}`;
  const headers: Record<string, string> = {
    Accept: request.headers.get("Accept") || "application/json",
  };
  const token = request.headers.get("X-Livechat-Token");
  if (token) headers["X-Livechat-Token"] = token;
  const contentType = request.headers.get("Content-Type");
  if (contentType) headers["Content-Type"] = contentType;
  const ua = request.headers.get("User-Agent");
  if (ua) headers["User-Agent"] = ua;

  const init: RequestInit = {
    method: request.method,
    headers,
    cache: "no-store",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.text();
  }

  const response = await fetch(target, init);
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("Content-Type") || "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
export const OPTIONS = proxy;
