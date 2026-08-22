import { googleFontHref, fontStacksFromContent } from "@uidesired/blocks/theme";
import { themeTokensToStyle } from "@uidesired/blocks/theme";
import { fetchPreview } from "@/lib/api";
import { PageRenderer } from "@/lib/page-renderer";
import { PreviewUnavailable } from "@/lib/status-pages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PreviewPage = {
  id?: number;
  name?: string;
  slug?: string;
  is_homepage?: boolean;
  draft_revision?: { content_json?: { schemaVersion?: number; sections?: Array<{ type: string; props?: Record<string, unknown> }> } };
  draftRevision?: { content_json?: { schemaVersion?: number; sections?: Array<{ type: string; props?: Record<string, unknown> }> } };
};

function signedPreviewQuery(params: Record<string, string | string[] | undefined>): string {
  const query = new URLSearchParams();
  // Laravel signs with ksort(expires, site). Keep that order and drop `path`.
  for (const key of ["expires", "site", "signature"] as const) {
    const value = params[key];
    const str = Array.isArray(value) ? value[0] : value;
    if (typeof str === "string" && str !== "") {
      query.set(key, str);
    }
  }
  const result = query.toString();
  return result ? `?${result}` : "";
}

type RendererTheme = NonNullable<Parameters<typeof PageRenderer>[0]["theme"]>;

function themeTokens(raw: unknown): RendererTheme {
  if (!raw || typeof raw !== "object") {
    return {} as RendererTheme;
  }
  const obj = raw as Record<string, unknown>;
  if (obj.tokens && typeof obj.tokens === "object") {
    return obj.tokens as RendererTheme;
  }
  return obj as RendererTheme;
}

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const query = signedPreviewQuery(params);

  if (!query.includes("signature=") || !query.includes("expires=")) {
    return <PreviewUnavailable />;
  }

  const preview = await fetchPreview(query);
  if (!preview.ok || !preview.data) {
    return <PreviewUnavailable />;
  }

  const theme = themeTokens(preview.data.theme);
  const pages = (preview.data.pages as PreviewPage[] | undefined) ?? [];
  const pathValue = params.path;
  const path = typeof pathValue === "string" ? pathValue.replace(/^\//, "") : "";
  const page =
    pages.find((item) => (item.slug || "") === path) ||
    pages.find((item) => item.is_homepage) ||
    pages[0];

  const content =
    page?.draftRevision?.content_json ||
    page?.draft_revision?.content_json ||
    null;

  const site = preview.data.site as { name?: string } | undefined;
  const href = googleFontHref(
    typeof theme.headingFont === "string" ? theme.headingFont : "Inter",
    typeof theme.bodyFont === "string" ? theme.bodyFont : "Inter",
    typeof theme.monoFont === "string" ? theme.monoFont : null,
    typeof theme.serifFont === "string" ? theme.serifFont : null,
    ...fontStacksFromContent(content),
  );

  return (
    <div style={themeTokensToStyle(theme)}>
      {href ? <link rel="stylesheet" href={href} /> : null}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "var(--color-primary)",
          color: "var(--color-background)",
          padding: "0.5rem 1rem",
          fontSize: "0.85rem",
        }}
      >
        Preview mode — unpublished changes
      </div>
      <PageRenderer content={content} theme={theme} siteName={site?.name} />
    </div>
  );
}
