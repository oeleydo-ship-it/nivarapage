import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { googleFontHref, themeTokensToStyle } from "@uidesired/blocks/theme";
import { resolveSite } from "@/lib/api";
import { requestHost } from "@/lib/host";
import "./globals.css";

export const revalidate = 60;

function isPreviewRequest(headersList: Headers): boolean {
  return headersList.get("x-uidesired-pathname") === "/preview";
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  if (isPreviewRequest(headersList)) {
    return { title: "Preview", robots: { index: false, follow: false } };
  }

  const host = requestHost(headersList);
  const resolved = await resolveSite(host);
  if (!resolved.ok || !resolved.data) {
    return { title: "Website Not Found", robots: { index: false, follow: false } };
  }

  const site = resolved.data;
  if (site.status === "disabled") {
    return { title: site.business_name || site.name, robots: { index: false, follow: false } };
  }

  return {
    title: site.business_name || site.name,
    description: site.settings?.default_description || undefined,
    icons: site.settings?.favicon ? [{ url: site.settings.favicon }] : undefined,
    robots:
      site.settings?.robots === "none"
        ? { index: false, follow: false }
        : site.settings?.robots === "noindex"
          ? { index: false, follow: true }
          : { index: true, follow: true },
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const headersList = await headers();
  const resolved = isPreviewRequest(headersList)
    ? { ok: false as const, data: null }
    : await resolveSite(requestHost(headersList));
  const site = resolved.ok ? resolved.data : null;
  const tokens = site?.theme ?? {};
  const href = googleFontHref(
    typeof tokens.headingFont === "string" ? tokens.headingFont : "Inter",
    typeof tokens.bodyFont === "string" ? tokens.bodyFont : "Inter",
    typeof tokens.monoFont === "string" ? tokens.monoFont : null,
    typeof tokens.serifFont === "string" ? tokens.serifFont : null,
  );

  return (
    <html lang={site?.settings?.locale || "en"} style={themeTokensToStyle(tokens)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {href ? <link rel="stylesheet" href={href} /> : null}
      </head>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
