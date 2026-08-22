import type { Site } from '@uidesired/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Layout,
  MoreHorizontal,
  Navigation,
  Newspaper,
  RotateCcw,
  Search,
  Settings,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sitesApi } from '../lib/endpoints'
import { Badge, Button, Card, type BadgeTone } from '../ui/primitives'

export function primaryHost(site: Site): string {
  const primary = site.domains?.find((d) => d.is_primary) || site.domains?.[0]
  return primary?.hostname || '—'
}

export function sitePreviewUrl(hostname: string): string | null {
  if (!hostname || hostname === '—') return null
  const protocol = hostname.includes('localhost') || hostname.endsWith('.test') || hostname.endsWith('.local') ? 'http' : 'https'
  return `${protocol}://${hostname}`
}

export function relativeTime(value?: string | null): string | null {
  if (!value) return null
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return null
  const delta = Date.now() - then
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (delta < minute) return 'just now'
  if (delta < hour) return `${Math.floor(delta / minute)}m ago`
  if (delta < day) return `${Math.floor(delta / hour)}h ago`
  if (delta < 30 * day) return `${Math.floor(delta / day)}d ago`
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function statusTone(status: string): BadgeTone {
  if (status === 'published') return 'success'
  if (status === 'draft') return 'warning'
  if (status === 'disabled') return 'danger'
  return 'neutral'
}

function hashHue(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0
  return hash % 360
}

const MENU_LINKS = [
  { to: (id: number) => `/sites/${id}/navigation`, label: 'Navigation', icon: Navigation },
  { to: (id: number) => `/sites/${id}/forms`, label: 'Forms', icon: FileText },
  { to: (id: number) => `/blog?site=${id}`, label: 'Blog', icon: Newspaper },
  { to: (id: number) => `/sites/${id}/seo`, label: 'SEO', icon: Search },
  { to: (id: number) => `/sites/${id}/domains`, label: 'Domains', icon: Globe },
  { to: (id: number) => `/sites/${id}/settings`, label: 'Settings', icon: Settings },
] as const

export type SiteCardLayout = 'grid' | 'list'

function SiteMark({ site, size = 'md' }: { site: Site; size?: 'sm' | 'md' }) {
  const hue = hashHue(`${site.id}:${site.name}`)
  const initial = (site.name.trim()[0] || 'W').toUpperCase()
  const box = size === 'sm' ? 'size-10 rounded-xl text-sm' : 'size-12 rounded-2xl text-lg'
  return (
    <div
      className={`flex shrink-0 items-center justify-center font-semibold text-white shadow-lg ring-1 ring-white/15 ${box}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 48%), hsl(${(hue + 28) % 360} 55% 32%))` }}
    >
      {initial}
    </div>
  )
}

function SiteChrome({ site, compact = false }: { site: Site; compact?: boolean }) {
  const hue = hashHue(`${site.id}:${site.name}`)
  const host = primaryHost(site)
  const liveUrl = sitePreviewUrl(host)
  return (
    <div
      className={`relative overflow-hidden ${compact ? 'h-full w-14 shrink-0 rounded-l-xl' : 'h-36 rounded-t-xl border-b border-zinc-800/80'}`}
      style={{
        background: `linear-gradient(145deg, hsl(${hue} 48% 18%) 0%, #09090b 70%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />
      {compact ? (
        <div className="relative flex h-full items-center justify-center">
          <SiteMark site={site} size="sm" />
        </div>
      ) : (
        <div className="relative flex h-full flex-col">
          <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/40 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-zinc-600" />
            <span className="size-1.5 rounded-full bg-zinc-600" />
            <span className="size-1.5 rounded-full bg-zinc-600" />
            {liveUrl ? (
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 flex min-w-0 flex-1 items-center gap-1.5 rounded-md bg-black/40 px-2 py-0.5 text-[11px] text-zinc-400 hover:text-zinc-200"
                title={`Open ${host}`}
              >
                <Globe size={10} className="shrink-0" />
                <span className="truncate">{host}</span>
                <ExternalLink size={10} className="ml-auto shrink-0 opacity-0 transition group-hover:opacity-100" />
              </a>
            ) : (
              <div className="ml-2 flex-1 truncate rounded-md bg-black/40 px-2 py-0.5 text-[11px] text-zinc-500">No hostname yet</div>
            )}
          </div>
          <div className="flex flex-1 items-center justify-center">
            <SiteMark site={site} />
          </div>
        </div>
      )}
    </div>
  )
}

export function SiteCard({ site, layout = 'list' }: { site: Site; layout?: SiteCardLayout }) {
  const qc = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const host = primaryHost(site)
  const liveUrl = sitePreviewUrl(host)
  const created = relativeTime(site.created_at)
  const trashed = Boolean(site.deleted_at)
  const list = layout === 'list'

  useEffect(() => {
    if (!menuOpen) return
    function onPointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const duplicate = useMutation({
    mutationFn: () => sitesApi.duplicate(site.id),
    onSuccess: () => {
      setMenuOpen(false)
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })
  const remove = useMutation({
    mutationFn: () => sitesApi.remove(site.id),
    onSuccess: () => {
      setMenuOpen(false)
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })
  const restore = useMutation({
    mutationFn: () => sitesApi.restore(site.id),
    onSuccess: () => {
      setMenuOpen(false)
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })
  const publish = useMutation({
    mutationFn: () => sitesApi.publish(site.id),
    onSuccess: () => {
      setMenuOpen(false)
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })

  const busy = duplicate.isPending || remove.isPending || restore.isPending || publish.isPending

  const menu = (
    <div className="relative" ref={menuRef}>
      <Button
        variant="outline"
        className="px-2.5"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`More actions for ${site.name}`}
        disabled={busy}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MoreHorizontal size={16} />
      </Button>
      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 py-1 shadow-xl"
        >
          {MENU_LINKS.map((item) => (
            <Link
              key={item.label}
              role="menuitem"
              to={item.to(site.id)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              <item.icon size={14} className="text-zinc-500" />
              {item.label}
            </Link>
          ))}
          <div className="my-1 border-t border-zinc-800" />
          {site.status !== 'published' && !trashed ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
              disabled={publish.isPending}
              onClick={() => publish.mutate()}
            >
              <Globe size={14} className="text-zinc-500" />
              Publish
            </button>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
            disabled={duplicate.isPending}
            onClick={() => duplicate.mutate()}
          >
            <Copy size={14} className="text-zinc-500" />
            {duplicate.isPending ? 'Duplicating…' : 'Duplicate'}
          </button>
          {trashed ? (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
              disabled={restore.isPending}
              onClick={() => restore.mutate()}
            >
              <RotateCcw size={14} className="text-zinc-500" />
              {restore.isPending ? 'Restoring…' : 'Restore'}
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/40 hover:text-red-300 disabled:opacity-50"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm(`Delete "${site.name}"? This removes it from your websites list.`)) {
                  remove.mutate()
                }
              }}
            >
              <Trash2 size={14} />
              {remove.isPending ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      ) : null}
    </div>
  )

  const status = (
    <Badge tone={trashed ? 'danger' : statusTone(site.status)} className="shrink-0 capitalize">
      {trashed ? 'deleted' : site.status}
    </Badge>
  )

  if (list) {
    return (
      <Card padded={false} className="group relative overflow-visible transition hover:border-zinc-700">
        <div className="flex items-stretch">
          <SiteChrome site={site} compact />
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="truncate font-medium text-white">{site.name}</div>
                <span className="sm:hidden">{status}</span>
              </div>
              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-0.5 flex max-w-full items-center gap-1 truncate text-sm text-zinc-500 hover:text-zinc-300"
                >
                  <span className="truncate">{host}</span>
                  <ExternalLink size={11} className="shrink-0" />
                </a>
              ) : (
                <div className="mt-0.5 truncate text-sm text-zinc-500">{host}</div>
              )}
            </div>
            <div className="hidden min-w-0 text-xs text-zinc-500 sm:block sm:w-36">
              {site.category ? <div className="truncate">{site.category}</div> : null}
              {created ? <div className="truncate">Created {created}</div> : null}
            </div>
            <div className="hidden sm:block">{status}</div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Link to={`/sites/${site.id}/builder`}>
                <Button className="whitespace-nowrap" variant="primary">
                  <Layout size={15} />
                  <span className="hidden sm:inline">Open builder</span>
                  <span className="sm:hidden">Builder</span>
                </Button>
              </Link>
              {menu}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card padded={false} className="group relative flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20">
      <SiteChrome site={site} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-medium text-white">{site.name}</div>
            <div className="mt-0.5 truncate text-sm text-zinc-500">{host}</div>
          </div>
          {status}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
          {site.category ? <span>{site.category}</span> : null}
          {site.category && created ? <span className="text-zinc-700">·</span> : null}
          {created ? <span>Created {created}</span> : null}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Link to={`/sites/${site.id}/builder`} className="min-w-0 flex-1">
            <Button className="w-full" variant="primary">
              <Layout size={15} />
              Open builder
            </Button>
          </Link>
          {menu}
        </div>
      </div>
    </Card>
  )
}

export function SiteCardSkeleton({ layout = 'list' }: { layout?: SiteCardLayout }) {
  if (layout === 'list') {
    return (
      <Card padded={false} className="overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="size-10 shrink-0 animate-pulse rounded-xl bg-zinc-800" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-800" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800/80" />
          </div>
          <div className="h-8 w-28 animate-pulse rounded-lg bg-zinc-800/70" />
        </div>
      </Card>
    )
  }
  return (
    <Card padded={false} className="overflow-hidden">
      <div className="h-36 animate-pulse bg-zinc-800/60" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-zinc-800" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-zinc-800/80" />
        <div className="h-9 animate-pulse rounded-lg bg-zinc-800/70" />
      </div>
    </Card>
  )
}
