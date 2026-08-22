import type { Activity } from '@uidesired/types'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { activitiesApi } from '../lib/endpoints'
import { Badge, Button, Card, DataTable, EmptyState, Input, PageHeader, Select } from '../ui/primitives'

export function actionTone(action: string): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  if (action.includes('deleted') || action.includes('removed')) return 'danger'
  if (action.includes('published') || action.includes('activated') || action.includes('created')) return 'success'
  if (action.startsWith('billing') || action.startsWith('ownership')) return 'warning'
  if (action.startsWith('user') || action.startsWith('invitation')) return 'info'
  return 'neutral'
}

export function formatTimestamp(value?: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export function metadataSummary(metadata?: Record<string, unknown> | null): string {
  if (!metadata) return '—'
  const entries = Object.entries(metadata).filter(([key]) => key !== 'target_name')
  if (!entries.length) return '—'
  return entries.map(([key, value]) => `${key}: ${String(value)}`).join(' · ')
}

export function ActivityPage() {
  const [action, setAction] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const actions = useQuery({ queryKey: ['activity-actions'], queryFn: activitiesApi.actions })
  const activities = useQuery({
    queryKey: ['activities', action, query, page],
    queryFn: () => activitiesApi.list({ action: action || undefined, q: query || undefined, page }),
  })

  const meta = activities.data?.meta as { current_page?: number; last_page?: number; total?: number } | undefined
  const rows = (activities.data?.data || []) as Activity[]

  return (
    <div>
      <PageHeader
        title="Activity"
        description="Every important change in this workspace, with who did it and when."
        actions={
          <div className="flex items-center gap-2">
            <Select
              value={action}
              onChange={(e) => {
                setPage(1)
                setAction(e.target.value)
              }}
            >
              <option value="">All actions</option>
              {(actions.data || []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Search actor, target, IP…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setPage(1)
                  setQuery(search)
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                setPage(1)
                setQuery(search)
              }}
            >
              Search
            </Button>
          </div>
        }
      />
      <Card>
        {rows.length ? (
          <>
            <DataTable headers={['When', 'Actor', 'Action', 'Target', 'IP', 'Details']}>
              {rows.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap py-3 pr-4 text-zinc-400">{formatTimestamp(item.timestamp)}</td>
                  <td className="py-3 pr-4">
                    <div className="text-zinc-200">{item.actor?.name ?? 'System'}</div>
                    <div className="text-xs text-zinc-500">{item.actor?.email ?? '—'}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge tone={actionTone(item.action)}>{item.label ?? item.action}</Badge>
                  </td>
                  <td className="py-3 pr-4 text-zinc-300">
                    {item.target?.name ?? '—'}
                    {item.target?.type ? <div className="text-xs text-zinc-500">{item.target.type}</div> : null}
                  </td>
                  <td className="py-3 pr-4 text-zinc-500">{item.ip ?? '—'}</td>
                  <td className="max-w-xs truncate py-3 pr-4 text-xs text-zinc-500" title={metadataSummary(item.metadata)}>
                    {metadataSummary(item.metadata)}
                  </td>
                </tr>
              ))}
            </DataTable>
            <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
              <span>
                Page {meta?.current_page ?? page} of {meta?.last_page ?? 1} · {meta?.total ?? rows.length} events
              </span>
              <div className="flex gap-2">
                <Button variant="outline" disabled={(meta?.current_page ?? 1) <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={(meta?.current_page ?? 1) >= (meta?.last_page ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="No activity yet"
            description="Publishing pages, adding domains, and inviting teammates will show up here."
          />
        )}
      </Card>
    </div>
  )
}
