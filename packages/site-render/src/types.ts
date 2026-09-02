export type SiteSettings = {
  default_description?: string | null;
  favicon?: string | null;
  social_image?: string | null;
  robots?: string | null;
  google_analytics_id?: string | null;
  google_site_verification?: string | null;
  locale?: string | null;
  redirect_secondary_to_primary?: boolean;
  branding?: Record<string, unknown> | null;
  extras?: Record<string, unknown> | null;
};

export type ResolvedSite = {
  site_id: number;
  name: string;
  business_name?: string | null;
  status: string;
  host: string;
  primary_hostname?: string | null;
  redirect_to_primary: boolean;
  settings?: SiteSettings | null;
  theme?: Record<string, unknown> | null;
  branding_removed?: boolean;
  /** The platform's own name and URL, for the "Made with…" credit. */
  platform_name?: string | null;
  platform_url?: string | null;
  livechat?: {
    public_key: string;
    enabled: boolean;
    position?: string;
    primary_color?: string;
    /** Absolute URL of the widget boot script, built by the API. */
    script_url?: string | null;
  } | null;
};

export type PublicPage = {
  id: number;
  name: string;
  slug: string;
  is_homepage?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_image?: string | null;
  canonical_url?: string | null;
  canonical?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  og_image?: string | null;
  robots_index?: boolean;
  robots?: { index: boolean; follow: boolean };
  content?: {
    schemaVersion?: number;
    sections?: Array<{
      id?: string;
      type: string;
      version?: number;
      hidden?: boolean;
      props?: Record<string, unknown>;
    }>;
  } | null;
};

export type SitemapEntry = {
  slug: string;
  is_homepage?: boolean;
  path?: string;
  loc?: string;
  lastmod?: string;
  updated_at?: string;
};

export type MenuItem = {
  id: number;
  label: string;
  url?: string | null;
  href?: string | null;
  type?: string | null;
  target?: string | null;
  page_id?: number | null;
  children?: MenuItem[];
};

export type Menu = {
  id: number;
  name: string;
  location?: string | null;
  items?: MenuItem[];
};

export type PublicBlogPost = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  body_html?: string;
  cover_image?: string | null;
  author_name?: string | null;
  category?: string | null;
  tags?: string[];
  published_at?: string | null;
  path?: string;
  seo_title?: string | null;
  seo_description?: string | null;
};

export type PublicBlogIndex = {
  index_path: string;
  posts: PublicBlogPost[];
};

export type Envelope<T> = { data: T; message?: string };
