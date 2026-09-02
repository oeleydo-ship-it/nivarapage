import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RotateCcw, Save, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { SiteSubnav } from '../components/SiteChrome'
import { timeAgo } from '../lib/timeAgo'
import { backupsApi, type SiteBackup } from '../lib/endpoints'
import { Badge, Button, Card, EmptyState, Input, Label, PageHeader } from '../ui/primitives'

function sizeLabel(bytes: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export function SiteBackupsPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const [label, setLabel] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<number | null>(null)
  const [undoId, setUndoId] = useState<number | null>(null)

  const backups = useQuery({
    queryKey: ['site-backups', id],
    queryFn: () => backupsApi.list(id!),
    enabled: Boolean(id),
  })

  const refresh = () => qc.invalidateQueries({ queryKey: ['site-backups', id] })

  const create = useMutation({
    mutationFn: () => backupsApi.create(id!, label),
    onSuccess: (backup) => {
      setLabel('')
      setNotice(`Saved “${backup.label}”.`)
      void refresh()
    },
  })

  const restore = useMutation({
    mutationFn: (backupId: number) => backupsApi.restore(id!, backupId),
    onSuccess: (result) => {
      setConfirming(null)
      setUndoId(result.undo_backup.id)
      setNotice(`Restored “${result.restored_from.label}”. A safety copy was saved first.`)
      void refresh()
      // Pages and theme changed underneath the rest of the app.
      void qc.invalidateQueries({ queryKey: ['pages'] })
      void qc.invalidateQueries({ queryKey: ['theme'] })
    },
  })

  const remove = useMutation({
    mutationFn: (backupId: number) => backupsApi.remove(id!, backupId),
    onSuccess: () => void refresh(),
  })

  const rows = backups.data ?? []

  return (
    <div>
      <PageHeader
        title="Backups"
        description="Save a snapshot of this site before a big change, and put it back if the change does not work out."
      />
      <SiteSubnav />

      <Card className="mb-5 max-w-xl space-y-3">
        <div>
          <h2 className="font-medium text-white">Save a backup</h2>
          <p className="text-xs text-zinc-500">
            Captures every page&rsquo;s content, the theme, site settings and navigation. Media files are not copied —
            they stay in your library and are not affected by a restore.
          </p>
        </div>
        <div>
          <Label>Label (optional)</Label>
          <Input
            value={label}
            placeholder="Before the homepage redesign"
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !create.isPending) create.mutate()
            }}
          />
        </div>
        <Button disabled={create.isPending} onClick={() => create.mutate()}>
          <Save size={15} />
          {create.isPending ? 'Saving…' : 'Save backup'}
        </Button>
        {notice ? <p className="text-sm text-emerald-400">{notice}</p> : null}
        {create.isError ? <p className="text-sm text-red-400">{errorText(create.error, 'Could not save the backup.')}</p> : null}
        {restore.isError ? <p className="text-sm text-red-400">{errorText(restore.error, 'The restore failed. Nothing was changed.')}</p> : null}
      </Card>

      {rows.length === 0 && !backups.isLoading ? (
        <Card className="px-6 py-12">
          <EmptyState
            title="No backups yet"
            description="Save one before your next big change. Restoring is always undoable — a safety copy is taken first."
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map((backup: SiteBackup) => (
            <Card key={backup.id} className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">{backup.label}</span>
                  {backup.kind === 'pre_restore' ? <Badge tone="info">safety copy</Badge> : null}
                  {backup.id === undoId ? <Badge tone="warning">undo point</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {timeAgo(backup.created_at)}
                  {backup.author ? ` · ${backup.author}` : ''}
                  {` · ${backup.page_count} page${backup.page_count === 1 ? '' : 's'}`}
                  {` · ${sizeLabel(backup.bytes)}`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {confirming === backup.id ? (
                  <>
                    <Button
                      variant="danger"
                      disabled={restore.isPending}
                      onClick={() => restore.mutate(backup.id)}
                    >
                      {restore.isPending ? 'Restoring…' : 'Yes, replace the site'}
                    </Button>
                    <Button variant="ghost" onClick={() => setConfirming(null)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setConfirming(backup.id)}>
                      <RotateCcw size={15} />
                      Restore
                    </Button>
                    <Button variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate(backup.id)}>
                      <Trash2 size={15} />
                      Delete
                    </Button>
                  </>
                )}
              </div>
              {confirming === backup.id ? (
                <p className="w-full text-xs text-amber-400">
                  This replaces every page, the theme and the navigation with the snapshot. A safety copy of the current
                  site is saved first, so you can undo it.
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
