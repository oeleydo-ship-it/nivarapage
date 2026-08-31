import { SITE_CATEGORIES } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Layout,
  Loader2,
  MessageCircle,
  Navigation,
  Newspaper,
  Palette,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MediaPicker } from '../components/MediaLibrary'
import { SiteSubnav } from '../components/SiteChrome'
import { primaryHost, relativeTime, sitePreviewUrl, statusTone } from '../components/SiteCard'
import { ApiError } from '../lib/api'
import { sitesApi } from '../lib/endpoints'
import { Badge, Button, Card, Input, Label, PageHeader, Select } from '../ui/primitives'
import { publishSiteWithRenders } from '@/lib/publishSite'

const textareaClass =
  'w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500'

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'nl', label: 'Dutch' },
  { value: 'ar', label: 'Arabic' },
  { value: 'tr', label: 'Turkish' },
  { value: 'hi', label: 'Hindi' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
]

const ROBOTS = [
  { value: 'index', label: 'Index — allow search engines' },
  { value: 'noindex', label: 'Noindex — hide from search' },
  { value: 'none', label: 'None — noindex and nofollow' },
] as const

const TIMEZONES = (() => {
  try {
    const values = Intl.supportedValuesOf('timeZone')
    if (values.length) return values
  } catch {
    // fall through
  }
  return ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Dubai']
})()

function errorMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message
  return 'Could not save settings.'
}

export function SiteSettingsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const siteQuery = useQuery({ queryKey: ['site', id], queryFn: () => sitesApi.get(id!), enabled: Boolean(id) })
  const settingsQuery = useQuery({
    queryKey: ['settings', id],
    queryFn: () => sitesApi.settings(id!),
    enabled: Boolean(id),
  })

  const site = siteQuery.data
  const settings = settingsQuery.data

  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [favicon, setFavicon] = useState('')
  const [social, setSocial] = useState('')
  const [robots, setRobots] = useState('index')
  const [locale, setLocale] = useState('en')
  const [timezone, setTimezone] = useState('UTC')
  const [redirectSecondary, setRedirectSecondary] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!site) return
    setName(site.name)
    setBusiness(site.business_name || '')
    setCategory(site.category || '')
    setDescription((settings?.default_description || site.description || '').slice(0, 320))
  }, [site, settings])

  useEffect(() => {
    if (!settings) return
    setFavicon(settings.favicon || '')
    setSocial(settings.social_image || '')
    setRobots(settings.robots || 'index')
    setLocale(settings.locale || 'en')
    setTimezone(settings.timezone || 'UTC')
    setRedirectSecondary(settings.redirect_secondary_to_primary ?? true)
  }, [settings])

  const save = useMutation({
    mutationFn: async () => {
      await sitesApi.update(id!, {
        name: name.trim(),
        business_name: business.trim() || null,
        category: category || null,
        description: description.trim() || null,
      })
      await sitesApi.updateSettings(id!, {
        default_description: description.trim() || null,
        favicon: favicon || null,
        social_image: social || null,
        robots,
        locale,
        timezone,
        redirect_secondary_to_primary: redirectSecondary,
      })
    },
    onSuccess: () => {
      setError(null)
      setNotice('Settings saved.')
      qc.invalidateQueries({ queryKey: ['site', id] })
      qc.invalidateQueries({ queryKey: ['settings', id] })
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
    onError: (err: unknown) => {
      setNotice(null)
      setError(errorMessage(err))
    },
  })

  const publish = useMutation({
    mutationFn: () => publishSiteWithRenders(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site', id] })
      qc.invalidateQueries({ queryKey: ['sites'] })
      setNotice('Website published.')
      setError(null)
    },
    onError: (err: unknown) => setError(errorMessage(err)),
  })

  const setStatus = useMutation({
    mutationFn: (status: 'draft' | 'disabled') => sitesApi.update(id!, { status }),
    onSuccess: (updated) => {
      qc.setQueryData(['site', id], updated)
      qc.invalidateQueries({ queryKey: ['sites'] })
      setNotice(updated.status === 'disabled' ? 'Website disabled.' : 'Website unpublished.')
      setError(null)
    },
    onError: (err: unknown) => setError(errorMessage(err)),
  })

  const duplicate = useMutation({
    mutationFn: () => sitesApi.duplicate(id!),
    onSuccess: (copy) => {
      qc.invalidateQueries({ queryKey: ['sites'] })
      navigate(`/sites/${copy.id}/settings`)
    },
    onError: (err: unknown) => setError(errorMessage(err)),
  })

  const remove = useMutation({
    mutationFn: () => sitesApi.remove(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites'] })
      navigate('/sites')
    },
    onError: (err: unknown) => setError(errorMessage(err)),
  })

  const host = site ? primaryHost(site) : '—'
  const liveUrl = sitePreviewUrl(host)
  const created = relativeTime(site?.created_at)
  const categories = useMemo(() => {
    if (category && !SITE_CATEGORIES.includes(category as (typeof SITE_CATEGORIES)[number])) {
      return [category, ...SITE_CATEGORIES]
    }
    return [...SITE_CATEGORIES]
  }, [category])
  const localeOptions = useMemo(() => {
    if (locale && !LOCALES.some((item) => item.value === locale)) {
      return [{ value: locale, label: locale }, ...LOCALES]
    }
    return LOCALES
  }, [locale])

  const loading = siteQuery.isPending || settingsQuery.isPending
  const busy = save.isPending || publish.isPending || setStatus.isPending || duplicate.isPending || remove.isPending

  return (
    <div>
      <PageHeader
        title="Site settings"
        description={site ? `Identity, search, and publishing for ${site.name}.` : 'Load identity, search, and publishing options.'}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/sites">
              <Button variant="ghost">
                <ArrowLeft size={15} />
                Websites
              </Button>
            </Link>
            {liveUrl ? (
              <a href={liveUrl} target="_blank" rel="noreferrer">
                <Button variant="outline">
                  <ExternalLink size={15} />
                  View site
                </Button>
              </a>
            ) : null}
            <Link to={`/sites/${id}/builder`}>
              <Button>
                <Layout size={15} />
                Open builder
              </Button>
            </Link>
          </div>
        }
      />

      <SiteSubnav />

      {siteQuery.isError ? (
        <Card className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium text-white">Couldn’t load this website</div>
            <p className="mt-1 text-sm text-zinc-500">
              {siteQuery.error instanceof Error ? siteQuery.error.message : 'Something went wrong.'}
            </p>
          </div>
          <Button variant="outline" onClick={() => siteQuery.refetch()}>
            Try again
          </Button>
        </Card>
      ) : null}

      {error ? <div className="mb-4 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">{error}</div> : null}
      {notice ? (
        <div className="mb-4 rounded-lg border border-emerald-900 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">{notice}</div>
      ) : null}

      {loading ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <Card className="h-96 animate-pulse bg-zinc-900/40">
            <span className="sr-only">Loading settings</span>
          </Card>
          <Card className="h-64 animate-pulse bg-zinc-900/40">
            <span className="sr-only">Loading sidebar</span>
          </Card>
        </div>
      ) : null}

      {!loading && site ? (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <Card className="space-y-4">
              <div>
                <h2 className="font-medium text-white">Identity</h2>
                <p className="mt-1 text-sm text-zinc-500">Shown in the dashboard, browser tab, and search results.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Website name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Demo Studio" />
                </div>
                <div>
                  <Label>Business name</Label>
                  <Input value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Optional legal or brand name" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select className="w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Unspecified</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <textarea
                    className={`${textareaClass} h-24`}
                    value={description}
                    maxLength={320}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short summary used as the default meta description."
                  />
                  <p className="mt-1 text-[11px] text-zinc-500">{description.length}/320</p>
                </div>
                <div className="sm:col-span-2">
                  <Label>Favicon</Label>
                  <MediaPicker value={favicon} onChange={setFavicon} siteId={id} />
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <div>
                <h2 className="font-medium text-white">Search & sharing</h2>
                <p className="mt-1 text-sm text-zinc-500">Defaults for pages that don’t set their own SEO.</p>
              </div>
              <div>
                <Label>Social image</Label>
                <MediaPicker value={social} onChange={setSocial} siteId={id} />
              </div>
              <div>
                <Label>Search engines</Label>
                <Select className="w-full" value={robots} onChange={(e) => setRobots(e.target.value)}>
                  {ROBOTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
              <Link to={`/sites/${id}/seo`} className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
                <Search size={14} />
                Per-page SEO
              </Link>
            </Card>

            <Card className="space-y-4">
              <div>
                <h2 className="font-medium text-white">Preferences</h2>
                <p className="mt-1 text-sm text-zinc-500">Language, time, and how extra domains behave.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Locale</Label>
                  <Select className="w-full" value={locale} onChange={(e) => setLocale(e.target.value)}>
                    {localeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select className="w-full" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                    {TIMEZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-3 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={redirectSecondary}
                  onChange={(e) => setRedirectSecondary(e.target.checked)}
                />
                <span>
                  <span className="block font-medium text-zinc-200">Redirect extra domains to the primary</span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    Visitors on secondary hostnames are sent to {host === '—' ? 'the primary domain' : host}.
                  </span>
                </span>
              </label>
            </Card>

            <div className="flex flex-wrap items-center gap-3">
              <Button disabled={busy || !name.trim()} onClick={() => save.mutate()}>
                {save.isPending ? <Loader2 size={15} className="animate-spin" /> : null}
                {save.isPending ? 'Saving…' : 'Save settings'}
              </Button>
              {save.isSuccess && !save.isPending ? <span className="text-sm text-emerald-400">Saved</span> : null}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium text-white">Publishing</h2>
                  <p className="mt-1 text-xs text-zinc-500">{created ? `Created ${created}` : 'Not published yet'}</p>
                </div>
                <Badge tone={statusTone(site.status)} className="capitalize">
                  {site.status}
                </Badge>
              </div>
              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 truncate rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-700 hover:text-white"
                >
                  <Globe size={14} className="shrink-0 text-zinc-500" />
                  <span className="truncate">{host}</span>
                  <ExternalLink size={12} className="ml-auto shrink-0 text-zinc-600" />
                </a>
              ) : (
                <p className="text-sm text-zinc-500">No hostname yet.</p>
              )}
              <div className="flex flex-col gap-2">
                {site.status !== 'published' ? (
                  <Button disabled={busy} onClick={() => publish.mutate()}>
                    {publish.isPending ? 'Publishing…' : 'Publish website'}
                  </Button>
                ) : (
                  <Button variant="outline" disabled={busy} onClick={() => setStatus.mutate('draft')}>
                    Unpublish
                  </Button>
                )}
                {site.status !== 'disabled' ? (
                  <Button variant="outline" disabled={busy} onClick={() => setStatus.mutate('disabled')}>
                    Disable website
                  </Button>
                ) : (
                  <Button variant="outline" disabled={busy} onClick={() => setStatus.mutate('draft')}>
                    Re-enable as draft
                  </Button>
                )}
              </div>
            </Card>

            <Card className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium text-white">Domains</h2>
                <Link to={`/sites/${id}/domains`} className="text-xs text-blue-400 hover:text-blue-300">
                  Manage
                </Link>
              </div>
              {(site.domains || []).length ? (
                <ul className="space-y-2">
                  {(site.domains || []).slice(0, 4).map((domain) => (
                    <li key={domain.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-zinc-300">{domain.hostname}</span>
                      <span className="shrink-0 text-xs text-zinc-500">
                        {domain.is_primary ? 'primary' : domain.type}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">Connect a domain to go live on your own hostname.</p>
              )}
            </Card>

            <Card padded={false} className="overflow-hidden">
              <div className="border-b border-zinc-800 px-5 py-4">
                <h2 className="font-medium text-white">More for this site</h2>
              </div>
              <div className="divide-y divide-zinc-800/80">
                {[
                  { to: `/sites/${id}/builder`, label: 'Visual builder', hint: 'Edit pages and blocks', icon: Layout },
                  { to: `/sites/${id}/seo`, label: 'SEO defaults', hint: 'Titles, robots, social cards', icon: Search },
                  { to: `/sites/${id}/theme`, label: 'Theme', hint: 'Colors and fonts', icon: Palette },
                  { to: `/sites/${id}/navigation`, label: 'Navigation', hint: 'Header and footer links', icon: Navigation },
                  { to: `/sites/${id}/forms`, label: 'Forms', hint: 'Contact and lead capture', icon: FileText },
                  { to: `/sites/${id}/livechat`, label: 'Livechat', hint: 'Widget, AI agent, and knowledge', icon: MessageCircle },
                  { to: `/blog?site=${id}`, label: 'Blog', hint: 'Posts that publish on this site', icon: Newspaper },
                  { to: `/sites/${id}/domains`, label: 'Domains', hint: 'Subdomain and custom host', icon: Globe },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-800/40"
                  >
                    <item.icon size={16} className="shrink-0 text-zinc-500" />
                    <span className="min-w-0">
                      <span className="block text-sm text-zinc-200">{item.label}</span>
                      <span className="block text-xs text-zinc-500">{item.hint}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="space-y-3 border-red-950/80">
              <h2 className="font-medium text-white">Danger zone</h2>
              <p className="text-sm text-zinc-500">Duplicate keeps a copy. Delete removes this website from the list.</p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" disabled={busy} onClick={() => duplicate.mutate()}>
                  <Copy size={15} />
                  {duplicate.isPending ? 'Duplicating…' : 'Duplicate website'}
                </Button>
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Delete “${site.name}”? This removes it from your websites list.`)) {
                      remove.mutate()
                    }
                  }}
                >
                  <Trash2 size={15} />
                  {remove.isPending ? 'Deleting…' : 'Delete website'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  )
}
