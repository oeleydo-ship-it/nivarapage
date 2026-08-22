import type { MediaItem } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  Copy,
  Film,
  ImageIcon,
  LayoutGrid,
  Link2,
  List,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../lib/api'
import { billingApi, mediaApi, sitesApi } from '../lib/endpoints'
import { relativeTime } from './SiteCard'
import { Badge, Button, Card, EmptyState, Input, Label, Select } from '../ui/primitives'

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml'
const VIDEO_ACCEPT = 'video/mp4,video/webm,video/quicktime'
const ACCEPT = `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|svg)$/i
const VIDEO_EXT = /\.(mp4|webm|mov)$/i

export type MediaKind = 'image' | 'video' | 'any'

function acceptFor(kind: MediaKind): string {
  if (kind === 'image') return IMAGE_ACCEPT
  if (kind === 'video') return VIDEO_ACCEPT
  return ACCEPT
}

function matchesKind(file: File, kind: MediaKind): boolean {
  if (kind === 'image') return file.type.startsWith('image/') || IMAGE_EXT.test(file.name)
  if (kind === 'video') return file.type.startsWith('video/') || VIDEO_EXT.test(file.name)
  return file.type.startsWith('image/') || file.type.startsWith('video/') || IMAGE_EXT.test(file.name) || VIDEO_EXT.test(file.name)
}

function isVideoMime(mime?: string | null): boolean {
  return Boolean(mime && mime.startsWith('video/'))
}

function isImageMime(mime?: string | null): boolean {
  return Boolean(mime && mime.startsWith('image/'))
}

type Notice = { tone: 'ok' | 'err' | 'warn'; text: string; href?: { to: string; label: string } }

type PendingUpload = {
  id: string
  name: string
  preview?: string
  error?: string
}

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`
}

function kindOf(mime: string): string {
  if (mime.includes('svg')) return 'SVG'
  if (mime.includes('png')) return 'PNG'
  if (mime.includes('webp')) return 'WebP'
  if (mime.includes('avif')) return 'AVIF'
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'JPG'
  if (mime.includes('mp4')) return 'MP4'
  if (mime.includes('webm')) return 'WebM'
  if (mime.includes('quicktime')) return 'MOV'
  if (mime.startsWith('video/')) return 'Video'
  return 'File'
}

function errorMessage(error: unknown): Notice {
  if (error instanceof ApiError && error.status === 402) {
    return {
      tone: 'warn',
      text: error.message || 'Storage limit reached for this plan.',
      href: { to: '/billing', label: 'Upgrade' },
    }
  }
  if (error instanceof Error) return { tone: 'err', text: error.message }
  return { tone: 'err', text: 'Upload failed.' }
}

function NoticeBar({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  const tones = {
    ok: 'border-emerald-900 bg-emerald-950/50 text-emerald-200',
    err: 'border-red-900 bg-red-950/50 text-red-200',
    warn: 'border-amber-900 bg-amber-950/50 text-amber-200',
  }
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${tones[notice.tone]}`}>
      <span>
        {notice.text}
        {notice.href ? (
          <Link to={notice.href.to} className="ml-2 font-medium underline underline-offset-2">
            {notice.href.label}
          </Link>
        ) : null}
      </span>
      <button type="button" className="text-current/70 hover:text-current" onClick={onDismiss} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  )
}

function useFileDrop(onFiles: (files: File[]) => void, enabled = true, kind: MediaKind = 'any') {
  const [over, setOver] = useState(false)

  const onDragOver = (event: DragEvent) => {
    if (!enabled) return
    event.preventDefault()
    setOver(true)
  }
  const onDragLeave = () => setOver(false)
  const onDrop = (event: DragEvent) => {
    if (!enabled) return
    event.preventDefault()
    setOver(false)
    const files = Array.from(event.dataTransfer.files).filter((file) => matchesKind(file, kind))
    if (files.length) onFiles(files)
  }

  return { over, handlers: { onDragOver, onDragLeave, onDrop } }
}

function Thumb({ item, className }: { item: Pick<MediaItem, 'url' | 'mime_type' | 'filename' | 'alt_text'>; className?: string }) {
  if (item.url && isImageMime(item.mime_type)) {
    return <img src={item.url} alt={item.alt_text || item.filename} className={className ?? 'h-full w-full object-cover'} />
  }
  if (item.url && isVideoMime(item.mime_type)) {
    return (
      <video
        src={item.url}
        muted
        playsInline
        preload="metadata"
        className={className ?? 'h-full w-full object-cover'}
        aria-label={item.alt_text || item.filename}
      />
    )
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-500">
      {isVideoMime(item.mime_type) ? <Film size={22} /> : <ImageIcon size={22} />}
    </div>
  )
}

function MediaTile({
  item,
  selected,
  onSelect,
}: {
  item: MediaItem
  selected?: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-xl border text-left transition ${
        selected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-zinc-800 hover:border-zinc-600'
      }`}
    >
      <div className="aspect-square bg-zinc-950">
        <Thumb item={item} />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-8">
        <div className="truncate text-xs font-medium text-white">{item.filename}</div>
        <div className="mt-0.5 text-[10px] text-zinc-400">
          {kindOf(item.mime_type)} · {formatBytes(item.size)}
        </div>
      </div>
      {item.alt_text ? null : (
        <span className="absolute right-2 top-2 rounded-full bg-amber-500/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-black">
          No alt
        </span>
      )}
    </button>
  )
}

function PendingTile({ item }: { item: PendingUpload }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-700">
      <div className="flex aspect-square items-center justify-center bg-zinc-950">
        {item.preview ? <img src={item.preview} alt="" className="h-full w-full object-cover opacity-50" /> : null}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 text-xs">
          {item.error ? (
            <span className="px-2 text-center text-red-300">{item.error}</span>
          ) : (
            <>
              <Loader2 className="animate-spin text-blue-400" size={18} />
              <span className="text-zinc-300">Uploading…</span>
            </>
          )}
        </div>
      </div>
      <div className="truncate px-2 py-2 text-[11px] text-zinc-400">{item.name}</div>
    </div>
  )
}

export function MediaLibrary({
  siteId,
  compact = false,
}: {
  siteId?: string | number
  compact?: boolean
}) {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('all')
  const [siteFilter, setSiteFilter] = useState<string>(siteId ? String(siteId) : 'all')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selected, setSelected] = useState<MediaItem | null>(null)
  const [alt, setAlt] = useState('')
  const [filename, setFilename] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [pending, setPending] = useState<PendingUpload[]>([])
  const [copied, setCopied] = useState(false)

  const list = useQuery({ queryKey: ['media'], queryFn: () => mediaApi.list() })
  const sites = useQuery({ queryKey: ['sites'], queryFn: sitesApi.list, enabled: !compact })
  const sub = useQuery({ queryKey: ['subscription'], queryFn: billingApi.subscription, enabled: !compact })
  const detail = useQuery({
    queryKey: ['media-item', selected?.id],
    queryFn: () => mediaApi.get(selected!.id),
    enabled: Boolean(selected?.id),
  })

  const current = detail.data || selected
  const items = list.data || []
  const storage = sub.data?.usage?.storage_mb

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return items.filter((item) => {
      if (siteFilter === 'workspace' && item.site_id) return false
      if (siteFilter !== 'all' && siteFilter !== 'workspace' && String(item.site_id) !== siteFilter) return false
      if (kind !== 'all' && !item.mime_type.toLowerCase().includes(kind)) return false
      if (!query) return true
      return [item.filename, item.alt_text].some((value) => (value || '').toLowerCase().includes(query))
    })
  }, [items, q, kind, siteFilter])

  const save = useMutation({
    mutationFn: () => mediaApi.update(current!.id, { alt_text: alt, filename }),
    onSuccess: (item) => {
      qc.invalidateQueries({ queryKey: ['media'] })
      setSelected(item)
      setNotice({ tone: 'ok', text: 'Details saved.' })
    },
    onError: (error) => setNotice(errorMessage(error)),
  })

  const remove = useMutation({
    mutationFn: () => mediaApi.remove(current!.id),
    onSuccess: () => {
      setSelected(null)
      qc.invalidateQueries({ queryKey: ['media'] })
      qc.invalidateQueries({ queryKey: ['subscription'] })
      setNotice({ tone: 'ok', text: 'File deleted.' })
    },
    onError: (error) => setNotice(errorMessage(error)),
  })

  const uploadFiles = useCallback(
    async (files: File[]) => {
      if (!files.length) return
      const batch: PendingUpload[] = files.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        name: file.name,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }))
      setPending((currentPending) => [...batch, ...currentPending])
      setNotice({ tone: 'ok', text: files.length === 1 ? `Uploading ${files[0].name}…` : `Uploading ${files.length} files…` })

      let ok = 0
      let last: MediaItem | null = null
      for (let i = 0; i < files.length; i++) {
        try {
          last = await mediaApi.upload(files[i], {
            site_id: siteId ?? (siteFilter !== 'all' && siteFilter !== 'workspace' ? Number(siteFilter) : undefined),
          })
          ok += 1
          setPending((currentPending) => currentPending.filter((item) => item.id !== batch[i].id))
        } catch (error) {
          const message = errorMessage(error)
          setPending((currentPending) =>
            currentPending.map((item) => (item.id === batch[i].id ? { ...item, error: message.text } : item)),
          )
          setNotice(message)
        }
      }
      batch.forEach((item) => item.preview && URL.revokeObjectURL(item.preview))
      await qc.invalidateQueries({ queryKey: ['media'] })
      await qc.invalidateQueries({ queryKey: ['subscription'] })
      if (ok) {
        setNotice({ tone: 'ok', text: ok === 1 ? 'Image uploaded.' : `${ok} images uploaded.` })
        if (last) {
          setSelected(last)
          setAlt(last.alt_text || '')
          setFilename(last.filename)
        }
      }
    },
    [qc, siteFilter, siteId],
  )

  const drop = useFileDrop(uploadFiles)

  useEffect(() => {
    if (!notice || notice.tone === 'err' || notice.tone === 'warn') return
    const timer = window.setTimeout(() => setNotice(null), 3500)
    return () => window.clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.files || []).filter((file) => matchesKind(file, 'any'))
      if (files.length) {
        event.preventDefault()
        void uploadFiles(files)
      }
    }
    window.addEventListener('paste', onPaste)
    return () => window.removeEventListener('paste', onPaste)
  }, [uploadFiles])

  const selectItem = (item: MediaItem) => {
    setSelected(item)
    setAlt(item.alt_text || '')
    setFilename(item.filename)
  }

  const copyUrl = async () => {
    if (!current?.url) return
    await navigator.clipboard.writeText(current.url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const usedLabel = storage
    ? `${storage.used ?? 0} / ${typeof storage.limit === 'number' && storage.limit >= 0 ? storage.limit : '∞'} MB`
    : items.length
      ? formatBytes(items.reduce((sum, item) => sum + (item.size || 0), 0))
      : null

  const headerMeta = list.isPending
    ? 'Loading library…'
    : `${items.length} file${items.length === 1 ? '' : 's'}${usedLabel ? ` · ${usedLabel} used` : ''}`

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept={ACCEPT}
      multiple
      className="hidden"
      onChange={(event) => {
        const files = Array.from(event.target.files || [])
        event.target.value = ''
        void uploadFiles(files)
      }}
    />
  )

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[180px] flex-1">
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <Input className="pl-8" placeholder="Search files" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Select value={kind} onChange={(e) => setKind(e.target.value)}>
        <option value="all">All types</option>
        <option value="jpeg">JPG</option>
        <option value="png">PNG</option>
        <option value="webp">WebP</option>
        <option value="avif">AVIF</option>
        <option value="svg">SVG</option>
      </Select>
      {!compact ? (
        <Select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
          <option value="all">All websites</option>
          <option value="workspace">Workspace library</option>
          {(sites.data || []).map((site) => (
            <option key={site.id} value={site.id}>
              {site.name}
            </option>
          ))}
        </Select>
      ) : null}
      <div className="flex rounded-lg border border-zinc-800 p-0.5">
        <button
          type="button"
          className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
          onClick={() => setView('grid')}
          aria-label="Grid view"
        >
          <LayoutGrid size={14} />
        </button>
        <button
          type="button"
          className={`rounded-md p-1.5 ${view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}
          onClick={() => setView('list')}
          aria-label="List view"
        >
          <List size={14} />
        </button>
      </div>
      <Button onClick={() => fileRef.current?.click()}>
        <Upload size={16} />
        Upload
      </Button>
      {fileInput}
    </div>
  )

  const empty = !list.isPending && !pending.length && !filtered.length

  return (
    <div className="space-y-4">
      {!compact ? <p className="text-sm text-zinc-500">{headerMeta}. Drag files here or paste from the clipboard.</p> : null}
      {notice ? <NoticeBar notice={notice} onDismiss={() => setNotice(null)} /> : null}

      <div className={`grid gap-6 ${selected && !compact ? 'lg:grid-cols-[1fr_320px]' : ''}`}>
        <div
          {...drop.handlers}
          className={`relative rounded-2xl border border-dashed transition ${
            drop.over ? 'border-blue-500 bg-blue-500/5' : 'border-transparent'
          }`}
        >
          {drop.over ? (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-zinc-950/70 text-sm font-medium text-blue-300">
              Drop images to upload
            </div>
          ) : null}

          {toolbar}

          {list.isError ? (
            <Card className="mt-4 flex items-center justify-between gap-3">
              <div>
                <div className="font-medium text-white">Couldn’t load media</div>
                <p className="mt-1 text-sm text-zinc-500">{list.error instanceof Error ? list.error.message : 'Try again.'}</p>
              </div>
              <Button variant="outline" onClick={() => list.refetch()}>
                Retry
              </Button>
            </Card>
          ) : null}

          {list.isPending ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-900" />
              ))}
            </div>
          ) : empty ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="mt-4 w-full rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 px-6 py-16 text-center hover:border-zinc-600"
            >
              <EmptyState
                icon={<ImageIcon className="text-zinc-600" size={36} />}
                title={items.length ? 'No files match this search' : 'No images yet'}
                description="JPG, PNG, WebP, AVIF, and SVG. Drop files here, paste a screenshot, or click to upload."
              >
                <span className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white">
                  <Upload size={16} />
                  Upload images
                </span>
              </EmptyState>
            </button>
          ) : view === 'grid' ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {pending.map((item) => (
                <PendingTile key={item.id} item={item} />
              ))}
              {filtered.map((item) => (
                <MediaTile key={item.id} item={item} selected={selected?.id === item.id} onSelect={() => selectItem(item)} />
              ))}
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectItem(item)}
                  className={`flex w-full items-center gap-3 border-b border-zinc-800 px-3 py-2 text-left last:border-0 hover:bg-zinc-900 ${
                    selected?.id === item.id ? 'bg-zinc-900' : ''
                  }`}
                >
                  <div className="h-12 w-12 overflow-hidden rounded-lg bg-zinc-950">
                    <Thumb item={item} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-white">{item.filename}</div>
                    <div className="text-xs text-zinc-500">
                      {kindOf(item.mime_type)} · {formatBytes(item.size)}
                      {item.width && item.height ? ` · ${item.width}×${item.height}` : ''}
                    </div>
                  </div>
                  {item.alt_text ? null : <Badge tone="warning">No alt</Badge>}
                  <span className="hidden text-xs text-zinc-600 sm:block">{relativeTime(item.created_at)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {current && !compact ? (
          <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <div className="overflow-hidden rounded-xl bg-zinc-950">
              {current.url ? <img src={current.url} alt="" className="max-h-56 w-full object-contain" /> : null}
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <Label>Filename</Label>
                <Input value={filename} onChange={(e) => setFilename(e.target.value)} />
              </div>
              <div>
                <Label>Alt text</Label>
                <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image" />
              </div>
              <p className="text-xs text-zinc-500">
                {current.width && current.height ? `${current.width}×${current.height} · ` : null}
                {formatBytes(current.size || 0)} · {kindOf(current.mime_type)}
                {current.created_at ? ` · ${relativeTime(current.created_at)}` : ''}
              </p>
              {detail.data?.usage ? (
                <p className="text-xs text-zinc-400">
                  Used on {detail.data.usage.count} page{detail.data.usage.count === 1 ? '' : 's'}
                  {detail.data.usage.pages.length
                    ? `: ${detail.data.usage.pages.map((page) => page.name).join(', ')}`
                    : ''}
                </p>
              ) : (
                <p className="text-xs text-zinc-600">Select to load where this file is used.</p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => save.mutate()} disabled={save.isPending}>
                  {save.isPending ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save
                </Button>
                <Button variant="outline" onClick={() => void copyUrl()} disabled={!current.url}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy URL'}
                </Button>
              </div>
              {current.url ? (
                <a href={current.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                  <Link2 size={12} />
                  Open original
                </a>
              ) : null}
              <Button
                variant="danger"
                disabled={remove.isPending}
                onClick={() => {
                  const used = detail.data?.usage?.count || 0
                  const ok = window.confirm(
                    used
                      ? `This file is used on ${used} page${used === 1 ? '' : 's'}. Delete anyway?`
                      : `Delete ${current.filename}?`,
                  )
                  if (ok) remove.mutate()
                }}
              >
                <Trash2 size={14} />
                Delete
              </Button>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  )
}

export function MediaPicker({
  value,
  onChange,
  siteId,
  kind = 'image',
  /** Opens straight into the dialog and hides the inline control (canvas editing). */
  dialogOnly = false,
  onClose,
}: {
  value?: string
  onChange: (url: string, item?: MediaItem) => void
  siteId?: string | number
  kind?: MediaKind
  dialogOnly?: boolean
  onClose?: () => void
}) {
  const qc = useQueryClient()
  const [open, setOpen] = useState(dialogOnly)
  const close = () => {
    setOpen(false)
    onClose?.()
  }
  const [q, setQ] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const accept = acceptFor(kind)
  const noun = kind === 'video' ? 'video' : kind === 'any' ? 'file' : 'image'
  const list = useQuery({
    queryKey: ['media', siteId],
    queryFn: () => mediaApi.list({ site_id: siteId }),
    enabled: open,
  })

  const uploadFiles = async (files: File[]) => {
    const allowed = files.filter((file) => matchesKind(file, kind))
    if (!allowed.length) {
      setNotice({ tone: 'err', text: kind === 'video' ? 'Choose an MP4 or WebM video.' : 'Choose a supported image file.' })
      return
    }
    setUploading(true)
    try {
      let last: MediaItem | null = null
      for (const file of allowed) {
        last = await mediaApi.upload(file, { site_id: siteId })
      }
      await qc.invalidateQueries({ queryKey: ['media'] })
      if (last?.url) {
        onChange(last.url, last)
        close()
      }
    } catch (error) {
      setNotice(errorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  const drop = useFileDrop((files) => void uploadFiles(files), open, kind)
  const items = (list.data || []).filter((item) => {
    if (kind === 'image' && !isImageMime(item.mime_type)) return false
    if (kind === 'video' && !isVideoMime(item.mime_type)) return false
    const query = q.trim().toLowerCase()
    if (!query) return true
    return [item.filename, item.alt_text].some((value) => (value || '').toLowerCase().includes(query))
  })

  const preview = value ? (
    kind === 'video' || VIDEO_EXT.test(value) ? (
      <video src={value} muted playsInline preload="metadata" className="h-24 w-full rounded-lg object-cover" />
    ) : (
      <img src={value} alt="" className="h-24 w-full rounded-lg object-cover" />
    )
  ) : null

  return (
    <div className={dialogOnly ? undefined : 'space-y-2'}>
      {dialogOnly ? null : (
        <>
          {preview || (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 text-xs text-zinc-500 hover:border-zinc-500"
            >
              No {noun} — click to choose
            </button>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(true)}>
              Choose {noun}
            </Button>
            {value ? (
              <Button type="button" variant="ghost" onClick={() => onChange('')}>
                Remove
              </Button>
            ) : null}
          </div>
        </>
      )}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={close}>
          <div
            className="flex max-h-[86vh] w-full max-w-4xl flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            {...drop.handlers}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Choose a {noun}</h3>
                <p className="text-xs text-zinc-500">
                  {kind === 'video'
                    ? 'Select a video from the library or drop an MP4 / WebM file.'
                    : 'Select from the library or drop a new file.'}
                </p>
              </div>
              <Button variant="ghost" onClick={close}>
                Close
              </Button>
            </div>
            {notice ? (
              <div className="mb-3">
                <NoticeBar notice={notice} onDismiss={() => setNotice(null)} />
              </div>
            ) : null}
            <div className="mb-3 flex gap-2">
              <Input placeholder="Search library" value={q} onChange={(e) => setQ(e.target.value)} />
              <Button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Upload
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept={accept}
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = Array.from(event.target.files || [])
                  event.target.value = ''
                  void uploadFiles(files)
                }}
              />
            </div>
            <div className={`min-h-0 flex-1 overflow-auto rounded-xl ${drop.over ? 'ring-2 ring-blue-500' : ''}`}>
              {list.isPending ? (
                <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-900" />
                  ))}
                </div>
              ) : items.length ? (
                <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`overflow-hidden rounded-xl border text-left hover:border-blue-500 ${
                        value && item.url === value ? 'border-blue-500' : 'border-zinc-800'
                      }`}
                      onClick={() => {
                        onChange(item.url || '', item)
                        close()
                      }}
                    >
                      <div className="aspect-square bg-zinc-950">
                        <Thumb item={item} />
                      </div>
                      <div className="truncate px-2 py-1 text-[11px] text-zinc-400">{item.filename}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={kind === 'video' ? <Film className="text-zinc-600" size={28} /> : <ImageIcon className="text-zinc-600" size={28} />}
                  title="Library is empty"
                  description={
                    kind === 'video' ? 'Upload an MP4 or WebM video to use it on this block.' : 'Upload an image to use it on this block.'
                  }
                />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

