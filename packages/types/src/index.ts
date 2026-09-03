export type BlockCategory =
  | 'navigation'
  | 'hero'
  | 'features'
  | 'services'
  | 'content'
  | 'gallery'
  | 'pricing'
  | 'faq'
  | 'cta'
  | 'footer'
  | 'form'
  | 'testimonials'
  | 'team'
  | 'blog'

export type BlockFieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'image'
  | 'video'
  | 'color'
  | 'select'
  | 'toggle'
  | 'number'
  | 'slider'
  | 'spacing'
  | 'link'
  | 'icon'
  | 'alignment'
  | 'background'
  | 'repeater'

export type BlockFieldGroup =
  | 'content'
  | 'design'
  | 'layout'
  | 'spacing'
  | 'typography'
  | 'animation'
  | 'background'
  | 'image'

export interface BlockField {
  key: string
  type: BlockFieldType
  label: string
  group?: BlockFieldGroup
  options?: { label: string; value: string }[]
  min?: number
  max?: number
  step?: number
  unit?: string
  placeholder?: string
  help?: string
  /** Child fields for `repeater` collections. */
  fields?: BlockField[]
  /** Singular noun used for repeater add/remove labels. */
  itemLabel?: string
  /** Default value applied to newly created repeater rows. */
  itemDefaults?: Record<string, unknown>
  /** Only show this control when another prop matches. */
  when?: { key: string; equals?: unknown; in?: unknown[]; not?: unknown }
}

export interface BlockSchema {
  fields: BlockField[]
}

export type BlockProps = Record<string, unknown>

export interface PageSection {
  id: string
  type: string
  version: number
  hidden: boolean
  props: BlockProps
}

export interface PageContent {
  schemaVersion: 1
  sections: PageSection[]
}

export interface ThemeTokens {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  muted: string
  headingFont: string
  bodyFont: string
  /** Family used for the monospace micro-labels some template families render. */
  monoFont: string
  /** Family used for editorial headlines and pull quotes. */
  serifFont: string
  headingWeight: number
  bodyWeight: number
  buttonRadius: string
  cardRadius: string
  containerWidth: string
  sectionSpacing: string
  [key: string]: string | number
}

export interface User {
  id: number
  name: string
  email: string
  email_verified?: boolean
  email_verified_at?: string | null
  current_workspace_id?: number | null
  is_super_admin?: boolean
  is_blocked?: boolean
  blocked_at?: string | null
  blocked_reason?: string | null
  subscription?: {
    plan_name?: string | null
    plan_slug?: string | null
    status?: string | null
    workspace_id?: number | null
    workspace_name?: string | null
  } | null
  created_at?: string
}

export interface Workspace {
  id: number
  name: string
  slug: string
  status?: string
  branding_removed?: boolean
  role?: string
  owner_id?: number
  created_at?: string
  plan?: { id: number; slug: string; name: string } | null
  subscription_status?: string | null
}

export interface AuthPayload {
  token: string
  user: User
  workspaces: Workspace[]
}

export interface Domain {
  id: number
  site_id: number
  type: 'platform' | 'custom' | string
  hostname: string
  is_primary: boolean
  status: string
  provider?: string | null
  provider_reference?: string | null
  verification_method?: string | null
  verification_status?: string | null
  verification_data?: Record<string, unknown> | null
  ssl_status?: string | null
  last_checked_at?: string | null
  activated_at?: string | null
  /** Present on custom hostnames only: everything needed to point DNS here. */
  dns?: DomainDnsInstructions | null
}

export interface DomainDnsRecord {
  /** What the record is for, which drives how the UI groups and explains it. */
  purpose: 'routing' | 'ownership' | 'certificate' | string
  type: 'CNAME' | 'ALIAS' | 'A' | 'AAAA' | 'TXT' | string
  /** Relative to the zone, e.g. `www` or `@` - what a registrar's host field wants. */
  name: string
  value: string
  ttl: string
  required: boolean
  help?: string
  /**
   * Root domains can be routed either way; records sharing an `option` belong
   * to the same choice and only one option should ever be created.
   */
  option?: 'alias' | 'address' | string | null
  option_label?: string | null
}

export interface DomainDnsInstructions {
  hostname: string
  root: string
  is_apex: boolean
  cname_target: string
  apex_ips: string[]
  apex_ipv6?: string[]
  /** Where the apex addresses came from: admin override, live DNS, or nothing. */
  apex_source?: 'configured' | 'resolved' | 'none' | string
  records: DomainDnsRecord[]
  steps: Array<{ title: string; detail: string }>
  notes: string[]
  errors: string[]
}

export interface SiteSettings {
  default_description?: string | null
  favicon?: string | null
  social_image?: string | null
  robots?: 'index' | 'noindex' | 'none' | string | null
  google_analytics_id?: string | null
  google_site_verification?: string | null
  locale?: string | null
  timezone?: string | null
  redirect_secondary_to_primary?: boolean
  branding?: Record<string, unknown> | null
  extras?: Record<string, unknown> | null
}

export interface Site {
  id: number
  workspace_id: number
  name: string
  business_name?: string | null
  slug: string
  category?: string | null
  description?: string | null
  status: 'draft' | 'published' | 'disabled' | string
  client_id?: number | null
  domains?: Domain[]
  created_at?: string
  deleted_at?: string | null
}

export interface PageRevision {
  id: number
  page_id: number
  version_number: number
  content: PageContent
  reason?: string | null
  created_at?: string
}

export interface Page {
  id: number
  site_id: number
  name: string
  slug: string
  type: string
  status: string
  is_homepage: boolean
  seo_title?: string | null
  seo_description?: string | null
  seo_image?: string | null
  canonical_url?: string | null
  og_title?: string | null
  og_description?: string | null
  og_image?: string | null
  robots_index?: boolean
  draft_revision_id?: number | null
  published_revision_id?: number | null
  draft?: PageRevision | null
  published?: PageRevision | null
}

export interface TemplatePreviewContent {
  schemaVersion?: number
  sections?: Array<{
    id?: string
    type: string
    version?: number
    hidden?: boolean
    props?: Record<string, unknown>
  }>
}

export interface Template {
  id: number
  name: string
  slug: string
  description?: string | null
  is_premium?: boolean
  is_active?: boolean
  is_featured?: boolean
  thumbnail?: string | null
  page_count?: number
  category?: { id: number; name: string; slug: string } | null
  pages?: TemplatePage[] | unknown[]
  theme_tokens?: Partial<ThemeTokens> | Record<string, string | number> | null
  preview?: TemplatePreviewContent | null
}

export interface TemplatePage {
  id?: number
  name: string
  slug: string
  is_homepage?: boolean
  content_json?: TemplatePreviewContent | null
}

export interface BlockPreset {
  id: number
  name: string
  slug: string
  description?: string | null
  category: string
  block_type: string
  type?: string
  props: Record<string, unknown>
  is_active?: boolean
  is_featured?: boolean
  source?: string
  prompt?: string | null
  created_at?: string
}

export interface MediaItem {
  id: number
  site_id?: number | null
  filename: string
  mime_type: string
  size: number
  width?: number | null
  height?: number | null
  alt_text?: string | null
  path: string
  disk: string
  url?: string
  usage?: { count: number; pages: { id: number; name: string; slug: string }[] }
  created_at?: string
}

export interface PlanLimits {
  number_of_sites?: number
  custom_domains?: number
  storage_mb?: number
  pages_per_site?: number
  form_submissions?: number
  team_members?: number
  blog_posts?: number
  clients?: number
  funnels?: number
  ai_generations?: number
  premium_templates?: boolean
  revision_history?: number
  remove_branding?: boolean
  [key: string]: number | boolean | undefined
}

/**
 * One limit as the API describes it. The admin screen renders whatever the
 * server sends rather than a list compiled into the bundle, so a limit added
 * on the server shows up without shipping a new front end.
 *
 * A `quota` is an integer where -1 is unlimited and 0 excludes the feature; a
 * `flag` is a plain boolean entitlement.
 */
export interface PlanLimitDefinition {
  type: 'quota' | 'flag'
  label: string
  group: string
  default: number | boolean
  unit: string | null
  help: string
}

export type PlanLimitSchema = Record<string, PlanLimitDefinition>

/**
 * The header and footer a site shows on every page.
 *
 * Both hold the same shape as a page's content, so the builder edits them with
 * the canvas it already has and the renderer composes them into each page.
 */
export interface SiteChrome {
  header: PageContent
  footer: PageContent
}

export interface Plan {
  id: number
  slug: string
  name: string
  prices?: { monthly?: number; yearly?: number } & Record<string, number | undefined>
  limits?: PlanLimits
  is_active?: boolean
  stripe_price_monthly?: string | null
  stripe_price_yearly?: string | null
  subscriptions_count?: number
}

export interface UsageEntry {
  used?: number
  limit?: number | boolean | null
  enabled?: boolean
}

export interface Subscription {
  id?: number | null
  status?: string | null
  provider?: string | null
  current_period_end?: string | null
  cancel_at_period_end?: boolean
  interval?: 'monthly' | 'yearly' | string | null
  stripe_enabled?: boolean
  portal_available?: boolean
  plan?: Plan | null
  usage?: Record<string, UsageEntry>
}

export interface PlanLimitError {
  message?: string
  error?: 'plan_limit' | string
  limit_key?: string
  used?: number | boolean | null
  limit?: number | boolean | null
  usage?: Record<string, UsageEntry>
}

export type WorkspaceRole = 'owner' | 'admin' | 'designer' | 'editor' | 'viewer'

export interface WorkspaceMember extends User {
  role?: WorkspaceRole | string
}

export interface WorkspaceInvitation {
  id: number
  email: string
  role: string
  token?: string
  expires_at?: string | null
  created_at?: string | null
}

export interface Activity {
  id: number
  action: string
  label?: string
  actor?: { id: number; name: string; email: string } | null
  actor_id?: number | null
  target?: { type?: string | null; id?: number | null; name?: string | null }
  workspace?: { id: number; name: string } | null
  workspace_id?: number | null
  ip?: string | null
  metadata?: Record<string, unknown> | null
  timestamp?: string | null
  created_at?: string | null
}

export const CLIENT_STATUSES = ['lead', 'active', 'paused', 'archived'] as const
export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export interface ClientContact {
  id: number
  workspace_id: number
  client_id: number
  name: string
  email?: string | null
  phone?: string | null
  title?: string | null
  is_primary?: boolean
  notes?: string | null
  extras?: Record<string, unknown>
  created_at?: string
}

export interface Client {
  id: number
  workspace_id: number
  name: string
  company?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  status: ClientStatus | string
  industry?: string | null
  source?: string | null
  address?: string | null
  city?: string | null
  region?: string | null
  postal_code?: string | null
  country?: string | null
  notes?: string | null
  tags?: string[]
  extras?: Record<string, unknown>
  contacts_count?: number
  sites_count?: number
  contacts?: ClientContact[]
  sites?: Site[]
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export const LIVECHAT_STATUSES = ['open', 'waiting', 'assigned', 'closed'] as const
export type LivechatStatus = (typeof LIVECHAT_STATUSES)[number]

export interface LivechatMessage {
  id: number
  conversation_id: number
  user_id?: number | null
  role: 'visitor' | 'agent' | 'ai' | 'system' | string
  body: string
  meta?: Record<string, unknown>
  agent_name?: string | null
  created_at?: string
}

export interface LivechatConversation {
  id: number
  uuid: string
  workspace_id: number
  site_id: number
  widget_id: number
  client_id?: number | null
  assigned_user_id?: number | null
  status: LivechatStatus | string
  handler: 'ai' | 'human' | string
  visitor_name?: string | null
  visitor_email?: string | null
  visitor_phone?: string | null
  page_url?: string | null
  country?: string | null
  region?: string | null
  city?: string | null
  locale?: string | null
  timezone?: string | null
  browser?: string | null
  os?: string | null
  device?: string | null
  last_message_at?: string | null
  agent_typing?: boolean
  typing_as?: string | null
  closed_at?: string | null
  created_at?: string
  site?: { id: number; name: string } | null
  assignee?: { id: number; name: string } | null
  client?: { id: number; name: string; email?: string | null } | null
  messages?: LivechatMessage[]
  latest_message?: LivechatMessage | null
  agent_last_read_at?: string | null
  unread_count?: number
}

export interface LivechatWidget {
  id: number
  workspace_id: number
  site_id: number
  public_key: string
  enabled: boolean
  ai_enabled: boolean
  mode: 'ai_first' | 'human_first' | 'hybrid' | string
  greeting: string
  offline_message?: string | null
  primary_color: string
  theme: 'dark' | 'light' | 'auto' | string
  surface_color?: string | null
  text_color?: string | null
  bubble_color?: string | null
  position: 'left' | 'right' | string
  launcher_label: string
  launcher_icon: 'chat' | 'bubble' | 'headset' | 'sparkle' | string
  collect_name: boolean
  collect_email: boolean
  collect_phone: boolean
  require_contact: boolean
  knowledge_count?: number
  /** Whether the site's published HTML actually carries the widget tag. */
  live_on_site?: boolean
  embed_script?: string
  site?: { id: number; name: string; status?: string } | null
  updated_at?: string
}

export interface LivechatKnowledge {
  id: number
  site_id: number
  title: string
  source: string
  filename?: string | null
  mime?: string | null
  bytes?: number
  excerpt?: string
  created_at?: string
}

export const BLOG_STATUSES = ['draft', 'published'] as const
export type BlogStatus = (typeof BLOG_STATUSES)[number]

export interface BlogPost {
  id: number
  workspace_id: number
  site_id: number
  title: string
  slug: string
  excerpt?: string | null
  body?: string | null
  cover_image?: string | null
  author_name?: string | null
  category?: string | null
  tags?: string[]
  status: BlogStatus | string
  published_at?: string | null
  seo_title?: string | null
  seo_description?: string | null
  path?: string
  site?: Pick<Site, 'id' | 'name' | 'status' | 'domains'> | null
  created_at?: string
  updated_at?: string
}

export interface OverviewMetrics {
  total_websites: number
  published: number
  custom_domains: number
  form_submissions: number
  clients?: number
  blog_posts?: number
  storage_usage: { bytes: number; mb: number }
  usage?: Record<string, UsageEntry>
  plan?: { id: number; slug: string; name: string } | null
}

export interface FormFieldDef {
  id?: number
  name: string
  label: string
  type: string
  required?: boolean
  options?: Array<string | { label: string; value: string }>
  sort_order?: number
}

/**
 * Something a workspace sells.
 *
 * `price` is minor units - pence or cents - the way Stripe counts, so money
 * never passes through a float on its way anywhere.
 */
export interface Product {
  id: number
  workspace_id: number
  name: string
  slug: string
  description?: string | null
  image?: string | null
  price: number
  currency: string
  type: 'one_time' | 'subscription'
  interval?: 'day' | 'week' | 'month' | 'year' | null
  status: 'draft' | 'active' | 'archived'
  success_url?: string | null
  inventory?: number | null
  created_at?: string
}

/** One attempt to buy something. */
export interface Order {
  id: number
  reference: string
  product_id?: number | null
  status: 'pending' | 'paid' | 'failed'
  amount: number
  currency: string
  customer_email?: string | null
  customer_name?: string | null
  paid_at?: string | null
  created_at?: string
  /** Loaded alongside the order so the table can name what was bought. */
  product?: { id: number; name: string } | null
}

/** A workspace's own Stripe connection. Secrets never travel in this shape. */
export interface WorkspacePaymentSettings {
  provider: string
  enabled: boolean
  mode: 'test' | 'live'
  currency: string
  publishable_key?: string | null
  account_name?: string | null
  connected: boolean
  /** Last four characters of the stored key, so it can be recognised. */
  secret_hint?: string | null
  secret_unreadable: boolean
  webhook_set: boolean
  webhook_url: string
  verified_at?: string | null
  last_error?: string | null
}

export interface SiteForm {
  id: number
  site_id: number
  name: string
  slug: string
  type?: string
  settings?: Record<string, unknown>
  fields?: FormFieldDef[]
}

export interface FormSubmission {
  id: number
  form_id: number
  name?: string | null
  email?: string | null
  form?: string | null
  website?: string | null
  page?: string | null
  status?: string
  submitted?: string
  payload?: Record<string, unknown>
  created_at?: string
}

export type FunnelStatus = 'draft' | 'published' | 'paused' | 'archived'

export interface FunnelStep {
  id: number
  funnel_id: number
  page_id?: number | null
  draft_content?: PageContent | null
  published_content?: PageContent | null
  name: string
  slug: string
  type: string
  status: string
  position: number
  canvas_x: number
  canvas_y: number
  settings?: Record<string, unknown>
  seo_title?: string | null
  seo_description?: string | null
  page?: { id: number; name: string; slug: string } | null
}

export interface FunnelConnection {
  id: number
  source_step_id: number
  target_step_id: number
  connection_type: string
  conditions?: Record<string, unknown> | unknown[]
  priority: number
}

export interface Funnel {
  id: number
  public_id: string
  workspace_id: number
  site_id?: number | null
  domain_id?: number | null
  name: string
  slug: string
  description?: string | null
  type: string
  goal: string
  status: FunnelStatus | string
  settings?: Record<string, unknown>
  published_at?: string | null
  site?: { id: number; name: string; slug: string } | null
  steps?: FunnelStep[]
  connections?: FunnelConnection[]
  steps_count?: number
  leads_count?: number
  events_count?: number
  created_at?: string
  updated_at?: string
}

export interface FunnelLead {
  id: number
  funnel_id: number
  funnel_step_id?: number | null
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  company?: string | null
  country?: string | null
  source?: string | null
  campaign?: string | null
  data?: Record<string, unknown>
  funnel?: { id: number; name: string } | null
  step?: { id: number; name: string } | null
  created_at?: string
}

export interface FunnelAnalytics {
  range_days: number
  visitors: number
  unique_visitors: number
  sessions: number
  leads: number
  conversions: number
  conversion_rate: number
  revenue: number
  orders: number
  bookings: number
  checkout_starts: number
  abandoned_checkouts: number
  average_order_value: number
  revenue_per_visitor: number
  daily: Array<{ date: string; views: number; visitors: number; sessions: number; leads: number; conversions: number; revenue: number }>
  steps: Array<{ step_id: number; name: string; position: number; views: number; unique_views: number; conversions: number; conversion_rate: number; drop_off_rate: number; revenue: number; average_time_seconds: number }>
  biggest_drop_off?: { step_id: number; name: string; drop_off_rate: number } | null
  sources: FunnelDimension[]
  campaigns: FunnelDimension[]
  devices: FunnelDimension[]
  countries: FunnelDimension[]
  attribution: { first_touch: Array<{ label: string; revenue: number }>; last_touch: Array<{ label: string; revenue: number }> }
  realtime: { visitors_online: number; active_sessions: number; conversions_today: number; revenue_today: number; recent_leads: FunnelLead[]; recent_purchases: Array<{ id: number; revenue: number; currency?: string; source?: string; occurred_at: string }> }
  filters?: Record<string, unknown>
}

export interface FunnelDimension {
  label: string
  visitors: number
  sessions: number
  leads: number
  conversions: number
  revenue: number
}

export const SITE_CATEGORIES = [
  'Business',
  'Restaurant',
  'Portfolio',
  'Agency',
  'Construction',
  'Real Estate',
  'Medical',
  'Consulting',
  'SaaS',
  'Personal',
  'Landing Page',
  'Other',
] as const

export type SiteCategory = (typeof SITE_CATEGORIES)[number]
