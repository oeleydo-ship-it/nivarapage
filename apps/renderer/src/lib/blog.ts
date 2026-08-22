import type { PublicBlogIndex, PublicBlogPost, PublicPage } from "./types";

export type BlogPath =
  | { kind: "index"; prefix: string }
  | { kind: "post"; prefix: string; slug: string };

export function parseBlogPath(path: string): BlogPath | null {
  const clean = path.replace(/\/$/, "") || "/";
  if (clean === "/blog" || clean === "/journal") {
    return { kind: "index", prefix: clean };
  }
  const match = clean.match(/^\/(blog|journal)\/([^/]+)$/);
  if (match) {
    return { kind: "post", prefix: `/${match[1]}`, slug: match[2] };
  }
  return null;
}

function formatDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function blogIndexPage(index: PublicBlogIndex): PublicPage {
  const path = index.index_path || "/blog";
  return {
    id: 0,
    name: "Blog",
    slug: path.replace(/^\//, "") || "blog",
    seo_title: "Blog",
    content: {
      schemaVersion: 1,
      sections: [
        {
          type: "posts.cards",
          props: {
            eyebrow: "Blog",
            heading: "Latest posts",
            description: "Articles published on this site.",
            buttonLabel: "",
            buttonUrl: path,
            useSitePosts: true,
            items: index.posts.map((post) => ({
              title: post.title,
              excerpt: post.excerpt || "",
              date: formatDate(post.published_at),
              tag: post.category || "Blog",
              image: post.cover_image,
              url: post.path || `${path}/${post.slug}`,
            })),
          },
        },
      ],
    },
  };
}

export function blogArticlePage(post: PublicBlogPost): PublicPage {
  const crumb = ["Home", post.category || "Blog", post.title].filter(Boolean).join(" / ");
  return {
    id: post.id,
    name: post.title,
    slug: post.slug,
    seo_title: post.seo_title || post.title,
    seo_description: post.seo_description || post.excerpt,
    og_image: post.cover_image,
    content: {
      schemaVersion: 1,
      sections: [
        {
          type: "hero.page",
          props: {
            heading: post.title,
            breadcrumb: crumb,
          },
        },
        {
          type: "content.richtext",
          props: {
            html: post.body_html || "",
            contentWidth: "narrow",
          },
        },
      ],
    },
  };
}
