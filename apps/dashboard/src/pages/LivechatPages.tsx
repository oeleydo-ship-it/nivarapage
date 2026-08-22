import type { LivechatConversation, LivechatMessage } from '@uidesired/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bot, MessageCircle, RotateCcw, Send, Settings2, UserRoundCheck } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { LivechatNav } from '../components/LivechatNav'
import { livechatApi, sitesApi } from '../lib/endpoints'
import { Badge, Button, EmptyState, Input, PageHeader, Select, type BadgeTone } from '../ui/primitives'

function statusTone(status: string): BadgeTone {
  if (status === 'open') return 'info'
  if (status === 'waiting') return 'warning'
  if (status === 'assigned') return 'success'
  return 'neutral'
}

function locationOf(row: LivechatConversation) {
  return [row.city, row.region, row.country].filter(Boolean).join(', ') || '—'
}

export function LivechatInboxPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [siteId, setSiteId] = useState('')
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [draft, setDraft] = useState('')
  const qc = useQueryClient()
  const sites = useQuery({ queryKey: ['sites'], queryFn: sitesApi.list })
  // Typing in the search box used to key the query directly, firing a request
  // per keystroke on top of the 4s poll.
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [q])
  const inbox = useQuery({
    queryKey: ['livechat', 'inbox', status, siteId, debouncedQ],
    queryFn: () =>
      livechatApi.inbox({ status: status || undefined, site_id: siteId || undefined, q: debouncedQ || undefined }),
    refetchInterval: 4000,
  })
  const conversationQuery = useQuery({
    queryKey: ['livechat', 'conversation', id],
    queryFn: () => livechatApi.conversation(id!),
    enabled: Boolean(id),
    refetchInterval: 2500,
  })
  const reply = useMutation({
    mutationFn: (body: string) => livechatApi.reply(id!, body),
    onSuccess: () => {
      setDraft('')
      void qc.invalidateQueries({ queryKey: ['livechat'] })
    },
  })
  const close = useMutation({
    mutationFn: () => livechatApi.close(id!),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['livechat'] }),
  })
  const reopen = useMutation({
    mutationFn: () => livechatApi.reopen(id!),
    onSuccess: (updated) => {
      qc.setQueryData(['livechat', 'conversation', id], updated)
      void qc.invalidateQueries({ queryKey: ['livechat', 'inbox'] })
    },
  })
  const takeover = useMutation({
    mutationFn: () => livechatApi.takeover(id!),
    onSuccess: (updated) => {
      qc.setQueryData(['livechat', 'conversation', id], updated)
      void qc.invalidateQueries({ queryKey: ['livechat', 'inbox'] })
    },
  })

  const rows = inbox.data?.data || []
  const conversation = conversationQuery.data
  const messages: LivechatMessage[] = useMemo(
    () => [...(conversation?.messages || [])].sort((a, b) => a.id - b.id),
    [conversation?.messages],
  )

  useEffect(() => {
    if (!id && rows[0]) navigate(`/livechat/${rows[0].id}`, { replace: true })
  }, [id, rows, navigate])

  const threadRef = useRef<HTMLDivElement>(null)
  const lastVisible = [...messages].filter((message) => message.role !== 'system').pop()
  const waitingOnAgent = lastVisible?.role === 'visitor'
  const latestAi = [...messages].reverse().find((message) => message.role === 'ai')

  // Jumping to the bottom on every poll made scrollback unreadable in a live
  // thread, so only follow along when the agent is already at the end.
  const pinnedRef = useRef(true)
  useEffect(() => {
    const el = threadRef.current
    if (!el) return
    const onScroll = () => {
      pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [conversation?.id])

  useEffect(() => {
    const el = threadRef.current
    if (el && pinnedRef.current) el.scrollTop = el.scrollHeight
  }, [messages, conversation?.agent_typing])

  useEffect(() => {
    pinnedRef.current = true
  }, [conversation?.id])

  useEffect(() => {
    if (!id || !draft.trim() || conversation?.status === 'closed' || !waitingOnAgent) return
    const timer = window.setTimeout(() => {
      void livechatApi.typing(id).catch(() => undefined)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [draft, id, conversation?.status, waitingOnAgent])

  function onReply(event: FormEvent) {
    event.preventDefault()
    if (!draft.trim() || !id || reply.isPending) return
    pinnedRef.current = true
    reply.mutate(draft.trim())
  }

  const unreadTotal = rows.reduce((sum, row) => sum + (row.unread_count || 0), 0)

  return (
    <div className="-mx-8 -my-8 flex h-screen min-h-0 flex-col overflow-hidden px-8 py-8">
      <div className="shrink-0">
        <PageHeader
          title={unreadTotal ? `Livechat (${unreadTotal})` : 'Livechat'}
          description="AI and human agents. New chats collect name, email, and phone, then land in Clients."
          actions={
            <Link to="/livechat/settings">
              <Button variant="outline">
                <Settings2 size={16} />
                Settings
              </Button>
            </Link>
          }
        />
        <LivechatNav />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden rounded-xl border border-zinc-800 lg:grid-cols-[320px_1fr_280px]">
        <aside className="flex min-h-0 flex-col overflow-hidden border-b border-zinc-800 lg:border-b-0 lg:border-r">
          <div className="shrink-0 space-y-2 border-b border-zinc-800 p-3">
            <Input placeholder="Search visitors" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="flex gap-2">
              <Select className="flex-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="waiting">Waiting</option>
                <option value="assigned">Assigned</option>
                <option value="closed">Closed</option>
              </Select>
              <Select className="flex-1" value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                <option value="">All sites</option>
                {(sites.data || []).map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {rows.length === 0 ? (
              <div className="p-6 text-sm text-zinc-500">
                No conversations yet.{' '}
                <Link className="text-blue-400 hover:underline" to="/livechat/settings">
                  Enable a widget
                </Link>
              </div>
            ) : (
              rows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => navigate(`/livechat/${row.id}`)}
                  className={`block w-full border-b border-zinc-800 px-4 py-3 text-left ${
                    String(row.id) === id ? 'bg-zinc-800/80' : 'hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className={`truncate text-white ${row.unread_count ? 'font-semibold' : 'font-medium'}`}>
                      {row.visitor_name || 'Visitor'}
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {row.unread_count ? (
                        <span
                          className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                          title={`${row.unread_count} unread`}
                        >
                          {row.unread_count > 9 ? '9+' : row.unread_count}
                        </span>
                      ) : null}
                      <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                    </div>
                  </div>
                  <div className="mt-1 truncate text-xs text-zinc-500">{row.site?.name}</div>
                  <div className="mt-1 truncate text-xs text-zinc-400">{row.latest_message?.body}</div>
                </button>
              ))
            )}
          </div>
        </aside>
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-zinc-950">
          {!conversation ? (
            <EmptyState
              icon={<MessageCircle size={22} />}
              title="Select a conversation"
              description="Visitor messages appear here. Enable a widget to start receiving chats."
            >
              <Link to="/livechat/settings">
                <Button variant="outline">Enable widget</Button>
              </Link>
            </EmptyState>
          ) : (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-5 py-3">
                <div>
                  <div className="font-medium text-white">{conversation.visitor_name || 'Visitor'}</div>
                  <div className="text-xs text-zinc-500">
                    {conversation.handler === 'ai' ? 'AI agent' : 'Human agent'} · {conversation.browser} / {conversation.os}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {conversation.handler === 'ai' && conversation.status !== 'closed' ? (
                    <Button disabled={takeover.isPending} onClick={() => takeover.mutate()}>
                      <UserRoundCheck size={16} />
                      {takeover.isPending ? 'Joining…' : 'Take over'}
                    </Button>
                  ) : conversation.handler === 'human' ? (
                    <Badge tone="success">{conversation.assignee?.name ? `${conversation.assignee.name} joined` : 'Human support'}</Badge>
                  ) : null}
                  {conversation.status === 'closed' ? (
                    <Button variant="outline" disabled={reopen.isPending} onClick={() => reopen.mutate()}>
                      <RotateCcw size={16} />
                      {reopen.isPending ? 'Reopening…' : 'Reopen'}
                    </Button>
                  ) : (
                    <Button variant="outline" disabled={close.isPending} onClick={() => close.mutate()}>
                      Close
                    </Button>
                  )}
                </div>
              </div>
              <div ref={threadRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
                {messages.map((message) => {
                  const confidence = typeof message.meta?.confidence === 'string' ? message.meta.confidence : null
                  const sources = Array.isArray(message.meta?.sources)
                    ? message.meta.sources.filter((value): value is string => typeof value === 'string')
                    : []
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        message.role === 'visitor'
                          ? 'ml-auto bg-blue-600 text-white'
                          : message.role === 'system'
                            ? 'bg-zinc-900 text-zinc-400'
                            : 'bg-zinc-800 text-zinc-100'
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wide opacity-70">
                        {message.role === 'ai' ? <Bot size={12} /> : null}
                        <span>{message.role === 'ai' ? 'AI assistant' : message.role}</span>
                        {confidence ? <span className="rounded-full border border-current/20 px-1.5 py-0.5">{confidence} confidence</span> : null}
                      </div>
                      <div className="whitespace-pre-wrap">{message.body}</div>
                      {sources.length ? <div className="mt-2 text-[11px] text-zinc-400">Sources: {sources.join(', ')}</div> : null}
                      {message.meta?.handoff ? <div className="mt-2 text-[11px] text-amber-300">Escalated to a human agent</div> : null}
                    </div>
                  )
                })}
                {conversation.agent_typing ? (
                  <div className="max-w-[80%] rounded-2xl bg-zinc-800 px-3 py-2 text-sm text-zinc-400">
                    {conversation.typing_as === 'ai' ? 'AI is checking the knowledge base…' : 'Agent is typing…'}
                  </div>
                ) : null}
              </div>
              <form onSubmit={onReply} className="flex shrink-0 items-end gap-2 border-t border-zinc-800 p-4">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      onReply(event)
                    }
                  }}
                  rows={1}
                  placeholder={
                    conversation.status === 'closed'
                      ? 'Reopen to reply…'
                      : 'Reply as a live agent… (Shift+Enter for a new line)'
                  }
                  disabled={conversation.status === 'closed'}
                  className="max-h-40 min-h-[42px] w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <Button type="submit" disabled={!draft.trim() || reply.isPending || conversation.status === 'closed'}>
                  <Send size={16} />
                </Button>
              </form>
            </>
          )}
        </section>
        <aside className="hidden min-h-0 overflow-y-auto border-l border-zinc-800 bg-zinc-900/40 p-4 text-sm lg:block">
          {conversation ? (
            <div className="space-y-3">
              {latestAi ? (
                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-indigo-300">
                    <Bot size={14} /> AI insight
                  </div>
                  <div className="text-xs text-zinc-400">
                    Confidence: {typeof latestAi.meta?.confidence === 'string' ? latestAi.meta.confidence : 'not reported'}
                  </div>
                  {typeof latestAi.meta?.handoff_reason === 'string' ? (
                    <div className="mt-1 text-xs text-amber-300">{latestAi.meta.handoff_reason}</div>
                  ) : null}
                </div>
              ) : null}
              <div>
                <div className="text-xs text-zinc-500">Contact</div>
                <div className="text-white">{conversation.visitor_name}</div>
                <div className="text-zinc-400">{conversation.visitor_email}</div>
                <div className="text-zinc-400">{conversation.visitor_phone}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Site</div>
                <Link className="text-blue-400 hover:underline" to={`/sites/${conversation.site_id}/livechat`}>
                  {conversation.site?.name}
                </Link>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Browser</div>
                <div>
                  {conversation.browser} · {conversation.os} · {conversation.device}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Location</div>
                <div>{locationOf(conversation)}</div>
                <div className="text-xs text-zinc-500">{conversation.timezone}</div>
              </div>
              {conversation.client ? (
                <div>
                  <div className="text-xs text-zinc-500">CRM</div>
                  <Link className="text-blue-400 hover:underline" to={`/clients/${conversation.client.id}`}>
                    {conversation.client.name}
                  </Link>
                </div>
              ) : null}
              {conversation.page_url ? (
                <div>
                  <div className="text-xs text-zinc-500">Page</div>
                  <a className="break-all text-blue-400 hover:underline" href={conversation.page_url} target="_blank" rel="noreferrer">
                    {conversation.page_url}
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-zinc-500">Visitor details appear here.</div>
          )}
        </aside>
      </div>
    </div>
  )
}
