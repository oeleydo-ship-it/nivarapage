import type { Page, PageContent } from '@uidesired/types'
import { ChevronDown, Copy, FileText, Home, Pencil, Plus, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { pagesApi } from '../lib/endpoints'
import { Button, Input } from '../ui/primitives'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function PageMenu({
  pages,
  current,
  starterContent,
  onSelect,
  onChanged,
  onError,
  onInfo,
}: {
  pages: Page[]
  current?: Page
  /** Sections a brand-new page starts with, so the canvas is never blank. */
  starterContent: (page: { name: string; slug: string }) => PageContent
  onSelect: (page: Page) => void
  onChanged: () => Promise<unknown> | void
  onError: (message: string) => void
  onInfo: (message: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [busy, setBusy] = useState(false)
  const [renaming, setRenaming] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocumentClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocumentClick)
    return () => document.removeEventListener('mousedown', onDocumentClick)
  }, [open])

  function fail(error: unknown, fallback: string) {
    onError(error instanceof Error && error.message ? error.message : fallback)
  }

  async function run<T>(action: () => Promise<T>, fallback: string): Promise<T | null> {
    setBusy(true)
    try {
      const result = await action()
      await onChanged()
      return result
    } catch (error) {
      fail(error, fallback)
      return null
    } finally {
      setBusy(false)
    }
  }

  async function createPage() {
    const trimmed = name.trim()
    if (!trimmed) return
    const nextSlug = slug.trim() || slugify(trimmed)
    const created = await run(
      () =>
        pagesApi.create(String(current?.site_id ?? ''), {
          name: trimmed,
          slug: nextSlug,
          content: starterContent({ name: trimmed, slug: nextSlug }),
        }),
      'Could not create the page',
    )
    if (!created) return
    setName('')
    setSlug('')
    setAdding(false)
    setOpen(false)
    onSelect(created)
    onInfo(`Added “${created.name}”`)
  }

  async function duplicate(page: Page) {
    const copy = await run(
      () =>
        pagesApi.create(String(page.site_id), {
          name: `${page.name} copy`,
          slug: `${page.slug}-copy`.replace(/^-/, ''),
          content: page.draft?.content || starterContent({ name: page.name, slug: page.slug }),
        }),
      'Could not duplicate the page',
    )
    if (!copy) return
    setOpen(false)
    onSelect(copy)
    onInfo(`Duplicated “${page.name}”`)
  }

  async function remove(page: Page) {
    if (page.is_homepage) {
      onError('Set another page as the homepage before deleting this one.')
      return
    }
    if (!window.confirm(`Delete “${page.name}”? This cannot be undone.`)) return
    const done = await run(() => pagesApi.remove(page.id), 'Could not delete the page')
    if (done === null) return
    onInfo(`Deleted “${page.name}”`)
    const next = pages.find((entry) => entry.id !== page.id)
    if (next && page.id === current?.id) onSelect(next)
  }

  async function rename(page: Page) {
    const value = renameValue.trim()
    setRenaming(null)
    if (!value || value === page.name) return
    const updated = await run(() => pagesApi.update(page.id, { name: value }), 'Could not rename the page')
    if (updated) onInfo('Page renamed')
  }

  async function makeHomepage(page: Page) {
    const updated = await run(() => pagesApi.update(page.id, { is_homepage: true }), 'Could not set the homepage')
    if (updated) onInfo(`“${page.name}” is now the homepage`)
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-sm text-zinc-100 hover:border-zinc-700"
        onClick={() => setOpen(!open)}
        title="Pages"
      >
        <FileText size={14} className="text-zinc-500" />
        <span className="max-w-40 truncate">{current?.name || 'Pages'}</span>
        {current?.is_homepage ? <Home size={11} className="text-zinc-500" /> : null}
        <ChevronDown size={13} className="text-zinc-500" />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
          <div className="max-h-72 space-y-0.5 overflow-y-auto">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`group flex items-center gap-1 rounded-lg px-2 py-1.5 ${
                  page.id === current?.id ? 'bg-zinc-800/80' : 'hover:bg-zinc-900'
                }`}
              >
                {renaming === page.id ? (
                  <form
                    className="flex flex-1 items-center gap-1"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void rename(page)
                    }}
                  >
                    <Input
                      autoFocus
                      value={renameValue}
                      onChange={(event) => setRenameValue(event.target.value)}
                      onBlur={() => void rename(page)}
                    />
                  </form>
                ) : (
                  <>
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setOpen(false)
                        onSelect(page)
                      }}
                    >
                      <span className="flex items-center gap-1.5 truncate text-sm text-zinc-100">
                        {page.name}
                        {page.is_homepage ? <Home size={11} className="text-zinc-500" /> : null}
                      </span>
                      <span className="block truncate text-[11px] text-zinc-500">
                        {page.is_homepage ? '/' : `/${page.slug}`}
                      </span>
                    </button>
                    <span className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
                      <button
                        type="button"
                        title="Rename"
                        disabled={busy}
                        className="p-1 text-zinc-500 hover:text-white"
                        onClick={() => {
                          setRenameValue(page.name)
                          setRenaming(page.id)
                        }}
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        title="Duplicate"
                        disabled={busy}
                        className="p-1 text-zinc-500 hover:text-white"
                        onClick={() => void duplicate(page)}
                      >
                        <Copy size={12} />
                      </button>
                      {page.is_homepage ? null : (
                        <button
                          type="button"
                          title="Set as homepage"
                          disabled={busy}
                          className="p-1 text-zinc-500 hover:text-white"
                          onClick={() => void makeHomepage(page)}
                        >
                          <Home size={12} />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Delete"
                        disabled={busy}
                        className="p-1 text-zinc-500 hover:text-red-400"
                        onClick={() => void remove(page)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </span>
                  </>
                )}
              </div>
            ))}
            {!pages.length ? <p className="px-2 py-3 text-xs text-zinc-500">No pages yet.</p> : null}
          </div>

          <div className="mt-2 border-t border-zinc-800 pt-2">
            {adding ? (
              <form
                className="space-y-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  void createPage()
                }}
              >
                <Input
                  autoFocus
                  placeholder="Page name (e.g. About)"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    setSlug(slugify(event.target.value))
                  }}
                />
                <div className="flex items-center gap-1 text-xs text-zinc-500">
                  <span>/</span>
                  <Input placeholder="about" value={slug} onChange={(event) => setSlug(slugify(event.target.value))} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={busy || !name.trim()}>
                    {busy ? 'Adding…' : 'Add page'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-blue-400 hover:bg-zinc-900"
                onClick={() => setAdding(true)}
              >
                <Plus size={14} /> Add page
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
