import type { FunnelAutomation, FunnelStep } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Trash2, Zap } from 'lucide-react'
import { useState } from 'react'
import { automationsApi } from '../lib/endpoints'
import { Badge, Button, Card, DataTable, EmptyState, Input, Label, Select } from '../ui/primitives'

/**
 * Rules a funnel runs by itself.
 *
 * Two things the server refuses and this panel therefore has to explain rather
 * than hide: an email may only go to the lead or to somebody on the workspace,
 * and a webhook has to be a public https address. Both come back as ordinary
 * validation messages, so they are shown next to the form instead of as a
 * failure.
 *
 * The webhook secret is write-only. It is what proves a call came from us, so
 * the server never sends it back; leaving the field blank on an edit keeps
 * whatever is already stored.
 */

const triggers: Array<[FunnelAutomation['trigger_event'], string]> = [
  ['lead_created', 'A lead is captured'],
  ['form_submission', 'A form is submitted'],
  ['purchase', 'Something is bought'],
  ['booking', 'A booking is made'],
  ['conversion', 'A step converts'],
  ['step_view', 'A step is viewed'],
]

const runTones = {
  done: 'success',
  failed: 'danger',
  waiting: 'info',
  pending: 'info',
  skipped: 'neutral',
} as const

const emptyDraft = {
  name: '',
  trigger_event: 'lead_created',
  trigger_step_id: '',
  delay_minutes: '0',
  action: 'email' as FunnelAutomation['action'],
  to: 'lead',
  subject: '',
  body: '',
  url: '',
  secret: '',
}

export function FunnelAutomations({ funnelId, steps }: { funnelId: string | number; steps: FunnelStep[] }) {
  const qc = useQueryClient()
  const rules = useQuery({ queryKey: ['funnel-automations', funnelId], queryFn: () => automationsApi.list(funnelId) })
  const [draft, setDraft] = useState(emptyDraft)
  const [editing, setEditing] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => void qc.invalidateQueries({ queryKey: ['funnel-automations', funnelId] })

  const body = () => ({
    name: draft.name,
    trigger_event: draft.trigger_event,
    trigger_step_id: draft.trigger_step_id ? Number(draft.trigger_step_id) : null,
    delay_minutes: Number(draft.delay_minutes) || 0,
    action: draft.action,
    config:
      draft.action === 'email'
        ? { to: draft.to, subject: draft.subject, body: draft.body }
        : // Sent only when it was typed, so an edit that leaves it blank keeps
          // the secret the server already holds.
          { url: draft.url, ...(draft.secret ? { secret: draft.secret } : {}) },
  })

  const save = useMutation({
    mutationFn: () => (editing ? automationsApi.update(funnelId, editing, body()) : automationsApi.create(funnelId, body())),
    onSuccess: () => {
      setDraft(emptyDraft)
      setEditing(null)
      setOpen(false)
      setError(null)
      refresh()
    },
    onError: (err: Error) => setError(err.message),
  })

  const toggle = useMutation({
    mutationFn: (rule: FunnelAutomation) =>
      automationsApi.update(funnelId, rule.id, { status: rule.status === 'active' ? 'paused' : 'active' }),
    onSuccess: refresh,
  })

  const remove = useMutation({
    mutationFn: (id: number) => automationsApi.remove(funnelId, id),
    onSuccess: refresh,
  })

  const edit = (rule: FunnelAutomation) => {
    setEditing(rule.id)
    setOpen(true)
    setError(null)
    setDraft({
      name: rule.name,
      trigger_event: rule.trigger_event,
      trigger_step_id: rule.trigger_step_id ? String(rule.trigger_step_id) : '',
      delay_minutes: String(rule.delay_minutes ?? 0),
      action: rule.action,
      to: rule.config?.to || 'lead',
      subject: rule.config?.subject || '',
      body: rule.config?.body || '',
      url: rule.config?.url || '',
      secret: '',
    })
  }

  const list = rules.data || []
  const stepName = new Map(steps.map((step) => [step.id, step.name]))

  return (
    <Card className="mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-medium text-white">
            <Zap size={16} className="text-amber-400" />
            Automations
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Send an email or call a webhook when something happens in this funnel.
          </p>
        </div>
        <Button
          variant={open ? 'ghost' : 'outline'}
          onClick={() => {
            setOpen(!open)
            setEditing(null)
            setDraft(emptyDraft)
            setError(null)
          }}
        >
          {open ? 'Cancel' : 'New rule'}
        </Button>
      </div>

      {open ? (
        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input
                placeholder="Welcome email"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </div>
            <div>
              <Label>When</Label>
              <Select value={draft.trigger_event} onChange={(e) => setDraft({ ...draft, trigger_event: e.target.value })}>
                {triggers.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>On which step</Label>
              <Select
                value={draft.trigger_step_id}
                onChange={(e) => setDraft({ ...draft, trigger_step_id: e.target.value })}
              >
                <option value="">Anywhere in the funnel</option>
                {steps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Wait first (minutes)</Label>
              <Input
                type="number"
                min="0"
                max="20160"
                value={draft.delay_minutes}
                onChange={(e) => setDraft({ ...draft, delay_minutes: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-zinc-500">Up to a fortnight. A paused rule does not fire when its wait ends.</p>
            </div>
            <div>
              <Label>Then</Label>
              <Select
                value={draft.action}
                onChange={(e) => setDraft({ ...draft, action: e.target.value as FunnelAutomation['action'] })}
              >
                <option value="email">Send an email</option>
                <option value="webhook">Call a webhook</option>
              </Select>
            </div>
          </div>

          {draft.action === 'email' ? (
            <div className="mt-3 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>To</Label>
                  <Input value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
                  <p className="mt-1 text-[11px] text-zinc-500">
                    <code>lead</code> writes to whoever triggered it. Any other address has to belong to somebody on this
                    workspace.
                  </p>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    placeholder="Thanks, {{first_name}}"
                    value={draft.subject}
                    onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <textarea
                  rows={4}
                  value={draft.body}
                  onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500"
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  Sent as plain text. <code>{'{{first_name}}'}</code>, <code>{'{{email}}'}</code> and{' '}
                  <code>{'{{funnel}}'}</code> are filled in.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <Label>Address</Label>
                <Input
                  placeholder="https://example.com/hook"
                  value={draft.url}
                  onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-zinc-500">Public https only — a private or local address is refused.</p>
              </div>
              <div>
                <Label>Signing secret</Label>
                <Input
                  type="password"
                  placeholder={editing ? 'Unchanged' : 'Optional'}
                  value={draft.secret}
                  onChange={(e) => setDraft({ ...draft, secret: e.target.value })}
                />
                <p className="mt-1 text-[11px] text-zinc-500">
                  We sign the body with it as <code>X-Uidesired-Signature</code>. It is never shown again.
                </p>
              </div>
            </div>
          )}

          {error ? <p className="mt-3 text-xs text-red-400">{error}</p> : null}

          <div className="mt-4">
            <Button disabled={save.isPending || !draft.name.trim()} onClick={() => save.mutate()}>
              {save.isPending ? 'Saving…' : editing ? 'Save rule' : 'Create rule'}
            </Button>
          </div>
        </div>
      ) : null}

      {list.length === 0 ? (
        <EmptyState title="No automations yet" description="Nothing happens on its own in this funnel." />
      ) : (
        <div className="mt-4 space-y-2">
          {list.map((rule) => (
            <AutomationRow
              key={rule.id}
              funnelId={funnelId}
              rule={rule}
              stepName={rule.trigger_step_id ? stepName.get(rule.trigger_step_id) : undefined}
              onEdit={() => edit(rule)}
              onToggle={() => toggle.mutate(rule)}
              onDelete={() => {
                if (window.confirm(`Delete “${rule.name}”? Its history goes with it.`)) remove.mutate(rule.id)
              }}
            />
          ))}
        </div>
      )}
    </Card>
  )
}

/** One rule, with its own history folded away until it is asked for. */
function AutomationRow({
  funnelId,
  rule,
  stepName,
  onEdit,
  onToggle,
  onDelete,
}: {
  funnelId: string | number
  rule: FunnelAutomation
  stepName?: string
  onEdit: () => void
  onToggle: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const runs = useQuery({
    queryKey: ['funnel-automation-runs', funnelId, rule.id],
    queryFn: () => automationsApi.runs(funnelId, rule.id),
    enabled: open,
  })

  const when = triggers.find(([value]) => value === rule.trigger_event)?.[1] || rule.trigger_event

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex flex-wrap items-center gap-3 p-3">
        <button type="button" className="text-zinc-500 hover:text-zinc-300" onClick={() => setOpen(!open)} title="History">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <div className="min-w-40 flex-1">
          <div className="text-sm font-medium text-white">{rule.name}</div>
          <div className="text-xs text-zinc-500">
            {when}
            {stepName ? ` on ${stepName}` : ' anywhere'} ·{' '}
            {rule.delay_minutes > 0 ? `after ${rule.delay_minutes} min` : 'straight away'} ·{' '}
            {rule.action === 'email' ? `emails ${rule.config?.to || 'the lead'}` : 'calls a webhook'}
          </div>
        </div>
        <span className="text-xs text-zinc-500">{rule.run_count} run{rule.run_count === 1 ? '' : 's'}</span>
        <button type="button" onClick={onToggle} title="Switch this rule on or off">
          <Badge tone={rule.status === 'active' ? 'success' : 'neutral'}>{rule.status}</Badge>
        </button>
        <Button variant="ghost" onClick={onEdit}>
          Edit
        </Button>
        <button type="button" className="p-1 text-zinc-600 hover:text-red-400" title="Delete rule" onClick={onDelete}>
          <Trash2 size={14} />
        </button>
      </div>

      {open ? (
        <div className="border-t border-zinc-800 p-3">
          {runs.isLoading ? (
            <p className="text-xs text-zinc-500">Loading history…</p>
          ) : (runs.data || []).length === 0 ? (
            <p className="text-xs text-zinc-500">This rule has not fired yet.</p>
          ) : (
            <DataTable headers={['When', 'Result', 'Detail']}>
              {(runs.data || []).map((run) => (
                <tr key={run.id} className="border-t border-zinc-800">
                  <td className="px-3 py-2 text-xs text-zinc-500">
                    {new Date(run.ran_at || run.created_at || Date.now()).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <Badge tone={runTones[run.status] || 'neutral'}>{run.status}</Badge>
                  </td>
                  {/* Kept rather than thrown away: a rule that quietly failed is
                      worse than one that visibly did. */}
                  <td className="px-3 py-2 text-xs text-zinc-400">{run.detail || '—'}</td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>
      ) : null}
    </div>
  )
}
