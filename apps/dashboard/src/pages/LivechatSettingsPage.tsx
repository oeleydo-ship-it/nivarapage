import type { LivechatWidget } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LivechatNav } from '../components/LivechatNav'
import { livechatApi } from '../lib/endpoints'
import { Badge, Button, Card, EmptyState, PageHeader } from '../ui/primitives'

export function LivechatSettingsPage() {
  const qc = useQueryClient()
  const widgets = useQuery({ queryKey: ['livechat', 'widgets'], queryFn: livechatApi.widgets })
  const toggle = useMutation({
    mutationFn: ({ siteId, body }: { siteId: number; body: Record<string, unknown> }) =>
      livechatApi.updateWidget(siteId, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['livechat', 'widgets'] })
      void qc.invalidateQueries({ queryKey: ['livechat', 'widget'] })
    },
  })

  const rows = widgets.data || []

  return (
    <div>
      <PageHeader
        title="Livechat settings"
        description="Enable the chat widget on each website, turn the AI agent on, then add knowledge."
      />
      <LivechatNav />
      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Settings2 size={22} />}
            title="No websites yet"
            description="Create a website first, then enable its livechat widget here."
          >
            <Link to="/sites/new">
              <Button>Create website</Button>
            </Link>
          </EmptyState>
        </Card>
      ) : (
        <Card padded={false} className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="text-zinc-500">
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-3 font-medium">Website</th>
                <th className="px-5 py-3 font-medium">Widget</th>
                <th className="px-5 py-3 font-medium">AI agent</th>
                <th className="px-5 py-3 font-medium">Knowledge</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((widget) => (
                <WidgetRow
                  key={widget.id}
                  widget={widget}
                  busy={toggle.isPending}
                  onToggle={(body) => toggle.mutate({ siteId: widget.site_id, body })}
                />
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}

function WidgetRow({
  widget,
  busy,
  onToggle,
}: {
  widget: LivechatWidget
  busy: boolean
  onToggle: (body: Record<string, unknown>) => void
}) {
  return (
    <tr className="border-b border-zinc-800 last:border-0">
      <td className="px-5 py-4">
        <div className="font-medium text-white">{widget.site?.name || `Site #${widget.site_id}`}</div>
        <div className="mt-0.5 text-xs text-zinc-500">Key {widget.public_key}</div>
      </td>
      <td className="px-5 py-4">
        <label className="inline-flex items-center gap-2 text-zinc-200">
          <input
            type="checkbox"
            checked={widget.enabled}
            disabled={busy}
            onChange={(e) => onToggle({ enabled: e.target.checked })}
          />
          {widget.enabled ? <Badge tone="success">On</Badge> : <Badge>Off</Badge>}
        </label>
      </td>
      <td className="px-5 py-4">
        <label className="inline-flex items-center gap-2 text-zinc-200">
          <input
            type="checkbox"
            checked={widget.ai_enabled}
            disabled={busy}
            onChange={(e) => onToggle({ ai_enabled: e.target.checked })}
          />
          {widget.ai_enabled ? 'Answers visitors' : 'Human only'}
        </label>
      </td>
      <td className="px-5 py-4 text-zinc-400">{widget.knowledge_count ?? 0} files</td>
      <td className="px-5 py-4 text-right">
        <Link className="text-blue-400 hover:underline" to={`/sites/${widget.site_id}/livechat`}>
          Greeting, knowledge & embed
        </Link>
      </td>
    </tr>
  )
}
