import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { livechatPalette } from '@uidesired/blocks'
import type { LivechatWidget } from '@uidesired/types'
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SiteSubnav } from '../components/SiteChrome'
import { livechatApi } from '../lib/endpoints'
import { Button, Card, Input, Label, PageHeader, Select } from '../ui/primitives'

export function SiteLivechatPage() {
  const { id } = useParams()
  const qc = useQueryClient()
  const widgetQuery = useQuery({
    queryKey: ['livechat', 'widget', id],
    queryFn: () => livechatApi.widget(id!),
    enabled: Boolean(id),
  })
  const knowledgeQuery = useQuery({
    queryKey: ['livechat', 'knowledge', id],
    queryFn: () => livechatApi.knowledge(id!),
    enabled: Boolean(id),
  })
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => livechatApi.updateWidget(id!, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['livechat', 'widget', id] }),
  })
  const addKnowledge = useMutation({
    mutationFn: (body: { title?: string; content?: string; file?: File }) => livechatApi.addKnowledge(id!, body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['livechat', 'knowledge', id] }),
  })
  const sync = useMutation({
    mutationFn: () => livechatApi.syncKnowledge(id!),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['livechat', 'knowledge', id] }),
  })
  const remove = useMutation({
    mutationFn: (kid: number) => livechatApi.removeKnowledge(kid),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['livechat', 'knowledge', id] }),
  })

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | undefined>()
  const widget = widgetQuery.data

  // Appearance is controlled rather than read off the form on submit, so the
  // preview below updates as the colours are picked.
  const [look, setLook] = useState<Appearance>(DEFAULT_LOOK)
  // Deliberately keyed on identity rather than the whole widget: a background
  // refetch must not throw away colours the user is still choosing.
  useEffect(() => {
    if (widget) setLook(appearanceOf(widget))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget?.id, widget?.updated_at])
  const preview = useMemo(() => livechatPalette(look), [look])
  const previewVars = preview as CSSProperties
  function setLookValue(key: keyof Appearance, value: string) {
    setLook((current) => ({ ...current, [key]: value }))
  }

  function onSave(event: FormEvent) {
    event.preventDefault()
    if (!widget) return
    const form = event.target as HTMLFormElement
    const data = new FormData(form)
    save.mutate({
      enabled: data.get('enabled') === 'on',
      ai_enabled: data.get('ai_enabled') === 'on',
      mode: String(data.get('mode') || 'ai_first'),
      greeting: String(data.get('greeting') || ''),
      ...look,
      position: String(data.get('position') || 'right'),
      launcher_label: String(data.get('launcher_label') || 'Chat'),
      collect_name: data.get('collect_name') === 'on',
      collect_email: data.get('collect_email') === 'on',
      collect_phone: data.get('collect_phone') === 'on',
      require_contact: data.get('require_contact') === 'on',
    })
  }

  function onKnowledge(event: FormEvent) {
    event.preventDefault()
    addKnowledge.mutate({ title, content, file })
    setTitle('')
    setContent('')
    setFile(undefined)
  }

  return (
    <div>
      <PageHeader
        title="Livechat widget"
        description="Install on this site, upload knowledge for the AI agent, and collect leads into Clients."
        actions={
          <Link className="text-sm text-blue-400 hover:underline" to="/livechat">
            Open inbox
          </Link>
        }
      />
      <SiteSubnav />
      {!widget ? (
        <Card>Loading…</Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <form className="space-y-4" onSubmit={onSave}>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="enabled" defaultChecked={widget.enabled} /> Enable widget on this site
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="ai_enabled" defaultChecked={widget.ai_enabled} /> AI agent can answer from knowledge
              </label>
              <div>
                <Label>Mode</Label>
                <Select name="mode" defaultValue={widget.mode} className="w-full">
                  <option value="ai_first">AI first, human can take over</option>
                  <option value="hybrid">AI until an agent joins</option>
                  <option value="human_first">Human agents only</option>
                </Select>
              </div>
              <div>
                <Label>Greeting</Label>
                <Input name="greeting" defaultValue={widget.greeting} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Theme</Label>
                  <Select
                    value={look.theme}
                    onChange={(e) => setLookValue('theme', e.target.value)}
                    className="w-full"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Match the visitor’s device</option>
                  </Select>
                </div>
                <div>
                  <Label>Position</Label>
                  <Select name="position" defaultValue={widget.position} className="w-full">
                    <option value="right">Right</option>
                    <option value="left">Left</option>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <ColorField
                  label="Accent"
                  hint="Launcher, buttons and the visitor’s own messages."
                  value={look.primary_color}
                  onChange={(value) => setLookValue('primary_color', value)}
                />
                <ColorField
                  label="Panel background"
                  hint="Leave blank to follow the theme."
                  value={look.surface_color}
                  fallback={look.theme === 'light' ? '#ffffff' : '#18181b'}
                  clearable
                  onChange={(value) => setLookValue('surface_color', value)}
                />
                <ColorField
                  label="Text"
                  hint="Leave blank to follow the theme."
                  value={look.text_color}
                  fallback={look.theme === 'light' ? '#18181b' : '#fafafa'}
                  clearable
                  onChange={(value) => setLookValue('text_color', value)}
                />
                <ColorField
                  label="Agent bubble"
                  hint="Leave blank to derive from the panel."
                  value={look.bubble_color}
                  fallback={preview['--ud-lc-bubble']}
                  clearable
                  onChange={(value) => setLookValue('bubble_color', value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Launcher label</Label>
                  <Input name="launcher_label" defaultValue={widget.launcher_label} />
                </div>
                <div>
                  <Label>Launcher icon</Label>
                  <Select
                    value={look.launcher_icon}
                    onChange={(e) => setLookValue('launcher_icon', e.target.value)}
                    className="w-full"
                  >
                    <option value="chat">Chat</option>
                    <option value="bubble">Speech bubble</option>
                    <option value="headset">Headset</option>
                    <option value="sparkle">Sparkle</option>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setLook((current) => ({ ...current, ...preset.look }))}
                    className="flex items-center gap-2 rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300 hover:border-zinc-500"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: preset.look.primary_color }}
                      aria-hidden
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
              <WidgetPreview look={look} vars={previewVars} greeting={widget.greeting} />
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="require_contact" defaultChecked={widget.require_contact} /> Require contact before chat
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="collect_name" defaultChecked={widget.collect_name} /> Collect name
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="collect_email" defaultChecked={widget.collect_email} /> Collect email
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="collect_phone" defaultChecked={widget.collect_phone} /> Collect phone
                </label>
              </div>
              <Button type="submit" disabled={save.isPending}>
                Save widget
              </Button>
            </form>
            <div className="mt-6">
              <Label>Embed snippet</Label>
              <textarea
                readOnly
                className="mt-1 h-24 w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-xs"
                value={widget.embed_script || ''}
              />
              <p className="mt-2 text-xs text-zinc-500">
                Published UiDesired sites inject the widget automatically when it is enabled. Use the snippet for other hosts.
              </p>
            </div>
          </Card>
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-medium text-white">Knowledge</h2>
              <Button variant="outline" disabled={sync.isPending} onClick={() => sync.mutate()}>
                Sync published pages
              </Button>
            </div>
            <form className="space-y-3" onSubmit={onKnowledge}>
              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea
                className="h-28 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm"
                placeholder="Paste FAQs, hours, pricing notes…"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <input
                type="file"
                accept=".txt,.md,.csv,.json,.html,.htm"
                onChange={(e) => setFile(e.target.files?.[0])}
              />
              <Button type="submit" disabled={addKnowledge.isPending || (!content.trim() && !file)}>
                Upload knowledge
              </Button>
            </form>
            <ul className="mt-4 space-y-2 text-sm">
              {(knowledgeQuery.data || []).map((row) => (
                <li key={row.id} className="rounded-lg border border-zinc-800 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium text-white">{row.title}</div>
                      <div className="text-xs text-zinc-500">
                        {row.source} · {row.excerpt}
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => remove.mutate(row.id)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  )
}

type Appearance = {
  primary_color: string
  theme: string
  surface_color: string
  text_color: string
  bubble_color: string
  launcher_icon: string
}

const DEFAULT_LOOK: Appearance = {
  primary_color: '#2563eb',
  theme: 'dark',
  surface_color: '',
  text_color: '',
  bubble_color: '',
  launcher_icon: 'chat',
}

function appearanceOf(widget: LivechatWidget): Appearance {
  return {
    primary_color: widget.primary_color || DEFAULT_LOOK.primary_color,
    theme: widget.theme || 'dark',
    surface_color: widget.surface_color || '',
    text_color: widget.text_color || '',
    bubble_color: widget.bubble_color || '',
    launcher_icon: widget.launcher_icon || 'chat',
  }
}

const PRESETS: Array<{ name: string; look: Partial<Appearance> }> = [
  { name: 'Midnight', look: { theme: 'dark', primary_color: '#6366f1', surface_color: '', text_color: '', bubble_color: '' } },
  { name: 'Paper', look: { theme: 'light', primary_color: '#111827', surface_color: '#ffffff', text_color: '#18181b', bubble_color: '#f4f4f5' } },
  { name: 'Forest', look: { theme: 'dark', primary_color: '#16a34a', surface_color: '#0f1c14', text_color: '#ecfdf5', bubble_color: '' } },
  { name: 'Sunset', look: { theme: 'light', primary_color: '#f97316', surface_color: '#fffbf5', text_color: '#431407', bubble_color: '' } },
]

/**
 * Hex input paired with the native colour picker. `fallback` is what the widget
 * will actually use while the field is empty, so the swatch never goes blank.
 */
function ColorField({
  label,
  hint,
  value,
  fallback,
  clearable,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  fallback?: string
  clearable?: boolean
  onChange: (value: string) => void
}) {
  const shown = value || fallback || '#000000'
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-zinc-700 bg-transparent p-1"
        />
        <Input value={value} placeholder={fallback || '#2563eb'} onChange={(e) => onChange(e.target.value)} />
        {clearable && value ? (
          <button type="button" onClick={() => onChange('')} className="text-xs text-zinc-500 hover:text-zinc-300">
            Reset
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-[11px] text-zinc-500">{hint}</p> : null}
    </div>
  )
}

/** A miniature of the real panel so colours can be judged before saving. */
function WidgetPreview({ look, vars, greeting }: { look: Appearance; vars: CSSProperties; greeting: string }) {
  return (
    <div>
      <Label>Preview</Label>
      <div
        style={vars}
        className="mt-1 flex flex-col gap-2 rounded-2xl p-3"
      >
        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            background: 'linear-gradient(180deg, var(--ud-lc-surface), var(--ud-lc-surface-2))',
            borderColor: 'var(--ud-lc-line)',
            color: 'var(--ud-lc-text)',
          }}
        >
          <div className="flex items-center gap-2 p-3">
            <div
              className="grid h-8 w-8 place-items-center rounded-xl text-sm font-bold"
              style={{ background: 'var(--ud-lc-accent)', color: 'var(--ud-lc-on-accent)' }}
            >
              S
            </div>
            <div className="text-sm font-semibold">Support</div>
          </div>
          <div
            className="mx-3 rounded-xl p-2 text-xs"
            style={{ background: 'var(--ud-lc-soft)', color: 'var(--ud-lc-muted)' }}
          >
            {greeting || 'Hi there — how can we help?'}
          </div>
          <div className="flex flex-col gap-2 p-3">
            <div
              className="max-w-[80%] self-start rounded-2xl px-3 py-2 text-xs"
              style={{ background: 'var(--ud-lc-bubble)', color: 'var(--ud-lc-on-bubble)' }}
            >
              Happy to help with that.
            </div>
            <div
              className="max-w-[80%] self-end rounded-2xl px-3 py-2 text-xs"
              style={{ background: 'var(--ud-lc-accent)', color: 'var(--ud-lc-on-accent)' }}
            >
              What are your hours?
            </div>
          </div>
          <div className="flex items-center gap-2 p-3" style={{ borderTop: '1px solid var(--ud-lc-line)' }}>
            <div
              className="flex-1 rounded-xl px-3 py-2 text-xs"
              style={{ background: 'var(--ud-lc-field)', color: 'var(--ud-lc-muted)', border: '1px solid var(--ud-lc-line)' }}
            >
              Write a message…
            </div>
            <div
              className="grid h-8 w-8 place-items-center rounded-xl text-xs"
              style={{ background: 'var(--ud-lc-accent)', color: 'var(--ud-lc-on-accent)' }}
            >
              ➤
            </div>
          </div>
        </div>
        <div
          className="grid h-11 w-11 place-items-center self-end rounded-full text-xs"
          style={{
            background: 'linear-gradient(160deg, var(--ud-lc-accent) 0%, var(--ud-lc-fab-2) 130%)',
            color: 'var(--ud-lc-on-accent)',
            border: '1px solid var(--ud-lc-line)',
          }}
          title={look.launcher_icon}
        >
          {look.launcher_icon === 'headset' ? '🎧' : look.launcher_icon === 'sparkle' ? '✦' : '💬'}
        </div>
      </div>
    </div>
  )
}
