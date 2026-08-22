'use client'

import { livechatPalette, mixHex } from '@uidesired/blocks'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent } from 'react'

type WidgetConfig = {
  public_key: string
  enabled: boolean
  greeting: string
  primary_color: string
  theme?: 'dark' | 'light' | 'auto' | string
  surface_color?: string | null
  text_color?: string | null
  bubble_color?: string | null
  launcher_icon?: string | null
  position: 'left' | 'right' | string
  launcher_label: string
  collect_name: boolean
  collect_email: boolean
  collect_phone: boolean
  site_name?: string | null
  ai_enabled?: boolean
}

type ChatMessage = {
  id: number
  role: string
  body: string
  meta?: {
    confidence?: string
    sources?: unknown
    suggested_replies?: unknown
    handoff?: boolean
  }
}

type Conversation = {
  uuid: string
  visitor_token?: string
  messages?: ChatMessage[]
  agent_typing?: boolean
  typing_as?: string | null
  handler?: string
  assignee?: { id: number; name: string } | null
}

function awaitingReply(messages: ChatMessage[]) {
  const last = [...messages].filter((message) => message.role !== 'system').pop()
  return last?.role === 'visitor'
}

function suggestionsFrom(messages: ChatMessage[]): string[] {
  const last = [...messages].filter((message) => message.role !== 'system').pop()
  if (last?.role !== 'ai' || !Array.isArray(last.meta?.suggested_replies)) return []
  return last.meta.suggested_replies.filter((value): value is string => typeof value === 'string' && value.trim() !== '').slice(0, 3)
}

async function api<T>(path: string, init: RequestInit & { token?: string } = {}): Promise<T> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (init.token) headers.set('X-Livechat-Token', init.token)
  const res = await fetch(path, { ...init, headers })
  const json = (await res.json()) as { data?: T; message?: string }
  if (!res.ok) throw new Error(json.message || 'Request failed')
  return (json.data ?? json) as T
}

function IconChat({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 6.8A2.8 2.8 0 0 1 7.8 4h8.4A2.8 2.8 0 0 1 19 6.8v6.4A2.8 2.8 0 0 1 16.2 16H12l-3.6 3.2V16H7.8A2.8 2.8 0 0 1 5 13.2V6.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9 9h6M9 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconBubble({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4c4.4 0 8 2.9 8 6.5S16.4 17 12 17c-.7 0-1.4-.07-2-.2L5.5 19l.9-3.2C5 14.6 4 12.7 4 10.5 4 6.9 7.6 4 12 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconHeadset({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 14v-2a7 7 0 0 1 14 0v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="M5 13h1.6A1.4 1.4 0 0 1 8 14.4v2.2A1.4 1.4 0 0 1 6.6 18H5.8A1.8 1.8 0 0 1 4 16.2v-1.4A1.8 1.8 0 0 1 5.8 13H5Zm14 0h-1.6a1.4 1.4 0 0 0-1.4 1.4v2.2a1.4 1.4 0 0 0 1.4 1.4h.8a1.8 1.8 0 0 0 1.8-1.8v-1.4a1.8 1.8 0 0 0-1.8-1.8H19Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconSparkle({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9 12 4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M18 16.2 18.7 18l1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" fill="currentColor" />
    </svg>
  )
}

/** Launcher glyph, chosen in the widget settings. */
function LauncherIcon({ name }: { name?: string | null }) {
  if (name === 'bubble') return <IconBubble />
  if (name === 'headset') return <IconHeadset />
  if (name === 'sparkle') return <IconSparkle />
  return <IconChat size={22} />
}

function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function IconSend({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4.5 12 20 4.5 14.5 20l-2.2-6.3L4.5 12Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function colorSchemeQuery(): MediaQueryList | null {
  if (typeof window === 'undefined' || !window.matchMedia) return null
  return window.matchMedia('(prefers-color-scheme: dark)')
}

function subscribeToColorScheme(onChange: () => void): () => void {
  const query = colorSchemeQuery()
  if (!query) return () => {}
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

function deviceIsDark(): boolean {
  return colorSchemeQuery()?.matches ?? true
}

export function LivechatWidget({ publicKey }: { publicKey: string }) {
  const storageKey = `ud.lc.${publicKey}`
  const uuidKey = `ud.lc.uuid.${publicKey}`
  const [config, setConfig] = useState<WidgetConfig | null>(null)
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState(false)
  const [draft, setDraft] = useState('')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  // Only consulted when the widget theme is left on `auto`. Read straight from
  // the media query so there is no setState cascade on mount.
  const prefersDark = useSyncExternalStore(subscribeToColorScheme, deviceIsDark, () => true)
  const listRef = useRef<HTMLDivElement>(null)
  const endpoint = useMemo(() => `/api/livechat/${publicKey}`, [publicKey])

  useEffect(() => {
    void api<WidgetConfig>(endpoint).then(setConfig).catch(() => setConfig(null))
    const saved = localStorage.getItem(storageKey)
    const uuid = localStorage.getItem(uuidKey)
    if (saved) setToken(saved)
    if (saved && uuid) setConversation({ uuid })
  }, [endpoint, storageKey, uuidKey])

  useEffect(() => {
    if (!token || !conversation?.uuid) return
    let cancelled = false
    async function tick() {
      try {
        const data = await api<Conversation>(`${endpoint}/conversations/${conversation!.uuid}`, { token: token! })
        if (cancelled) return
        setConversation(data)
        const nextMessages = data.messages || []
        setMessages(nextMessages)
        setTyping(Boolean(data.agent_typing) && awaitingReply(nextMessages))
      } catch {
        /* session expired */
      }
    }
    void tick()
    const id = window.setInterval(() => void tick(), typing ? 1200 : 3500)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [token, conversation?.uuid, endpoint, typing])

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open, typing])

  // Hooks must run before the disabled-widget bail-out below.
  const palette = useMemo(() => livechatPalette(config ?? {}, prefersDark), [config, prefersDark])

  if (!config?.enabled) return null

  const color = config.primary_color || '#6366f1'
  const side = config.position === 'left' ? 'left' : 'right'
  const brand = config.site_name || 'Support'
  const initial = brand.trim().charAt(0).toUpperCase() || 'S'
  const suggestions = suggestionsFrom(messages)

  async function start(event: FormEvent) {
    event.preventDefault()
    setError('')
    setSending(true)
    try {
      const data = await api<Conversation>(`${endpoint}/conversations`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          phone,
          page_url: window.location.href,
          locale: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screen: `${window.screen.width}x${window.screen.height}`,
        }),
      })
      if (data.visitor_token) {
        localStorage.setItem(storageKey, data.visitor_token)
        setToken(data.visitor_token)
      }
      localStorage.setItem(uuidKey, data.uuid)
      setConversation(data)
      setMessages(data.messages || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start chat')
    } finally {
      setSending(false)
    }
  }

  async function sendBody(body: string) {
    if (!body.trim() || !token || !conversation?.uuid) return
    setDraft('')
    const data = await api<ChatMessage>(`${endpoint}/conversations/${conversation.uuid}/messages`, {
      method: 'POST',
      token,
      body: JSON.stringify({ body: body.trim() }),
    })
    setMessages((current) => {
      const next = [...current, data]
      const expectReply = conversation.handler !== 'human' && config?.ai_enabled !== false
      setTyping(expectReply && awaitingReply(next))
      return next
    })
  }

  async function send(event: FormEvent) {
    event.preventDefault()
    await sendBody(draft)
  }

  async function requestHuman() {
    if (!token || !conversation?.uuid || conversation.handler === 'human') return
    setTyping(false)
    const data = await api<Conversation>(`${endpoint}/conversations/${conversation.uuid}/handoff`, {
      method: 'POST',
      token,
      body: JSON.stringify({ reason: 'Visitor used the Talk to a person button.' }),
    })
    setConversation(data)
    setMessages(data.messages || [])
  }

  return (
    <div
      style={{
        ...palette,
        position: 'fixed',
        zIndex: 2147483000,
        bottom: 22,
        [side]: 22,
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: side === 'left' ? 'flex-start' : 'flex-end',
        gap: 14,
      }}
    >
      <style>{`@keyframes ud-lc-dot{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}`}</style>
      {open ? (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <div style={{ ...avatarStyle, background: 'linear-gradient(145deg, var(--ud-lc-accent), var(--ud-lc-surface-2))' }}>{initial}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 650, fontSize: 14, letterSpacing: '-0.02em' }}>{brand}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3, fontSize: 11, color: 'var(--ud-lc-muted)' }}>
                <span style={dotStyle} />
                {conversation?.handler === 'human'
                  ? conversation.assignee?.name
                    ? `${conversation.assignee.name} joined · human support`
                    : 'A teammate will reply here'
                  : config.ai_enabled === false
                    ? 'Support team'
                    : 'AI assistant · human help available'}
              </div>
            </div>
            <button type="button" aria-label="Close chat" onClick={() => setOpen(false)} style={iconBtnStyle}>
              <IconClose />
            </button>
          </div>
          <p style={greetingStyle}>{config.greeting}</p>
          {!token || !conversation ? (
            <form onSubmit={start} style={formStyle}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ud-lc-muted)', lineHeight: 1.5 }}>Leave your details and we’ll pick this up right away.</p>
              {config.collect_name ? (
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={fieldStyle} />
              ) : null}
              {config.collect_email ? (
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Work email" style={fieldStyle} />
              ) : null}
              {config.collect_phone ? (
                <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" style={fieldStyle} />
              ) : null}
              {error ? <div style={{ color: '#fb7185', fontSize: 12 }}>{error}</div> : null}
              <button type="submit" disabled={sending} style={{ ...ctaStyle, background: 'var(--ud-lc-accent)' }}>
                {sending ? 'Connecting…' : 'Start conversation'}
              </button>
            </form>
          ) : (
            <>
              <div ref={listRef} style={msgsStyle}>
                {messages.map((message) => {
                  const mine = message.role === 'visitor'
                  const sources = Array.isArray(message.meta?.sources)
                    ? message.meta.sources.filter((value): value is string => typeof value === 'string').slice(0, 3)
                    : []
                  return (
                    <div key={message.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                      <div
                        style={{
                          ...bubbleStyle,
                          background: mine ? 'var(--ud-lc-accent)' : 'var(--ud-lc-bubble)',
                          color: mine ? 'var(--ud-lc-on-accent)' : 'var(--ud-lc-on-bubble)',
                          borderBottomRightRadius: mine ? 6 : 16,
                          borderBottomLeftRadius: mine ? 16 : 6,
                        }}
                      >
                        {!mine && message.role !== 'system' ? (
                          <div
                            style={{
                              marginBottom: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              letterSpacing: '.08em',
                              textTransform: 'uppercase',
                              color: 'var(--ud-lc-accent)',
                              opacity: message.role === 'ai' ? 0.95 : 0.7,
                            }}
                          >
                            {message.role === 'ai' ? 'AI assistant' : 'Support agent'}
                          </div>
                        ) : null}
                        <div style={{ whiteSpace: 'pre-wrap' }}>{message.body}</div>
                        {sources.length ? <div style={{ marginTop: 7, fontSize: 10.5, color: 'var(--ud-lc-muted)' }}>Based on: {sources.join(', ')}</div> : null}
                      </div>
                    </div>
                  )
                })}
                {typing ? (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ ...bubbleStyle, background: 'var(--ud-lc-bubble)', color: 'var(--ud-lc-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ display: 'inline-flex', gap: 4 }}>
                        <i style={{ ...dotPulse, animationDelay: '0ms' }} />
                        <i style={{ ...dotPulse, animationDelay: '140ms' }} />
                        <i style={{ ...dotPulse, animationDelay: '280ms' }} />
                      </span>
                      {conversation.handler === 'ai' ? 'AI is checking the details' : 'Agent is typing'}
                    </div>
                  </div>
                ) : null}
              </div>
              {suggestions.length ? (
                <div style={suggestionsStyle}>
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void sendBody(suggestion)}
                      style={{ ...suggestionStyle, borderColor: 'color-mix(in srgb, var(--ud-lc-accent) 45%, transparent)' }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
              {config.ai_enabled !== false && conversation.handler !== 'human' ? (
                <button type="button" onClick={() => void requestHuman()} style={humanStyle}>
                  Talk to a person
                </button>
              ) : null}
              <form onSubmit={send} style={composerStyle}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write a message…"
                  style={{ ...fieldStyle, padding: '12px 14px' }}
                />
                <button type="submit" aria-label="Send" disabled={!draft.trim()} style={{ ...sendStyle, background: 'var(--ud-lc-accent)', opacity: draft.trim() ? 1 : 0.45 }}>
                  <IconSend />
                </button>
              </form>
            </>
          )}
        </div>
      ) : null}
      <button
        type="button"
        aria-label={open ? 'Close chat' : config.launcher_label || 'Open chat'}
        onClick={() => setOpen((value) => !value)}
        style={{ ...fabStyle, background: `linear-gradient(160deg, ${color} 0%, ${mixHex(color, '#000000', 0.45)} 130%)` }}
      >
        {open ? <IconClose size={20} /> : <LauncherIcon name={config.launcher_icon} />}
      </button>
    </div>
  )
}

const panelStyle: CSSProperties = {
  width: 'min(392px, calc(100vw - 28px))',
  height: 'min(580px, calc(100vh - 110px))',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: 24,
  color: 'var(--ud-lc-text)',
  background: 'linear-gradient(180deg, var(--ud-lc-surface), var(--ud-lc-surface-2))',
  border: '1px solid var(--ud-lc-line)',
  boxShadow: '0 28px 80px var(--ud-lc-shadow), 0 0 0 1px var(--ud-lc-soft), 0 0 40px color-mix(in srgb, var(--ud-lc-accent, #6366f1) 18%, transparent)',
  backdropFilter: 'blur(18px)',
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '16px 16px 12px',
}

const avatarStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 14,
  display: 'grid',
  placeItems: 'center',
  fontWeight: 700,
  fontSize: 15,
  color: 'var(--ud-lc-on-accent)',
  flex: 'none',
}

const dotStyle: CSSProperties = {
  width: 7,
  height: 7,
  borderRadius: 99,
  background: '#4ade80',
  boxShadow: '0 0 0 4px rgba(74,222,128,.15)',
}

const iconBtnStyle: CSSProperties = {
  width: 34,
  height: 34,
  border: 0,
  borderRadius: 10,
  background: 'var(--ud-lc-soft)',
  color: 'var(--ud-lc-text)',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
}

const greetingStyle: CSSProperties = {
  margin: '0 16px 12px',
  padding: '10px 12px',
  borderRadius: 14,
  background: 'var(--ud-lc-soft)',
  border: '1px solid var(--ud-lc-line)',
  fontSize: 13,
  lineHeight: 1.5,
  color: 'var(--ud-lc-muted)',
}

const formStyle: CSSProperties = {
  padding: '4px 16px 16px',
  display: 'grid',
  gap: 10,
}

const fieldStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid var(--ud-lc-line)',
  background: 'var(--ud-lc-field)',
  color: 'var(--ud-lc-text)',
  borderRadius: 12,
  padding: '11px 12px',
  font: 'inherit',
  fontSize: 14,
  outline: 'none',
}

const ctaStyle: CSSProperties = {
  border: 0,
  borderRadius: 12,
  padding: '12px 14px',
  color: 'var(--ud-lc-on-accent)',
  fontWeight: 650,
  fontSize: 14,
  cursor: 'pointer',
}

const msgsStyle: CSSProperties = {
  flex: 1,
  overflow: 'auto',
  padding: '4px 16px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

const bubbleStyle: CSSProperties = {
  maxWidth: '82%',
  padding: '9px 12px',
  borderRadius: 16,
  fontSize: 13.5,
  lineHeight: 1.45,
}

const dotPulse: CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 99,
  background: 'var(--ud-lc-muted)',
  display: 'inline-block',
  animation: 'ud-lc-dot 1s ease-in-out infinite',
}

const composerStyle: CSSProperties = {
  padding: 12,
  display: 'grid',
  gridTemplateColumns: '1fr 44px',
  gap: 8,
  borderTop: '1px solid var(--ud-lc-line)',
  background: 'var(--ud-lc-soft)',
}

const suggestionsStyle: CSSProperties = {
  padding: '0 12px 8px',
  display: 'flex',
  gap: 6,
  overflowX: 'auto',
}

const suggestionStyle: CSSProperties = {
  flex: 'none',
  border: '1px solid var(--ud-lc-line)',
  borderRadius: 999,
  background: 'var(--ud-lc-soft)',
  color: 'var(--ud-lc-text)',
  padding: '7px 10px',
  fontSize: 11.5,
  cursor: 'pointer',
}

const humanStyle: CSSProperties = {
  margin: '0 12px 8px',
  alignSelf: 'flex-start',
  border: 0,
  background: 'transparent',
  color: 'var(--ud-lc-muted)',
  fontSize: 11.5,
  textDecoration: 'underline',
  cursor: 'pointer',
}

const sendStyle: CSSProperties = {
  width: 44,
  height: 44,
  border: 0,
  borderRadius: 12,
  color: 'var(--ud-lc-on-accent)',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
}

const fabStyle: CSSProperties = {
  width: 60,
  height: 60,
  border: '1px solid var(--ud-lc-line)',
  borderRadius: 999,
  color: 'var(--ud-lc-on-accent)',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
  boxShadow: '0 16px 40px var(--ud-lc-shadow), 0 0 0 8px var(--ud-lc-soft)',
}
