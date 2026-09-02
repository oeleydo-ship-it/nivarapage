import type {
  Activity,
  AuthPayload,
  BlockPreset,
  BlogPost,
  Client,
  ClientContact,
  Domain,
  FormSubmission,
  Funnel,
  FunnelAnalytics,
  FunnelLead,
  FunnelStep,
  MediaItem,
  OverviewMetrics,
  Page,
  PageContent,
  PageSection,
  Plan,
  PlanLimitSchema,
  Site,
  SiteChrome,
  SiteForm,
  SiteSettings,
  Subscription,
  Template,
  User,
  Workspace,
  WorkspaceInvitation,
  WorkspaceMember,
  LivechatConversation,
  LivechatKnowledge,
  LivechatMessage,
  LivechatWidget,
} from '@uidesired/types'
import { apiNdjson, apiPaginated, getToken, getWorkspaceId, http } from './api'

export const workspacesApi = {
  list: () => http.get<Workspace[]>('/workspaces'),
  create: (name: string) => http.post<Workspace>('/workspaces', { name }),
  rename: (id: number, name: string) => http.patch<Workspace>(`/workspaces/${id}`, { name }),
  switch: (id: number) => http.post<{ current_workspace_id: number }>(`/workspaces/${id}/switch`),
  members: (id: number) => http.get<WorkspaceMember[]>(`/workspaces/${id}/members`),
  invitations: (id: number) => http.get<WorkspaceInvitation[]>(`/workspaces/${id}/invitations`),
  invite: (id: number, body: { email: string; role: string }) =>
    http.post<WorkspaceInvitation>(`/workspaces/${id}/invitations`, body),
  updateMember: (id: number, userId: number, role: string) =>
    http.patch(`/workspaces/${id}/members/${userId}`, { role }),
  removeMember: (id: number, userId: number) => http.delete(`/workspaces/${id}/members/${userId}`),
  transfer: (id: number, userId: number) => http.post(`/workspaces/${id}/transfer`, { user_id: userId }),
}

export const livechatApi = {
  inbox: (params?: { status?: string; site_id?: string | number; q?: string }) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.site_id) search.set('site_id', String(params.site_id))
    if (params?.q) search.set('q', params.q)
    const qs = search.toString()
    return apiPaginated<LivechatConversation>(`/livechat/conversations${qs ? `?${qs}` : ''}`)
  },
  conversation: (id: string | number) => http.get<LivechatConversation>(`/livechat/conversations/${id}`),
  reply: (id: string | number, body: string) =>
    http.post<LivechatMessage>(`/livechat/conversations/${id}/messages`, { body }),
  typing: (id: string | number) => http.post<LivechatConversation>(`/livechat/conversations/${id}/typing`),
  assign: (id: string | number, user_id?: number | null) =>
    http.post<LivechatConversation>(`/livechat/conversations/${id}/assign`, { user_id: user_id ?? null }),
  takeover: (id: string | number) => http.post<LivechatConversation>(`/livechat/conversations/${id}/takeover`),
  close: (id: string | number) => http.post<LivechatConversation>(`/livechat/conversations/${id}/close`),
  reopen: (id: string | number) => http.post<LivechatConversation>(`/livechat/conversations/${id}/reopen`),
  widget: (siteId: string | number) => http.get<LivechatWidget>(`/sites/${siteId}/livechat`),
  updateWidget: (siteId: string | number, body: Record<string, unknown>) =>
    http.put<LivechatWidget>(`/sites/${siteId}/livechat`, body),
  knowledge: (siteId: string | number) => http.get<LivechatKnowledge[]>(`/sites/${siteId}/livechat/knowledge`),
  addKnowledge: (siteId: string | number, body: { title?: string; content?: string; file?: File }) => {
    const fd = new FormData()
    if (body.title) fd.append('title', body.title)
    if (body.content) fd.append('content', body.content)
    if (body.file) fd.append('file', body.file)
    return http.upload<LivechatKnowledge>(`/sites/${siteId}/livechat/knowledge`, fd)
  },
  syncKnowledge: (siteId: string | number) =>
    http.post<LivechatKnowledge>(`/sites/${siteId}/livechat/knowledge/sync`),
  removeKnowledge: (id: string | number) => http.delete<{ ok: boolean }>(`/livechat/knowledge/${id}`),
  widgets: () => http.get<LivechatWidget[]>('/livechat/widgets'),
}

export const overviewApi = {
  get: () => http.get<OverviewMetrics>('/overview'),
}

export const featuresApi = {
  get: () => http.get<{ funnels: boolean }>('/features'),
}

export const funnelsApi = {
  list: (params?: { q?: string; status?: string; page?: number }) =>
    apiPaginated<Funnel>(`/funnels${queryString({ ...params })}`),
  get: (id: string | number) => http.get<Funnel>(`/funnels/${id}`),
  create: (body: { name: string; description?: string; type?: string; goal?: string; template?: string }) =>
    http.post<Funnel>('/funnels', body),
  update: (id: string | number, body: Partial<Funnel>) => http.patch<Funnel>(`/funnels/${id}`, body),
  remove: (id: string | number) => http.delete<{ ok: boolean }>(`/funnels/${id}`),
  publish: (id: string | number) => http.post<Funnel>(`/funnels/${id}/publish`),
  pause: (id: string | number) => http.post<Funnel>(`/funnels/${id}/pause`),
  duplicate: (id: string | number) => http.post<Funnel>(`/funnels/${id}/duplicate`),
  analytics: (id?: string | number, days = 30, filters?: { funnel_id?: number; domain_id?: number; source?: string; campaign?: string; device?: string; country?: string }) =>
    http.get<FunnelAnalytics>(`${id ? `/funnels/${id}/analytics` : '/funnels/analytics'}${queryString({ days, ...filters })}`),
  leads: () => apiPaginated<FunnelLead>('/funnels/leads'),
  addStep: (id: string | number, body: { name: string; type: string; page_id?: number; canvas_x?: number; canvas_y?: number }) =>
    http.post<FunnelStep>(`/funnels/${id}/steps`, body),
  updateStep: (id: string | number, stepId: string | number, body: Partial<FunnelStep>) =>
    http.patch<FunnelStep>(`/funnels/${id}/steps/${stepId}`, body),
  saveStepContent: (id: string | number, stepId: string | number, content: import('@uidesired/types').PageContent) =>
    http.put<FunnelStep>(`/funnels/${id}/steps/${stepId}/content`, content),
  deleteStep: (id: string | number, stepId: string | number) => http.delete(`/funnels/${id}/steps/${stepId}`),
  connect: (id: string | number, source_step_id: number, target_step_id: number) =>
    http.post(`/funnels/${id}/connections`, { source_step_id, target_step_id }),
  disconnect: (id: string | number, connectionId: string | number) => http.delete(`/funnels/${id}/connections/${connectionId}`),
}

export const sitesApi = {
  list: () => http.get<Site[]>('/sites'),
  create: (body: Record<string, unknown>) => http.post<Site>('/sites', body),
  get: (id: string | number) => http.get<Site>(`/sites/${id}`),
  update: (id: string | number, body: Record<string, unknown>) => http.patch<Site>(`/sites/${id}`, body),
  remove: (id: string | number) => http.delete(`/sites/${id}`),
  duplicate: (id: string | number) => http.post<Site>(`/sites/${id}/duplicate`),
  restore: (id: string | number) => http.post<Site>(`/sites/${id}/restore`),
  publish: (id: string | number) => http.post<Site>(`/sites/${id}/publish`),
  settings: (id: string | number) => http.get<SiteSettings>(`/sites/${id}/settings`),
  updateSettings: (id: string | number, body: Record<string, unknown>) =>
    http.put<SiteSettings>(`/sites/${id}/settings`, body),
  theme: (id: string | number) => http.get<{ tokens?: Record<string, unknown> } | Record<string, unknown>>(`/sites/${id}/theme`),
  updateTheme: (id: string | number, tokens: Record<string, unknown>) =>
    http.put(`/sites/${id}/theme`, { tokens }),
  /** The header and footer this site puts on every page. */
  chrome: (id: string | number) => http.get<SiteChrome>(`/sites/${id}/chrome`),
  /** Send only the slot being edited; the other is left as it is. */
  updateChrome: (id: string | number, body: Partial<SiteChrome>) =>
    http.put<SiteChrome>(`/sites/${id}/chrome`, body),
  applyTemplate: (id: string | number, template_id: number) =>
    http.post<Site>(`/sites/${id}/apply-template`, { template_id }),
  previewToken: (id: string | number) =>
    http.post<{ token_url: string; expires_at: string; site_id: number }>(`/sites/${id}/preview-token`),
}

export const clientsApi = {
  list: (params?: { q?: string; status?: string }) => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.status && params.status !== 'all') search.set('status', params.status)
    const qs = search.toString()
    return http.get<Client[]>(`/clients${qs ? `?${qs}` : ''}`)
  },
  get: (id: string | number) => http.get<Client>(`/clients/${id}`),
  create: (body: Record<string, unknown>) => http.post<Client>('/clients', body),
  update: (id: string | number, body: Record<string, unknown>) => http.patch<Client>(`/clients/${id}`, body),
  remove: (id: string | number) => http.delete<{ ok: boolean }>(`/clients/${id}`),
  addContact: (id: string | number, body: Record<string, unknown>) =>
    http.post<ClientContact>(`/clients/${id}/contacts`, body),
  updateContact: (contactId: string | number, body: Record<string, unknown>) =>
    http.patch<ClientContact>(`/client-contacts/${contactId}`, body),
  removeContact: (contactId: string | number) => http.delete<{ ok: boolean }>(`/client-contacts/${contactId}`),
  attachSite: (id: string | number, site_id: number) => http.post<Site>(`/clients/${id}/sites`, { site_id }),
  detachSite: (id: string | number, siteId: string | number) =>
    http.delete<{ ok: boolean }>(`/clients/${id}/sites/${siteId}`),
}

export const blogApi = {
  list: (params?: { q?: string; status?: string; site_id?: string | number }) => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.status && params.status !== 'all') search.set('status', params.status)
    if (params?.site_id) search.set('site_id', String(params.site_id))
    const qs = search.toString()
    return http.get<BlogPost[]>(`/blog-posts${qs ? `?${qs}` : ''}`)
  },
  get: (id: string | number) => http.get<BlogPost>(`/blog-posts/${id}`),
  create: (body: Record<string, unknown>) => http.post<BlogPost>('/blog-posts', body),
  update: (id: string | number, body: Record<string, unknown>) => http.patch<BlogPost>(`/blog-posts/${id}`, body),
  publish: (id: string | number) => http.post<BlogPost>(`/blog-posts/${id}/publish`),
  /** Creates the site's blog index page if it has none. Idempotent. */
  ensureIndex: (siteId: string | number) =>
    http.post<{ page_id: number; path: string }>(`/sites/${siteId}/blog-index`),
  remove: (id: string | number) => http.delete<{ ok: boolean }>(`/blog-posts/${id}`),
}

export const subdomainsApi = {
  check: (name: string) =>
    http.get<{ available?: boolean; name?: string; hostname?: string; platform_domain?: string }>(
      `/subdomains/check?name=${encodeURIComponent(name)}`,
    ),
}

export const pagesApi = {
  list: (siteId: string | number) => http.get<Page[]>(`/sites/${siteId}/pages`),
  create: (siteId: string | number, body: Record<string, unknown>) => http.post<Page>(`/sites/${siteId}/pages`, body),
  get: (id: string | number) => http.get<Page>(`/pages/${id}`),
  update: (id: string | number, body: Record<string, unknown>) => http.patch<Page>(`/pages/${id}`, body),
  remove: (id: string | number) => http.delete<{ ok: boolean }>(`/pages/${id}`),
  saveDraft: (id: string | number, content: unknown) => http.put(`/pages/${id}/draft`, { content }),
  publish: (id: string | number) => http.post<Page>(`/pages/${id}/publish`),
  revisions: (id: string | number) => http.get<unknown[]>(`/pages/${id}/revisions`),
  restore: (pageId: string | number, revisionId: string | number) =>
    http.post(`/pages/${pageId}/revisions/${revisionId}/restore`),
}

export const domainsApi = {
  list: (siteId: string | number) => http.get<Domain[]>(`/sites/${siteId}/domains`),
  add: (siteId: string | number, hostname: string) => http.post<Domain>(`/sites/${siteId}/domains`, { hostname }),
  verify: (id: number) => http.post<Domain>(`/domains/${id}/verify`),
  primary: (id: number) => http.post<Domain>(`/domains/${id}/primary`),
  retry: (id: number) => http.post<Domain>(`/domains/${id}/retry`),
  remove: (id: number) => http.delete(`/domains/${id}`),
}

export const templatesApi = {
  list: () => http.get<Template[]>('/templates'),
  get: (id: string | number) => http.get<Template>(`/templates/${id}`),
}

export const blockPresetsApi = {
  list: () => http.get<BlockPreset[]>('/block-presets'),
}

export const mediaApi = {
  list: (params?: { q?: string; site_id?: string | number }) => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.site_id) search.set('site_id', String(params.site_id))
    const qs = search.toString()
    return http.get<MediaItem[]>(`/media${qs ? `?${qs}` : ''}`)
  },
  get: (id: number) => http.get<MediaItem>(`/media/${id}`),
  upload: (file: File, extras?: { alt?: string; site_id?: string | number }) => {
    const fd = new FormData()
    fd.append('file', file)
    if (extras?.alt) fd.append('alt_text', extras.alt)
    if (extras?.site_id) fd.append('site_id', String(extras.site_id))
    return http.upload<MediaItem>('/media', fd)
  },
  update: (id: number, body: { alt_text?: string; filename?: string }) => http.patch<MediaItem>(`/media/${id}`, body),
  remove: (id: number) => http.delete(`/media/${id}`),
}

export const menusApi = {
  get: (siteId: string | number) =>
    http.get<Array<{ id: number; name: string; location: string; items: Record<string, unknown>[] }>>(`/sites/${siteId}/menus`),
  update: (siteId: string | number, menus: unknown) => http.put(`/sites/${siteId}/menus`, { menus }),
}

export const formsApi = {
  list: (siteId: string | number) => http.get<SiteForm[]>(`/sites/${siteId}/forms`),
  create: (siteId: string | number, body: Record<string, unknown>) =>
    http.post<SiteForm>(`/sites/${siteId}/forms`, body),
  update: (id: string | number, body: Record<string, unknown>) => http.patch<SiteForm>(`/forms/${id}`, body),
  remove: (id: string | number) => http.delete(`/forms/${id}`),
  submissions: (params?: { status?: string; form_id?: string | number }) => {
    const search = new URLSearchParams()
    if (params?.status) search.set('status', params.status)
    if (params?.form_id) search.set('form_id', String(params.form_id))
    const qs = search.toString()
    return apiPaginated<FormSubmission>(`/form-submissions${qs ? `?${qs}` : ''}`)
  },
  updateSubmission: (id: number, status: string) => http.patch(`/form-submissions/${id}`, { status }),
  async downloadCsv() {
    const headers = new Headers()
    const token = getToken()
    const workspaceId = getWorkspaceId()
    if (token) headers.set('Authorization', `Bearer ${token}`)
    if (workspaceId) headers.set('X-Workspace-Id', workspaceId)
    const res = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1'}/form-submissions/export`, { headers })
    if (!res.ok) throw new Error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'form-submissions.csv'
    link.click()
    URL.revokeObjectURL(url)
  },
}

function queryString(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

export const activitiesApi = {
  list: (params?: { action?: string; q?: string; page?: number }) =>
    apiPaginated<Activity>(`/activities${queryString({ ...params })}`),
  actions: () => http.get<string[]>('/activities/actions'),
}

export const billingApi = {
  plans: () => http.get<Plan[]>('/billing/plans'),
  subscription: () => http.get<Subscription>('/billing/subscription'),
  changePlan: (plan: string, interval?: 'monthly' | 'yearly') =>
    http.post<Subscription>('/billing/change-plan', { plan, interval }),
  checkout: (plan: string, interval: 'monthly' | 'yearly') =>
    http.post<{ url: string; id?: string }>('/billing/checkout', { plan, interval }),
  portal: () => http.post<{ url: string }>('/billing/portal'),
}

export type AiRewriteMode = 'improve' | 'expand' | 'shorten' | 'tone' | 'fix'

export type AiStatus = {
  enabled: boolean
  configured: boolean
  available: boolean
  provider: string | null
  model: string | null
  entitled: boolean
  used: number
  limit: number
  block_types: string[]
}

export type AiUsage = {
  used: number
  limit: number | null
}

export type AiReport = {
  sections?: number
  dropped_types?: string[]
  dropped_props?: string[]
}

export type AiGeneratedPage = {
  name: string
  slug: string
  is_homepage?: boolean
  content: PageContent
}

export type AiGeneratePageResult = {
  content: PageContent
  pages?: AiGeneratedPage[]
  theme?: Record<string, unknown>
  report: AiReport
  usage: AiUsage
}

export type AiGenerateBlockResult = {
  section: PageSection
  sections?: PageSection[]
  report: AiReport
  usage: AiUsage
}

export type AiChatAction = 'apply_site' | 'replace_page' | 'create_page' | 'insert_blocks' | 'update_theme' | 'reply'

export type AiChatResult = {
  action: AiChatAction
  message: string
  pages?: AiGeneratedPage[]
  sections?: PageSection[]
  theme?: Record<string, unknown>
  report: AiReport
  usage: AiUsage
}

export type AiGenerationMode = 'auto' | 'full_site' | 'current_page' | 'blocks'

export type AiChatRequest = {
  site_id: string | number
  page_id?: string | number
  page_name?: string
  page_slug?: string
  is_homepage?: boolean
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  existing_pages?: Array<{ name?: string; slug?: string }>
  theme?: Record<string, unknown>
  current_content?: PageContent
  selected_type?: string
  selected_heading?: string
  generation_mode?: AiGenerationMode
  requested_pages?: number
}

export type AiStreamEvent =
  | { type: 'start' | 'progress'; stage?: string; message?: string; progress?: number; code?: string; action?: AiChatAction }
  | { type: 'plan'; action: AiChatAction; pages: number; sections: number; theme?: Record<string, unknown>; progress?: number }
  | { type: 'page'; index: number; total: number; page: { name: string; slug: string; is_homepage?: boolean }; blocks: number; code?: string }
  | { type: 'block'; page_index: number | null; page_slug: string; page_home?: boolean; index: number; total: number; section: PageSection }
  | { type: 'result'; data: AiChatResult }
  | { type: 'done'; message?: string; progress?: number }

export type AiRewriteResult = {
  text: string
  usage: AiUsage
}

export const aiApi = {
  status: () => http.get<AiStatus>('/ai/status'),
  generatePage: (body: {
    site_id: string | number
    prompt: string
    page_name?: string
    page_type?: string
    tone?: string
    sections?: string[]
  }) => http.post<AiGeneratePageResult>('/ai/generate-page', body),
  /**
   * Rewrites a site's copy for its business while keeping the template it was
   * built from. Only the words change - block types, order and design do not.
   */
  generateTemplateCopy: (body: { site_id: string | number; prompt?: string; tone?: string }) =>
    http.post<{ pages: number; slots: number; rewritten: number; failed_pages: string[] }>(
      '/ai/generate-template-copy',
      body,
    ),
  chat: (body: AiChatRequest) => http.post<AiChatResult>('/ai/chat', body),
  chatStream: async (body: AiChatRequest, onEvent: (event: AiStreamEvent) => void, signal?: AbortSignal) => {
    let result: AiChatResult | undefined
    await apiNdjson<AiStreamEvent>('/ai/chat-stream', body, (event) => {
      onEvent(event)
      if (event.type === 'result') result = event.data
    }, signal)
    if (!result) throw new Error('The AI stream ended before returning a website.')
    return result
  },
  applyGeneration: (body: {
    site_id: string | number
    page_id?: string | number
    pages: AiGeneratedPage[]
    theme?: Record<string, unknown>
  }) =>
    http.post<{
      pages: Page[]
      theme: Record<string, unknown>
      skipped: string[]
      current_content: PageContent | null
    }>('/ai/apply-generation', body),
  generateBlock: (body: {
    site_id: string | number
    prompt: string
    type?: string
    tone?: string
    props?: Record<string, unknown>
  }) => http.post<AiGenerateBlockResult>('/ai/generate-block', body),
  rewrite: (body: {
    site_id: string | number
    text: string
    mode?: AiRewriteMode
    tone?: string
    context?: string
  }) => http.post<AiRewriteResult>('/ai/rewrite', body),
}

export const adminApi = {
  stats: () => http.get<AdminStats>('/admin/dashboard'),
  users: (params?: { page?: number; q?: string }) => apiPaginated<User>(`/admin/users${queryString({ ...params })}`),
  blockUser: (id: number, reason?: string) => http.post<User>(`/admin/users/${id}/block`, { reason }),
  unblockUser: (id: number) => http.post<User>(`/admin/users/${id}/unblock`),
  deleteUser: (id: number) => http.delete<{ ok: boolean }>(`/admin/users/${id}`),
  impersonateUser: (id: number) =>
    http.post<
      AuthPayload & {
        impersonation?: {
          admin_id: number
          admin_name: string
          admin_email: string
          target_name: string
          target_email: string
        }
      }
    >(`/admin/users/${id}/impersonate`),
  workspaces: (params?: { page?: number; q?: string }) =>
    apiPaginated<Workspace>(`/admin/workspaces${queryString({ ...params })}`),
  sites: (params?: { page?: number; q?: string }) => apiPaginated<Site>(`/admin/sites${queryString({ ...params })}`),
  domains: (params?: { page?: number; q?: string }) => apiPaginated<Domain>(`/admin/domains${queryString({ ...params })}`),
  templates: () => http.get<Template[]>('/admin/templates'),
  updateTemplate: (
    id: number,
    body: { is_active?: boolean; is_featured?: boolean; name?: string; description?: string | null; theme_tokens?: Record<string, unknown> },
  ) => http.patch<Template>(`/admin/templates/${id}`, body),
  generateTemplate: (body: {
    prompt: string
    name?: string
    description?: string
    category?: string
    tone?: string
    is_premium?: boolean
    is_featured?: boolean
  }) => http.post<{ template: Template; report?: { sections?: string[] } }>('/admin/ai/generate-template', body),
  blocks: () => http.get<AdminBlockCatalog>('/admin/blocks'),
  blockPresets: () => http.get<BlockPreset[]>('/admin/block-presets'),
  updateBlockPreset: (id: number, body: { name?: string; is_active?: boolean; is_featured?: boolean }) =>
    http.patch<BlockPreset>(`/admin/block-presets/${id}`, body),
  deleteBlockPreset: (id: number) => http.delete(`/admin/block-presets/${id}`),
  generateBlock: (body: {
    prompt: string
    name?: string
    description?: string
    type?: string
    tone?: string
    is_featured?: boolean
  }) => http.post<{ preset: BlockPreset; report?: { sections?: string[] } }>('/admin/ai/generate-block', body),
  plans: () => http.get<Plan[]>('/admin/plans'),
  /**
   * Plans together with the limit schema the server sent alongside them, so
   * the editor renders the limits this deployment actually knows about.
   */
  plansWithSchema: async (): Promise<{ plans: Plan[]; schema: PlanLimitSchema }> => {
    const res = await apiPaginated<Plan>('/admin/plans')
    const meta = res.meta as { limit_schema?: PlanLimitSchema } | undefined

    return { plans: res.data, schema: meta?.limit_schema ?? {} }
  },
  createPlan: (body: Record<string, unknown>) => http.post<Plan>('/admin/plans', body),
  updatePlan: (id: number, body: Record<string, unknown>) => http.patch<Plan>(`/admin/plans/${id}`, body),
  deletePlan: (id: number) => http.delete<{ deleted: boolean }>(`/admin/plans/${id}`),
  subscriptions: (params?: { page?: number; q?: string }) =>
    apiPaginated<AdminSubscription>(`/admin/subscriptions${queryString({ ...params })}`),
  storage: (params?: { page?: number; q?: string }) =>
    apiPaginated<AdminStorageRow>(`/admin/storage${queryString({ ...params })}`),
  storageSettings: () => http.get<AdminStorageSettings>('/admin/storage-settings'),
  updateStorageSettings: (body: Record<string, unknown>) =>
    http.put<AdminStorageSettings>('/admin/storage-settings', body),
  testStorageSettings: () =>
    http.post<{ ok: boolean; message?: string; status?: AdminStorageSettings }>('/admin/storage-settings/test'),
  cloudflare: () => http.get<AdminCloudflareSettings>('/admin/cloudflare'),
  updateCloudflare: (body: Record<string, unknown>) => http.put<AdminCloudflareSettings>('/admin/cloudflare', body),
  testCloudflare: () =>
    http.post<{ ok: boolean; message?: string; status?: AdminCloudflareSettings }>('/admin/cloudflare/test'),
  cloudflareApexAddresses: (refresh = false) =>
    http.get<CloudflareApexAddresses>(`/admin/cloudflare/apex-addresses${refresh ? '?refresh=1' : ''}`),
  cloudflareFallbackOrigin: () => http.get<CloudflareFallbackOrigin>('/admin/cloudflare/fallback-origin'),
  syncCloudflareFallbackOrigin: () =>
    http.post<{
      ok: boolean
      message?: string
      fallback?: CloudflareFallbackOrigin | null
      status?: AdminCloudflareSettings
    }>('/admin/cloudflare/fallback-origin'),
  paymentGateway: () => http.get<AdminPaymentGatewaySettings>('/admin/payment-gateway'),
  updatePaymentGateway: (body: Record<string, unknown>) =>
    http.put<AdminPaymentGatewaySettings>('/admin/payment-gateway', body),
  testPaymentGateway: () =>
    http.post<{ ok: boolean; message?: string; status?: AdminPaymentGatewaySettings }>('/admin/payment-gateway/test'),
  googleAuth: () => http.get<AdminGoogleAuthSettings>('/admin/google-auth'),
  updateGoogleAuth: (body: Record<string, unknown>) =>
    http.put<AdminGoogleAuthSettings>('/admin/google-auth', body),
  testGoogleAuth: () =>
    http.post<{ ok: boolean; message?: string; status?: AdminGoogleAuthSettings }>('/admin/google-auth/test'),
  forms: (params?: { page?: number; q?: string }) => apiPaginated<AdminFormRow>(`/admin/forms${queryString({ ...params })}`),
  aiSettings: () => http.get<AdminAiSettings>('/admin/ai-settings'),
  updateAiSettings: (body: Record<string, unknown>) => http.put<AdminAiSettings>('/admin/ai-settings', body),
  testAiSettings: () => http.post<{ ok: boolean; message?: string; status?: AdminAiSettings }>('/admin/ai-settings/test'),
  activities: (params?: { action?: string; q?: string; workspace_id?: number; page?: number }) =>
    apiPaginated<Activity>(`/admin/activities${queryString({ ...params })}`),
  jobs: () => http.get<{ pending: AdminJob[]; failed: FailedJob[] }>('/admin/jobs'),
  retryFailedJob: (id: number) => http.post(`/admin/failed-jobs/${id}/retry`),
  suspendSite: (id: number) => http.post(`/admin/sites/${id}/suspend`),
  suspendWorkspace: (id: number) => http.post(`/admin/workspaces/${id}/suspend`),
  lookupDomain: (hostname: string) =>
    http.get<DomainLookup>(`/admin/domains/lookup?hostname=${encodeURIComponent(hostname)}`),
  health: () => http.get<AdminHealth>('/admin/health'),
  diagnostics: (params?: { host?: string; site_id?: number }) =>
    http.get<AdminDiagnostics>(`/admin/diagnostics${queryString({ ...params })}`),
  diagnoseHost: (host: string) =>
    http.get<AdminHostDiagnosis>(`/admin/diagnostics/host?host=${encodeURIComponent(host)}`),
  settings: () => http.get<AdminSettings>('/admin/settings'),
  updateSettings: (body: Partial<AdminSettings>) => http.put<AdminSettings>('/admin/settings', body),
  mailSettings: () => http.get<AdminMailSettings>('/admin/mail-settings'),
  updateMailSettings: (body: Record<string, unknown>) => http.put<AdminMailSettings>('/admin/mail-settings', body),
  testMailSettings: (to: string) =>
    http.post<{ ok: boolean; message?: string; status?: AdminMailSettings }>('/admin/mail-settings/test', { to }),
  branding: () => http.get<PlatformBranding>('/admin/branding'),
  uploadLogo: (file: File, variant: 'light' | 'dark' = 'light') => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('variant', variant)
    return http.upload<PlatformBranding>('/admin/branding/logo', fd)
  },
  clearLogo: (variant: 'light' | 'dark' = 'light') =>
    http.delete<PlatformBranding>(`/admin/branding/logo?variant=${variant}`),
}

export type AdminMailSettings = {
  transport: 'smtp' | 'log' | 'array' | string
  host: string | null
  port: number
  encryption: 'tls' | 'ssl' | 'none' | string
  username: string | null
  from_address: string | null
  from_name: string | null
  timeout: number
  /** The password itself is never returned - only whether one exists. */
  password_set: boolean
  password_source: 'database' | 'env' | 'none' | string
  configured: boolean
  last_tested_at?: string | null
  last_test_status?: string | null
  last_test_message?: string | null
}

export type PlatformBranding = {
  platform_name: string
  platform_tagline: string
  logo_url: string | null
  logo_dark_url: string | null
  platform_domain?: string
}

/** Readable before sign-in, so the login screen can render the brand. */
export const brandingApi = {
  get: () => http.get<PlatformBranding>('/public/branding'),
}

export type AdminStats = {
  users?: number
  workspaces?: number
  sites?: number
  domains?: number
  templates?: number
  forms?: number
  subscriptions?: number
  pending_jobs?: number
  failed_jobs?: number
  stripe?: { configured?: boolean; publishable_key?: boolean; webhook_configured?: boolean }
}

export type FailedJob = {
  id: number
  uuid?: string
  queue?: string
  payload?: string
  exception?: string
  failed_at?: string
  name?: string
}

export type AdminJob = {
  id: number
  queue?: string
  attempts?: number
  available_at?: number
  created_at?: number
  name?: string
  payload?: string
}

export type DomainLookup = Domain & {
  site?: { id: number; name: string; status: string; workspace_id: number } | null
  workspace?: { id: number; name: string; slug: string; status?: string } | null
  owner?: { id: number; name: string; email: string } | null
}

export type AdminBlock = {
  type: string
  label: string
  category: string
  version: number
}

export type AdminBlockCatalog = {
  loaded: boolean
  categories: string[]
  blocks: AdminBlock[]
}

export type AdminSubscription = {
  id: number
  workspace_id: number
  plan_id?: number
  status?: string | null
  provider?: string | null
  interval?: string | null
  current_period_end?: string | null
  cancel_at_period_end?: boolean
  workspace?: { id: number; name: string; slug: string; status?: string } | null
  plan?: { id: number; slug: string; name: string } | null
}

export type AdminStorageRow = {
  id: number
  name: string
  slug: string
  status?: string
  bytes: number
  mb: number
  limit_mb?: number | null
  plan?: { id: number; slug: string; name: string } | null
}

export type AdminFormRow = {
  id: number
  name: string
  slug?: string
  type?: string
  site_id?: number
  workspace_id?: number
  submissions_count?: number
  site?: { id: number; name: string } | null
  workspace?: { id: number; name: string } | null
}

export type AdminHealth = {
  live?: { status?: string; path?: string }
  ready?: { status?: string; path?: string; checks?: { database?: boolean; redis?: boolean } }
  queue?: { pending?: number; failed?: number }
}

export type AdminSettings = {
  platform_name: string
  platform_tagline: string
  support_email: string
  platform_domain: string
  funnels_enabled: boolean
  funnel_events_retention_days: number
  funnel_sessions_retention_days: number
}

export type AdminAiModelOption = {
  id: string
  label: string
}

export type AdminAiSettings = {
  enabled: boolean
  configured: boolean
  provider: string
  providers: string[]
  model: string | null
  models?: Record<string, AdminAiModelOption[]>
  base_url: string | null
  max_tokens: number | null
  temperature: number | null
  key_source: 'settings' | 'env' | 'none' | string
  key_hint: string | null
  env_key_present: boolean
  catalog_blocks: number
  last_tested_at: string | null
  last_test_status: string | null
  last_test_message: string | null
}

export type AdminStorageSettings = {
  provider: string
  providers: string[]
  provider_labels?: Record<string, string>
  configured: boolean
  bucket: string | null
  region: string | null
  endpoint: string | null
  public_url: string | null
  root: string | null
  use_path_style_endpoint: boolean
  disk: string
  key_source: 'settings' | 'env' | 'none' | string
  key_hint: string | null
  env_key_present: boolean
  regions?: Record<string, string[]>
  last_tested_at: string | null
  last_test_status: string | null
  last_test_message: string | null
}

export type AdminGoogleAuthSettings = {
  enabled: boolean
  configured: boolean
  client_id: string | null
  client_id_source: 'settings' | 'env' | 'none' | string
  client_id_hint: string | null
  client_secret_source: 'settings' | 'env' | 'none' | string
  client_secret_hint: string | null
  client_secret_configured: boolean
  redirect_uri: string
  redirect_source: 'settings' | 'env' | 'none' | string
  default_redirect_uri: string
  allow_registration: boolean
  allowed_domains: string
  prompt: string
  prompts: string[]
  console_url: string
  env_client_id_present: boolean
  env_client_secret_present: boolean
  last_tested_at: string | null
  last_test_status: string | null
  last_test_message: string | null
}

export type SettingSource = 'settings' | 'env' | 'none' | 'fallback_origin' | string

export type AdminCloudflareSettings = {
  enabled: boolean
  enabled_source: SettingSource
  configured: boolean
  provider: string
  live: boolean
  api_token_configured: boolean
  api_token_source: SettingSource
  api_token_hint: string | null
  webhook_secret_configured: boolean
  webhook_secret_source: SettingSource
  webhook_secret_hint: string | null
  zone_id: string | null
  zone_id_source: SettingSource
  account_id: string | null
  account_id_source: SettingSource
  fallback_origin: string | null
  fallback_origin_source: SettingSource
  cname_target: string | null
  cname_target_source: SettingSource
  apex_ips: string
  apex_ips_source: SettingSource
  apex_addresses: CloudflareApexAddresses
  ssl_validation: string
  ssl_validations: string[]
  min_tls_version: string
  tls_versions: string[]
  env: {
    saas_enabled: boolean
    api_token: boolean
    zone_id: boolean
    account_id: boolean
    fallback_origin: boolean
    cname_target: boolean
    webhook_secret: boolean
  }
  dashboard_url: string
  last_tested_at: string | null
  last_test_status: string | null
  last_test_message: string | null
  fallback_synced_at: string | null
  fallback_status: string | null
  fallback_message: string | null
}

export type AdminDiagnostics = {
  ok: boolean
  api_url: string
  renderer_url: string
  platform_domain: string
  summary: string
  checks: Array<{ key: string; label: string; ok: boolean; detail: string }>
}

export type AdminHostDiagnosis = {
  host: string
  platform_domain: string
  is_platform_subdomain: boolean
  resolves: boolean
  domain: { id: number; hostname: string; type: string; status: string; is_primary: boolean; ssl_status: string | null } | null
  site: { id: number; name: string; status: string; workspace_id: number } | null
  suggestions: string[]
  notes: string[]
}

export type CloudflareApexAddresses = {
  ipv4: string[]
  ipv6: string[]
  /** 'configured' = admin/env override, 'resolved' = looked up from the CNAME target. */
  source: 'configured' | 'resolved' | 'none' | string
  target: string | null
}

export type CloudflareFallbackOrigin = {
  configured: boolean
  origin: string | null
  status: string | null
  expected: string | null
  matches: boolean
  errors: string[]
}

export type AdminPaymentGatewaySettings = {
  enabled: boolean
  configured: boolean
  provider: string
  providers: string[]
  mode: 'test' | 'live' | string
  publishable_key: string | null
  publishable_source: 'settings' | 'env' | 'none' | string
  publishable_hint: string | null
  secret_source: 'settings' | 'env' | 'none' | string
  secret_hint: string | null
  webhook_source: 'settings' | 'env' | 'none' | string
  webhook_hint: string | null
  webhook_configured: boolean
  webhook_url: string
  env_secret_present: boolean
  last_tested_at: string | null
  last_test_status: string | null
  last_test_message: string | null
}
