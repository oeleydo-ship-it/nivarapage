import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Page } from '@uidesired/types'
import { MediaPicker } from '../components/MediaLibrary'
import { SiteSubnav } from '../components/SiteChrome'
import { pagesApi, sitesApi } from '../lib/endpoints'
import { Button, Card, Input, Label, PageHeader } from '../ui/primitives'

const ROBOTS = [
  { value: 'index', label: 'Index (allow search engines)' },
  { value: 'noindex', label: 'Noindex (hide from search)' },
  { value: 'none', label: 'None (noindex, nofollow)' },
] as const

export function SiteSeoPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const { data: site } = useQuery({ queryKey: ['site', id], queryFn: () => sitesApi.get(id!), enabled: Boolean(id) })
  const { data: settings } = useQuery({ queryKey: ['settings', id], queryFn: () => sitesApi.settings(id!), enabled: Boolean(id) })
  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [description, setDescription] = useState('')
  const [favicon, setFavicon] = useState('')
  const [social, setSocial] = useState('')
  const [robots, setRobots] = useState('index')

  useEffect(() => {
    if (!site) return
    setName(site.name)
    setBusiness(site.business_name || '')
  }, [site?.id])

  useEffect(() => {
    if (!settings) return
    setDescription(settings.default_description || '')
    setFavicon(settings.favicon || '')
    setSocial(settings.social_image || '')
    setRobots(settings.robots || 'index')
  }, [settings])

  const save = useMutation({
    mutationFn: async () => {
      await sitesApi.update(id!, { name, business_name: business || null })
      await sitesApi.updateSettings(id!, {
        default_description: description,
        favicon,
        social_image: social,
        robots,
        locale: settings?.locale || 'en',
        redirect_secondary_to_primary: settings?.redirect_secondary_to_primary ?? true,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['site', id] })
      qc.invalidateQueries({ queryKey: ['settings', id] })
    },
  })

  return (
    <div>
      <PageHeader
        title="SEO"
        description="Default titles, descriptions, and crawl rules for this website."
        actions={
          <Link to={`/sites/${id}/builder`} className="text-sm text-blue-400">
            Page SEO in builder
          </Link>
        }
      />
      <SiteSubnav />
      <Card className="max-w-xl space-y-4">
        <div>
          <Label>Site name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Business name</Label>
          <Input value={business} onChange={(e) => setBusiness(e.target.value)} />
        </div>
        <div>
          <Label>Default description</Label>
          <textarea
            className="h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={320}
          />
        </div>
        <div>
          <Label>Favicon</Label>
          <MediaPicker value={favicon} onChange={setFavicon} siteId={id} />
        </div>
        <div>
          <Label>Social image</Label>
          <MediaPicker value={social} onChange={setSocial} siteId={id} />
        </div>
        <div>
          <Label>Robots</Label>
          <select
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
            value={robots}
            onChange={(e) => setRobots(e.target.value)}
          >
            {ROBOTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Save SEO
        </Button>
        {save.isSuccess ? <p className="text-sm text-emerald-400">Saved.</p> : null}
      </Card>
    </div>
  )
}

export function PageSeoFields({
  page,
  siteId,
  onSaved,
}: {
  page: Page
  siteId?: string | number
  onSaved?: () => void
}) {
  const [seoTitle, setSeoTitle] = useState(page.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(page.seo_description || '')
  const [canonical, setCanonical] = useState(page.canonical_url || '')
  const [ogTitle, setOgTitle] = useState(page.og_title || '')
  const [ogDescription, setOgDescription] = useState(page.og_description || '')
  const [ogImage, setOgImage] = useState(page.og_image || page.seo_image || '')
  const [indexable, setIndexable] = useState(page.robots_index !== false)

  useEffect(() => {
    setSeoTitle(page.seo_title || '')
    setSeoDescription(page.seo_description || '')
    setCanonical(page.canonical_url || '')
    setOgTitle(page.og_title || '')
    setOgDescription(page.og_description || '')
    setOgImage(page.og_image || page.seo_image || '')
    setIndexable(page.robots_index !== false)
  }, [page.id])

  const save = useMutation({
    mutationFn: () =>
      pagesApi.update(page.id, {
        seo_title: seoTitle || null,
        seo_description: seoDescription || null,
        canonical_url: canonical || null,
        og_title: ogTitle || null,
        og_description: ogDescription || null,
        og_image: ogImage || null,
        seo_image: ogImage || null,
        robots_index: indexable,
      }),
    onSuccess: () => onSaved?.(),
  })

  return (
    <div className="space-y-3">
      <div>
        <Label>SEO title</Label>
        <Input value={seoTitle} maxLength={70} onChange={(e) => setSeoTitle(e.target.value)} placeholder={page.name} />
        <p className="mt-1 text-[11px] text-zinc-500">{seoTitle.length}/70</p>
      </div>
      <div>
        <Label>Meta description</Label>
        <textarea
          className="h-20 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          maxLength={320}
          value={seoDescription}
          onChange={(e) => setSeoDescription(e.target.value)}
        />
      </div>
      <div>
        <Label>Canonical URL</Label>
        <Input value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder="Leave blank to use the primary domain" />
      </div>
      <div>
        <Label>OG title</Label>
        <Input value={ogTitle} maxLength={70} onChange={(e) => setOgTitle(e.target.value)} />
      </div>
      <div>
        <Label>OG description</Label>
        <textarea
          className="h-20 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
          maxLength={320}
          value={ogDescription}
          onChange={(e) => setOgDescription(e.target.value)}
        />
      </div>
      <div>
        <Label>OG image</Label>
        <MediaPicker value={ogImage} onChange={setOgImage} siteId={siteId} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={indexable} onChange={(e) => setIndexable(e.target.checked)} />
        Index this page
      </label>
      <Button onClick={() => save.mutate()} disabled={save.isPending}>
        Save page SEO
      </Button>
    </div>
  )
}
