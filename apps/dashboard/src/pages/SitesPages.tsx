import { SITE_CATEGORIES, type Site, type Template } from '@uidesired/types'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, Globe, LayoutGrid, List, Loader2, Plus, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { SiteCard, SiteCardSkeleton, type SiteCardLayout } from '../components/SiteCard'
import { TEMPLATE_PREVIEW_HEIGHT, TemplateLivePreview, TemplatePreviewAssets } from '../components/TemplatePreview'
import { TemplateSearchBar } from '../components/TemplateSearchBar'
import { TemplateSelectModal } from '../components/TemplateSelectModal'
import { templatePreviewPath } from '../lib/templatePreview'
import { sitesApi, subdomainsApi, templatesApi } from '../lib/endpoints'
import { atCap, featureEnabled, useSubscription } from '../lib/plan'
import { blankTemplateMatches, filterTemplates, templateCategoryNames } from '../lib/templateSearch'
import { Button, Card, EmptyState, Input, Label, PageHeader, Select } from '../ui/primitives'

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'disabled', label: 'Disabled' },
] as const

const CREATE_STEPS = ['Details', 'Template', 'Domain', 'Review'] as const

function slugifySubdomain(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32)
}

const TEMPLATE_SITE_CATEGORY: Record<string, string> = {
  barber: 'Personal',
  restaurant: 'Restaurant',
  business: 'Business',
  saas: 'SaaS',
  agency: 'Agency',
  portfolio: 'Portfolio',
  construction: 'Construction',
  realty: 'Real Estate',
  clinic: 'Medical',
    halewren: 'Consulting',
    'axiom-north': 'Consulting',
    aitool: 'SaaS',
    inkline: 'SaaS',
    brightline: 'Agency',
}

function siteCategoryForTemplate(template: Pick<Template, 'slug' | 'category'>): string | null {
  const fromCategory = template.category?.name
  if (fromCategory && (SITE_CATEGORIES as readonly string[]).includes(fromCategory)) {
    return fromCategory
  }
  return TEMPLATE_SITE_CATEGORY[template.slug] ?? null
}

const SITES_VIEW_KEY = 'uidesired.sites.view'

function readSitesView(): SiteCardLayout {
  try {
    return window.localStorage.getItem(SITES_VIEW_KEY) === 'grid' ? 'grid' : 'list'
  } catch {
    return 'list'
  }
}

export function SitesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['value']>('all')
  const [view, setView] = useState<SiteCardLayout>(() => (typeof window === 'undefined' ? 'list' : readSitesView()))
  const sitesQuery = useQuery({ queryKey: ['sites'], queryFn: sitesApi.list })
  const sub = useSubscription()
  const sites = sitesQuery.data || []
  const sitesCapped = atCap(sub.data?.usage?.number_of_sites)
  const createAction = sitesCapped ? (
    <span title="Upgrade to create more websites">
      <Button disabled>
        <Plus size={16} />
        Create website
      </Button>
    </span>
  ) : (
    <Link to="/sites/new">
      <Button>
        <Plus size={16} />
        Create website
      </Button>
    </Link>
  )

  const publishedCount = sites.filter((site) => site.status === 'published' && !site.deleted_at).length
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return sites.filter((site) => {
      if (status !== 'all' && site.status !== status) return false
      if (!q) return true
      const host = site.domains?.map((d) => d.hostname).join(' ') || ''
      return [site.name, site.business_name, site.category, site.slug, host].some((value) =>
        (value || '').toLowerCase().includes(q),
      )
    })
  }, [sites, search, status])

  const description = sitesQuery.isPending
    ? 'Loading your websites…'
    : `${sites.length} website${sites.length === 1 ? '' : 's'} · ${publishedCount} published`

  useEffect(() => {
    try {
      window.localStorage.setItem(SITES_VIEW_KEY, view)
    } catch {
      /* ignore quota / private mode */
    }
  }, [view])

  return (
    <div>
      <PageHeader
        title="Websites"
        description={description}
        actions={createAction}
      />

      {sitesQuery.isError ? (
        <Card className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-medium text-white">Couldn’t load websites</div>
            <p className="mt-1 text-sm text-zinc-500">
              {sitesQuery.error instanceof Error ? sitesQuery.error.message : 'Something went wrong.'}
            </p>
          </div>
          <Button variant="outline" onClick={() => sitesQuery.refetch()}>
            Try again
          </Button>
        </Card>
      ) : null}

      {!sitesQuery.isError ? (
        <>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative min-w-0 flex-1">
              <Search size={15} className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-zinc-500" />
              <input
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-2 pr-3 pl-9 text-sm text-zinc-100 outline-none focus:border-blue-500"
                placeholder="Search by name, host, or category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search websites"
              />
            </div>
            <div className="flex gap-3">
              <Select
                className="min-w-0 flex-1 sm:w-44"
                value={status}
                aria-label="Filter by status"
                onChange={(e) => setStatus(e.target.value as typeof status)}
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <div className="flex shrink-0 rounded-lg border border-zinc-800 p-0.5" role="group" aria-label="Website layout">
                <button
                  type="button"
                  className={`rounded-md p-2 ${view === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  onClick={() => setView('grid')}
                  aria-pressed={view === 'grid'}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  type="button"
                  className={`rounded-md p-2 ${view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                  onClick={() => setView('list')}
                  aria-pressed={view === 'list'}
                  aria-label="List view"
                  title="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {sitesQuery.isPending ? (
            <div className={view === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
              {Array.from({ length: view === 'list' ? 8 : 6 }).map((_, i) => (
                <SiteCardSkeleton key={i} layout={view} />
              ))}
            </div>
          ) : null}

          {!sitesQuery.isPending && sites.length === 0 ? (
            <Card className="px-6 py-16">
              <EmptyState
                title="No websites yet"
                description="Create your first site to open the visual builder, connect a domain, and publish."
                icon={<EmptySitesIllustration />}
              >
                <Link to="/sites/new">
                  <Button>
                    <Plus size={16} />
                    Create website
                  </Button>
                </Link>
              </EmptyState>
            </Card>
          ) : null}

          {!sitesQuery.isPending && sites.length > 0 && filtered.length === 0 ? (
            <Card className="px-6 py-12">
              <EmptyState
                title="No matching websites"
                description="Try a different name, hostname, or status filter."
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch('')
                    setStatus('all')
                  }}
                >
                  Clear filters
                </Button>
              </EmptyState>
            </Card>
          ) : null}

          {!sitesQuery.isPending && filtered.length > 0 ? (
            <div className={view === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
              {filtered.map((site: Site) => (
                <SiteCard key={site.id} site={site} layout={view} />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}

function EmptySitesIllustration() {
  return (
    <div className="flex h-24 items-end justify-center gap-2" aria-hidden>
      <div className="h-14 w-16 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/80" />
      <div className="flex h-20 w-[5.5rem] flex-col overflow-hidden rounded-xl border border-blue-800/50 bg-blue-950/30">
        <div className="flex gap-1 border-b border-blue-900/40 px-2 py-1">
          <span className="size-1 rounded-full bg-zinc-600" />
          <span className="size-1 rounded-full bg-zinc-600" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <Globe size={18} className="text-blue-400/70" />
        </div>
      </div>
      <div className="h-12 w-14 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/80" />
    </div>
  )
}

export function CreateSitePage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const presetSlug = params.get('template')?.trim() || ''
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [business_name, setBusiness] = useState('')
  const [category, setCategory] = useState('Business')
  const [description, setDescription] = useState('')
  const [template_id, setTemplate] = useState<number | null>(null)
  const [confirmingTemplate, setConfirmingTemplate] = useState(false)
  const [templateQuery, setTemplateQuery] = useState('')
  const [templateCategory, setTemplateCategory] = useState('all')
  const [subdomain, setSubdomain] = useState('')
  const [subdomainTouched, setSubdomainTouched] = useState(false)
  const [check, setCheck] = useState<{ available?: boolean; name?: string } | null>(null)
  const [checking, setChecking] = useState(false)
  const templates = useQuery({ queryKey: ['templates'], queryFn: templatesApi.list })
  const sub = useSubscription()
  const sitesCapped = atCap(sub.data?.usage?.number_of_sites)
  const premiumOk = featureEnabled(sub.data?.usage?.premium_templates)

  useEffect(() => {
    if (!presetSlug || !templates.data?.length || template_id !== null) return
    const match = templates.data.find((item) => item.slug === presetSlug)
    if (!match) return
    setTemplate(match.id)
    const nextCategory = siteCategoryForTemplate(match)
    if (nextCategory) setCategory(nextCategory)
    if (!name.trim()) setName(match.name)
    setStep(2)
  }, [presetSlug, templates.data, template_id, name])

  const create = useMutation({
    mutationFn: async () => {
      // Resolve the preset again at submit time so a delayed template query or
      // an intermediate wizard render cannot silently fall back to blank.
      const presetTemplateId = presetSlug
        ? templates.data?.find((item) => item.slug === presetSlug)?.id
        : undefined
      const selectedTemplateId = template_id ?? presetTemplateId
      const site = await sitesApi.create({
        name,
        business_name,
        category,
        description,
        subdomain: subdomain || undefined,
        template_id: selectedTemplateId || undefined,
      })

      // Applying is idempotent: existing slugs are updated, missing template
      // pages are created. This is an explicit import guarantee before the
      // builder opens, even if site creation returned after a blank fallback.
      if (selectedTemplateId) {
        return sitesApi.applyTemplate(site.id, selectedTemplateId)
      }
      return site
    },
    onSuccess: (site) => navigate(`/sites/${site.id}/builder`),
  })

  useEffect(() => {
    if (step === 3 && !subdomainTouched && name) setSubdomain(slugifySubdomain(name))
  }, [step, name, subdomainTouched])

  useEffect(() => {
    if (step !== 3) return
    const value = subdomain.trim()
    if (value.length < 3) {
      setCheck(null)
      setChecking(false)
      return
    }
    setChecking(true)
    const timer = window.setTimeout(async () => {
      try {
        setCheck(await subdomainsApi.check(value))
      } catch {
        setCheck(null)
      } finally {
        setChecking(false)
      }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [subdomain, step])

  useEffect(() => {
    if (step !== 2) setConfirmingTemplate(false)
  }, [step])

  const selectedTemplate = (templates.data || []).find((t) => t.id === template_id)
  const templateList = templates.data || []
  const templateCategories = useMemo(() => templateCategoryNames(templateList), [templateList])
  const visibleTemplates = useMemo(
    () => filterTemplates(templateList, templateQuery, templateCategory),
    [templateList, templateQuery, templateCategory],
  )
  const showBlank = blankTemplateMatches(templateQuery, templateCategory)

  function pickTemplate(id: number | null) {
    setTemplate(id)
    if (id !== null) {
      const picked = templateList.find((item) => item.id === id)
      const nextCategory = picked ? siteCategoryForTemplate(picked) : null
      if (nextCategory) setCategory(nextCategory)
    }
    setConfirmingTemplate(true)
  }
  const subdomainOk = !subdomain || (check?.available && !checking)
  const canContinue =
    (step === 1 && Boolean(name.trim())) ||
    step === 2 ||
    (step === 3 && subdomainOk) ||
    (step === 4 && !create.isPending)

  return (
    <div>
      <TemplatePreviewAssets />
      <PageHeader
        title="Create website"
        description="Four quick steps — then you’ll land in the visual builder."
        actions={
          <Link to="/sites">
            <Button variant="ghost">
              <ArrowLeft size={15} />
              Back to websites
            </Button>
          </Link>
        }
      />

      <ol className="mb-8 flex flex-wrap gap-2">
        {CREATE_STEPS.map((label, index) => {
          const n = index + 1
          const active = step === n
          const done = step > n
          return (
            <li key={label} className="flex items-center gap-2">
              <button
                type="button"
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                  active
                    ? 'border-blue-500/50 bg-blue-600/15 text-blue-200'
                    : done
                      ? 'border-zinc-700 bg-zinc-900 text-zinc-300'
                      : 'border-zinc-800 text-zinc-500'
                }`}
                onClick={() => {
                  if (n < step || (n === 2 && name.trim()) || (n === 3 && name.trim()) || (n === 4 && name.trim() && subdomainOk)) {
                    setStep(n)
                  }
                }}
              >
                <span
                  className={`flex size-5 items-center justify-center rounded-full text-[11px] ${
                    done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {done ? <Check size={11} /> : n}
                </span>
                {label}
              </button>
              {index < CREATE_STEPS.length - 1 ? <span className="hidden h-px w-6 bg-zinc-800 sm:block" /> : null}
            </li>
          )
        })}
      </ol>

      {step === 1 && (
        <Card className="max-w-xl space-y-4">
          <div>
            <Label>Website name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Demo Studio" autoFocus />
          </div>
          <div>
            <Label>Business name</Label>
            <Input value={business_name} onChange={(e) => setBusiness(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <Label>Category</Label>
            <Select className="w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
              {SITE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this site is for" />
          </div>
          <div className="flex justify-end">
            <Button disabled={!canContinue} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <TemplateSearchBar
            query={templateQuery}
            onQueryChange={setTemplateQuery}
            category={templateCategory}
            onCategoryChange={setTemplateCategory}
            categories={templateCategories}
            autoFocus
          />
          {!showBlank && visibleTemplates.length === 0 ? (
            <Card className="px-6 py-12">
              <EmptyState
                title="No matching templates"
                description="Try a different name, category, or description."
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setTemplateQuery('')
                    setTemplateCategory('all')
                  }}
                >
                  Clear search
                </Button>
              </EmptyState>
            </Card>
          ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {showBlank ? (
            <button type="button" onClick={() => pickTemplate(null)} className="text-left">
              <Card padded={false} className={`h-full overflow-hidden transition ${template_id === null ? 'ring-2 ring-blue-500' : 'hover:border-zinc-700'}`}>
                <div
                  className="flex items-center justify-center border-b border-dashed border-zinc-700 bg-zinc-950/60 text-zinc-500"
                  style={{ height: TEMPLATE_PREVIEW_HEIGHT }}
                >
                  Blank canvas
                </div>
                <div className="px-5 pb-5 pt-4">
                  <div className="font-medium text-white">Start blank</div>
                  <p className="mt-1 text-sm text-zinc-500">Empty homepage, then add sections.</p>
                </div>
              </Card>
            </button>
            ) : null}
            {visibleTemplates.map((t) => {
              const locked = Boolean(t.is_premium) && !premiumOk
              return (
              <div
                key={t.id}
                role="button"
                tabIndex={locked ? -1 : 0}
                aria-disabled={locked}
                title={locked ? 'Upgrade to use premium templates' : undefined}
                onClick={() => {
                  if (locked) return
                  pickTemplate(t.id)
                }}
                onKeyDown={(event) => {
                  if (locked) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.currentTarget.click()
                  }
                }}
                className={`text-left ${locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
              >
                <Card padded={false} className={`h-full overflow-hidden transition ${template_id === t.id ? 'ring-2 ring-blue-500' : 'hover:border-zinc-700'}`}>
                  <div className="relative">
                    <TemplateLivePreview template={t} />
                    <a
                      href={templatePreviewPath(t.slug)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="absolute right-3 top-3 rounded-full bg-zinc-950/80 px-3 py-1 text-xs font-medium text-white hover:bg-zinc-900"
                    >
                      Preview
                    </a>
                  </div>
                  <div className="px-5 pb-5 pt-4">
                    <div className="font-medium text-white">{t.name}</div>
                    <p className="mt-1 text-sm text-zinc-500">{t.description || 'Starter layout'}</p>
                    {t.is_premium ? <div className="mt-2 text-xs text-amber-400">{locked ? 'Premium · upgrade required' : 'Premium'}</div> : null}
                    {t.category ? <div className="mt-2 text-xs text-zinc-500">{t.category.name}</div> : null}
                  </div>
                </Card>
              </div>
              )
            })}
          </div>
          )}
          {templates.isError ? <p className="text-sm text-red-400">Couldn’t load templates. You can still start blank.</p> : null}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Continue</Button>
          </div>
          <TemplateSelectModal
            open={confirmingTemplate}
            template={selectedTemplate ?? null}
            onClose={() => setConfirmingTemplate(false)}
            onContinue={() => {
              setConfirmingTemplate(false)
              setStep(3)
            }}
          />
        </div>
      )}

      {step === 3 && (
        <Card className="max-w-xl space-y-4">
          <div>
            <Label>Subdomain</Label>
            <div className="flex items-center gap-2">
              <Input
                value={subdomain}
                placeholder="demo"
                onChange={(e) => {
                  setSubdomainTouched(true)
                  setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                }}
              />
              <span className="shrink-0 text-sm text-zinc-500">.sites.localhost</span>
            </div>
            <p className="mt-2 text-xs text-zinc-500">Leave blank to auto-assign from the site name. At least 3 characters to check availability.</p>
            {checking ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                <Loader2 size={12} className="animate-spin" /> Checking availability…
              </p>
            ) : null}
            {!checking && subdomain.trim().length >= 3 && check ? (
              <p className={`mt-2 text-xs ${check.available ? 'text-emerald-400' : 'text-red-400'}`}>
                {check.available ? `${subdomain} is available` : `${subdomain} is already taken`}
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button disabled={!subdomainOk} onClick={() => setStep(4)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card className="max-w-xl space-y-4">
          {selectedTemplate ? (
            <div className="overflow-hidden rounded-lg border border-zinc-800">
              <TemplateLivePreview template={selectedTemplate} height={180} />
            </div>
          ) : null}
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
            <dl className="grid grid-cols-[7rem_1fr] gap-y-2">
              <dt className="text-zinc-500">Name</dt>
              <dd className="text-zinc-200">{name}</dd>
              <dt className="text-zinc-500">Business</dt>
              <dd className="text-zinc-200">{business_name || '—'}</dd>
              <dt className="text-zinc-500">Category</dt>
              <dd className="text-zinc-200">{category}</dd>
              <dt className="text-zinc-500">Template</dt>
              <dd className="text-zinc-200">{selectedTemplate?.name || 'Blank'}</dd>
              <dt className="text-zinc-500">Host</dt>
              <dd className="text-zinc-200">{subdomain || 'auto'}.sites.localhost</dd>
            </dl>
          </div>
          {create.isError ? (
            <p className="text-sm text-red-400">{create.error instanceof Error ? create.error.message : 'Could not create website.'}</p>
          ) : null}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(3)} disabled={create.isPending}>
              Back
            </Button>
            <Button disabled={create.isPending || sitesCapped} onClick={() => create.mutate()} title={sitesCapped ? 'Upgrade to create more websites' : undefined}>
              {create.isPending ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Creating…
                </>
              ) : (
                'Create website'
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
