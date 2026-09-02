import type { PageSection } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { History, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { pagesApi, type PageRevision } from '../lib/endpoints'
import { timeAgo } from '../lib/timeAgo'
import { Badge, Button } from '../ui/primitives'
import type { BadgeTone } from '../ui/primitives'

/** How a revision came to exist, in words an editor would use. */
function reasonLabel(reason?: string | null): { text: string; tone: BadgeTone } {
  switch (reason) {
    case 'published':
      return { text: 'Published', tone: 'success' }
    case 'restore':
      return { text: 'Restored', tone: 'info' }
    case 'created':
      return { text: 'Created', tone: 'neutral' }
    default:
      return { text: 'Edited', tone: 'neutral' }
  }
}

/**
 * Version history for the page being edited.
 *
 * Selecting a version loads it onto the canvas as a preview without saving, so
 * the choice to keep it is separate from the choice to look at it.
 */
export function HistoryPanel({
  pageId,
  currentVersion,
  onPreview,
  onCancelPreview,
  onRestored,
  onClose,
}: {
  pageId: string | number
  currentVersion?: number | null
  onPreview: (sections: PageSection[], revision: PageRevision) => void
  onCancelPreview: () => void
  onRestored: (sections: PageSection[]) => void
  onClose: () => void
}) {
  const qc = useQueryClient()
  const [previewing, setPreviewing] = useState<number | null>(null)
  const [error, setError] = useState('')

  const revisions = useQuery({
    queryKey: ['page-revisions', pageId],
    queryFn: () => pagesApi.revisions(pageId),
  })

  const preview = useMutation({
    mutationFn: (revisionId: number) => pagesApi.revision(pageId, revisionId),
    onSuccess: (revision) => {
      const sections = (revision.content?.sections ?? []) as PageSection[]
      setPreviewing(revision.id)
      setError('')
      onPreview(sections, revision)
    },
    onError: () => setError('That version could not be loaded.'),
  })

  const restore = useMutation({
    mutationFn: (revisionId: number) => pagesApi.restore(pageId, revisionId),
    onSuccess: async () => {
      const fresh = await pagesApi.revisions(pageId)
      const newest = fresh[0]
      const full = newest ? await pagesApi.revision(pageId, newest.id) : null
      setPreviewing(null)
      setError('')
      void qc.invalidateQueries({ queryKey: ['page-revisions', pageId] })
      onRestored((full?.content?.sections ?? []) as PageSection[])
    },
    onError: () => setError('The restore failed. Nothing was changed.'),
  })

  const rows = revisions.data ?? []

  return (
    <aside className="absolute inset-y-0 right-0 z-40 flex w-[22rem] flex-col border-l border-zinc-800 bg-zinc-950 shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <History size={16} className="text-zinc-400" />
          <h2 className="text-sm font-medium text-white">Version history</h2>
        </div>
        <button type="button" aria-label="Close history" onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {previewing ? (
        <div className="border-b border-amber-900/60 bg-amber-950/40 px-4 py-3">
          <p className="text-xs text-amber-200">
            Previewing an older version. Nothing is saved until you restore it.
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              disabled={restore.isPending}
              onClick={() => restore.mutate(previewing)}
            >
              <RotateCcw size={14} />
              {restore.isPending ? 'Restoring…' : 'Restore this version'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setPreviewing(null)
                onCancelPreview()
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="px-4 pt-3 text-xs text-red-400">{error}</p> : null}

      <div className="min-h-0 flex-1 overflow-auto p-2">
        {revisions.isLoading ? <p className="p-3 text-sm text-zinc-500">Loading…</p> : null}
        {!revisions.isLoading && rows.length === 0 ? (
          <p className="p-3 text-sm text-zinc-500">
            No history yet. Versions are recorded as you edit and each time you publish.
          </p>
        ) : null}

        <ul className="space-y-1">
          {rows.map((revision) => {
            const badge = reasonLabel(revision.reason)
            const isCurrent = revision.version_number === currentVersion
            const isPreviewing = previewing === revision.id
            return (
              <li key={revision.id}>
                <button
                  type="button"
                  disabled={preview.isPending}
                  onClick={() => preview.mutate(revision.id)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                    isPreviewing
                      ? 'border-amber-700 bg-amber-950/30'
                      : 'border-transparent hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-white">Version {revision.version_number}</span>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {isCurrent ? <Badge tone="info">current</Badge> : null}
                      <Badge tone={badge.tone}>{badge.text}</Badge>
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {timeAgo(revision.created_at)}
                    {revision.author ? ` · ${revision.author}` : ''}
                    {typeof revision.section_count === 'number'
                      ? ` · ${revision.section_count} section${revision.section_count === 1 ? '' : 's'}`
                      : ''}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
