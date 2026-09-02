import type { LivechatWidget } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Settings2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LivechatNav } from '../components/LivechatNav'
import { livechatApi } from '../lib/endpoints'
import { renderSiteHtml } from '../lib/publishSite'
import { Badge, Button, Card, EmptyState, PageHeader } from '../ui/primitives'

export function LivechatSettingsPage() {
  const qc = useQueryClient()
  const [notice, setNotice] = useState<string | null>(null)
  const widgets = useQuery({ queryKey: ['livechat', 'widgets'], queryFn: livechatApi.widgets })
  const toggle = useMutation({
    mutationFn: async ({ siteId, body, published }: { siteId: number; body: Record<string, unknown>; published: boolean }) => {
      const widget = await livechatApi.updateWidget(siteId, body)

      /**
       * The widget tag is written into a page when it is published, so a
       * published site has to be rebuilt or switching this on changes nothing
       * a visitor can see. This renders from the site's published revisions,
       * so it never pushes out a half-edited page.
       */
      if (!published) {
        return { widget, notice: 'Saved. The widget appears once this website is published.' }
      }

      const result = await renderSiteHtml(siteId)

      return {
        widget,
        notice: result.renderError
          ? `Saved, but the live pages could not be rebuilt: ${result.renderError}`
          : null,
      }
    },
    onSuccess: ({ notice: next }) => {
      setNotice(next)
      void qc.invalidateQueries({ queryKey: ['livechat', 'widgets'] })
      void qc.invalidateQueries({ queryKey: ['livechat', 'widget'] })
    },
    onError: (error: Error) => setNotice(error.message),
  })

  const rows = widgets.data || []

  return (
    <div>
      <PageHeader
        title="Livechat settings"
        description="Enable the chat widget on each website, turn the AI agent on, then add knowledge."
      />
      <LivechatNav />
      {toggle.isPending ? (
        <p className="mb-4 text-sm text-zinc-400">Updating the widget and rebuilding the live pages…</p>
      ) : notice ? (
        <p className="mb-4 rounded-lg border border-amber-900/60 bg-amber-950/40 px-3 py-2 text-sm text-amber-300">{notice}</p>
      ) : null}
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
                  onToggle={(body) =>
                    toggle.mutate({ siteId: widget.site_id, body, published: widget.site?.status === 'published' })
                  }
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
        {!widget.enabled ? null : widget.site?.status !== 'published' ? (
          <div className="mt-1 text-xs text-amber-500">Website not published, so the widget is not on it yet</div>
        ) : widget.live_on_site ? (
          <div className="mt-1 text-xs text-emerald-500">On the live pages</div>
        ) : (
          <div className="mt-1 text-xs text-amber-500">Not on the live pages yet — switch it off and on to rebuild</div>
        )}
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
