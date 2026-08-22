import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function secretsMatch(provided: string, expected: string): boolean {
  if (expected.length !== provided.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) {
    mismatch |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(request: NextRequest) {
  const expected = process.env.INTERNAL_RENDERER_SECRET || "";
  const provided = request.headers.get("x-internal-secret") || "";
  if (expected && !secretsMatch(provided, expected)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  let body: { site_id?: number | string; hosts?: string[] } = {};
  try {
    body = (await request.json()) as { site_id?: number | string; hosts?: string[] };
  } catch {
    body = {};
  }

  const siteId = body.site_id;
  const hosts = Array.isArray(body.hosts) ? body.hosts.filter((host) => typeof host === "string") : [];

  if (siteId !== undefined && siteId !== null && String(siteId) !== "") {
    revalidateTag(`site:${siteId}`, "max");
  }
  for (const host of hosts) {
    revalidateTag(`host:${host}`, "max");
  }
  revalidatePath("/", "layout");

  return NextResponse.json({ ok: true, site_id: siteId ?? null, hosts });
}
